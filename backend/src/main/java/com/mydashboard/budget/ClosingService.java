package com.mydashboard.budget;

import static com.mydashboard.budget.BudgetDtos.*;

import com.mydashboard.common.exception.BadRequestException;
import com.mydashboard.common.exception.NotFoundException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Penutupan bulan: membekukan angka rekonsiliasi sebuah bulan yang sudah berakhir. Angka dihitung di frontend dari
 * aturan, kalender, dan catatan harian pada saat penutupan; server menyimpannya apa adanya milik pengguna itu.
 * Catatan harian pada bulan tertutup dikunci oleh BudgetService.saveEntry.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ClosingService {

    private final MonthClosingRepository closings;
    private final MonthClosingItemRepository closingItems;

    @Transactional(readOnly = true)
    public List<ClosingResponse> list(UUID ownerId) {
        List<MonthClosing> mine = closings.findAllByOwnerIdOrderByClosingMonthDesc(ownerId);
        if (mine.isEmpty()) return List.of();
        Map<UUID, List<MonthClosingItem>> byClosing = new HashMap<>();
        List<UUID> ids = mine.stream().map(MonthClosing::getId).toList();
        for (MonthClosingItem item : closingItems.findAllByClosingIdIn(ids)) {
            byClosing.computeIfAbsent(item.getClosingId(), key -> new ArrayList<>()).add(item);
        }
        return mine.stream().map(c -> toResponse(c, byClosing.getOrDefault(c.getId(), List.of()))).toList();
    }

    /** Hanya bulan yang sudah berakhir yang bisa ditutup, dan satu bulan hanya sekali. */
    public ClosingResponse close(UUID ownerId, ClosingRequest req) {
        LocalDate first = parseMonth(req.month());
        if (!first.isBefore(YearMonth.now().atDay(1))) {
            throw new BadRequestException("Hanya bulan yang sudah berakhir yang bisa ditutup.");
        }
        if (closings.existsByOwnerIdAndClosingMonth(ownerId, first)) {
            throw new BadRequestException("Bulan ini sudah ditutup.");
        }

        MonthClosing closing = new MonthClosing();
        closing.setOwnerId(ownerId);
        closing.setClosingMonth(first);
        MonthClosing saved = closings.saveAndFlush(closing);

        List<MonthClosingItem> saveItems = new ArrayList<>();
        for (ClosingItemRequest r : req.items()) {
            MonthClosingItem item = new MonthClosingItem();
            item.setClosingId(saved.getId());
            item.setItemId(r.itemId());
            item.setItemName(r.itemName().trim());
            item.setCategoryName(r.categoryName().trim());
            item.setSubName(r.subName().trim());
            item.setMode(r.mode().name());
            item.setBudget(r.budget());
            item.setPlannedToDate(r.plannedToDate());
            item.setActual(r.actual());
            saveItems.add(item);
        }
        List<MonthClosingItem> savedItems = closingItems.saveAll(saveItems);
        return toResponse(saved, savedItems);
    }

    /** Membuka kembali bulan yang ditutup: angka beku dihapus dan catatan harian bisa diubah lagi. */
    public void reopen(UUID ownerId, String month) {
        LocalDate first = parseMonth(month);
        MonthClosing closing = closings.findByOwnerIdAndClosingMonth(ownerId, first)
                .orElseThrow(() -> new NotFoundException("Bulan ini belum ditutup."));
        closings.delete(closing); // baris closing_items ikut terhapus oleh on delete cascade
    }

    private LocalDate parseMonth(String month) {
        try {
            return YearMonth.parse(month).atDay(1);
        } catch (DateTimeParseException e) {
            throw new BadRequestException("Format bulan harus YYYY-MM.");
        }
    }

    private ClosingResponse toResponse(MonthClosing c, List<MonthClosingItem> items) {
        List<ClosingItemResponse> itemResponses = items.stream()
                .map(i -> new ClosingItemResponse(
                        i.getItemId(), i.getItemName(), i.getCategoryName(), i.getSubName(),
                        Mode.valueOf(i.getMode()), i.getBudget(), i.getPlannedToDate(), i.getActual()))
                .toList();
        return new ClosingResponse(YearMonth.from(c.getClosingMonth()).toString(), c.getClosedAt(), itemResponses);
    }
}
