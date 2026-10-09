package com.mydashboard.budget;

import static com.mydashboard.budget.BudgetDtos.*;

import com.mydashboard.common.exception.BadRequestException;
import com.mydashboard.common.exception.NotFoundException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Pengelolaan daftar hari libur oleh superuser. Akses dibatasi di SecurityConfig (/api/admin/** khusus ADMIN). */
@Service
@RequiredArgsConstructor
@Transactional
public class HolidayService {

    private static final int MIN_YEAR = 2000;
    private static final int MAX_YEAR = 2100;

    private final HolidayRepository holidays;

    @Transactional(readOnly = true)
    public List<HolidayResponse> list(int year) {
        requireYear(year);
        return holidays.findAllByHolidayDateBetweenOrderByHolidayDate(LocalDate.of(year, 1, 1), LocalDate.of(year, 12, 31)).stream()
                .map(this::toResponse)
                .toList();
    }

    public HolidayResponse create(HolidayRequest req) {
        requireYear(req.date().getYear());
        if (holidays.findByHolidayDate(req.date()).isPresent()) throw new BadRequestException("Tanggal ini sudah terdaftar.");
        Holiday holiday = new Holiday();
        apply(holiday, req);
        return toResponse(holidays.save(holiday));
    }

    public HolidayResponse update(UUID id, HolidayRequest req) {
        requireYear(req.date().getYear());
        Holiday holiday = holidays.findById(id).orElseThrow(() -> new NotFoundException("Hari libur tidak ditemukan."));
        boolean taken = holidays.findByHolidayDate(req.date()).filter(other -> !other.getId().equals(id)).isPresent();
        if (taken) throw new BadRequestException("Tanggal ini sudah terdaftar.");
        apply(holiday, req);
        return toResponse(holiday);
    }

    public void delete(UUID id) {
        holidays.delete(holidays.findById(id).orElseThrow(() -> new NotFoundException("Hari libur tidak ditemukan.")));
    }

    private void apply(Holiday holiday, HolidayRequest req) {
        holiday.setHolidayDate(req.date());
        holiday.setName(req.name().trim());
        holiday.setKind(req.kind().name());
    }

    private HolidayResponse toResponse(Holiday h) {
        return new HolidayResponse(h.getId(), h.getHolidayDate(), h.getName(), HolidayKind.valueOf(h.getKind()));
    }

    private void requireYear(int year) {
        if (year < MIN_YEAR || year > MAX_YEAR) throw new BadRequestException("Tahun harus antara " + MIN_YEAR + " dan " + MAX_YEAR + ".");
    }
}
