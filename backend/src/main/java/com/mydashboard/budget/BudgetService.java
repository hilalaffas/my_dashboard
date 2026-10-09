package com.mydashboard.budget;

import static com.mydashboard.budget.BudgetDtos.*;

import com.mydashboard.account.ItemRepository;
import com.mydashboard.common.exception.BadRequestException;
import com.mydashboard.common.exception.NotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Kalender anggaran milik pengguna: hari libur (bersama), cuti pribadi, dan aturan hitung per item.
 * Perhitungan jumlah hari kerja dan anggaran bulanan dilakukan di frontend dari data mentah ini.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class BudgetService {

    private static final int MIN_YEAR = 2000;
    private static final int MAX_YEAR = 2100;
    private static final BigDecimal MAX_RATE = new BigDecimal("1000000000000");

    private final HolidayRepository holidays;
    private final LeaveDayRepository leaves;
    private final BudgetRuleRepository rules;
    private final ItemRepository items;

    @Transactional(readOnly = true)
    public CalendarResponse calendar(UUID ownerId, int year) {
        requireYear(year);
        LocalDate from = LocalDate.of(year, 1, 1);
        LocalDate to = LocalDate.of(year, 12, 31);
        List<HolidayResponse> holidayList = holidays.findAllByHolidayDateBetweenOrderByHolidayDate(from, to).stream()
                .map(h -> new HolidayResponse(h.getId(), h.getHolidayDate(), h.getName(), HolidayKind.valueOf(h.getKind())))
                .toList();
        List<LocalDate> leaveList = leaves.findAllByOwnerIdAndLeaveDateBetweenOrderByLeaveDate(ownerId, from, to).stream()
                .map(LeaveDay::getLeaveDate)
                .toList();
        return new CalendarResponse(year, holidayList, leaveList);
    }

    /** Menandai atau menghapus tanda cuti untuk sekumpulan tanggal. Tanggal yang sudah sesuai dilewati. */
    public void setLeave(UUID ownerId, LeaveRequest req) {
        Set<LocalDate> wanted = new HashSet<>();
        for (LocalDate date : req.dates()) {
            requireYear(date.getYear());
            wanted.add(date);
        }
        List<LeaveDay> existing = leaves.findAllByOwnerIdAndLeaveDateIn(ownerId, wanted);
        if (req.leave()) {
            Set<LocalDate> already = new HashSet<>();
            for (LeaveDay leave : existing) already.add(leave.getLeaveDate());
            for (LocalDate date : wanted) {
                if (already.contains(date)) continue;
                LeaveDay leave = new LeaveDay();
                leave.setOwnerId(ownerId);
                leave.setLeaveDate(date);
                leaves.save(leave);
            }
        } else {
            leaves.deleteAll(existing);
        }
    }

    @Transactional(readOnly = true)
    public List<RuleResponse> rules(UUID ownerId) {
        return rules.findAllByOwnerId(ownerId).stream().map(this::toRule).toList();
    }

    /** Membuat atau mengganti aturan sebuah item. Item harus milik pengguna ini. */
    public RuleResponse saveRule(UUID ownerId, UUID itemId, RuleRequest req) {
        items.findOwned(itemId, ownerId).orElseThrow(() -> new NotFoundException("Item tidak ditemukan."));

        BigDecimal rate = null;
        if (req.basis() == Basis.RATE) {
            if (req.rate() == null) throw new BadRequestException("Tarif wajib diisi.");
            if (req.rate().compareTo(MAX_RATE) >= 0) throw new BadRequestException("Tarif terlalu besar.");
            rate = req.rate();
        }

        BudgetRule rule = rules.findByItemIdAndOwnerId(itemId, ownerId).orElseGet(() -> {
            BudgetRule created = new BudgetRule();
            created.setOwnerId(ownerId);
            created.setItemId(itemId);
            return created;
        });
        rule.setUnit(req.unit().name());
        rule.setBasis(req.basis().name());
        rule.setRate(rate);
        rule.setWeekDay(req.weekDay() == null ? 1 : req.weekDay());
        return toRule(rules.save(rule));
    }

    /** Menghapus aturan: item kembali memakai nominal bulanan tetap. Tidak error bila aturan memang tidak ada. */
    public void deleteRule(UUID ownerId, UUID itemId) {
        rules.findByItemIdAndOwnerId(itemId, ownerId).ifPresent(rules::delete);
    }

    private RuleResponse toRule(BudgetRule r) {
        return new RuleResponse(r.getItemId(), Unit.valueOf(r.getUnit()), Basis.valueOf(r.getBasis()), r.getRate(), r.getWeekDay());
    }

    private void requireYear(int year) {
        if (year < MIN_YEAR || year > MAX_YEAR) throw new BadRequestException("Tahun harus antara " + MIN_YEAR + " dan " + MAX_YEAR + ".");
    }
}
