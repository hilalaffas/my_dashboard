package com.mydashboard.budget;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyEntryRepository extends JpaRepository<DailyEntry, UUID> {

    List<DailyEntry> findAllByOwnerIdAndEntryDateBetweenOrderByEntryDate(UUID ownerId, LocalDate from, LocalDate to);

    Optional<DailyEntry> findByItemIdAndEntryDateAndOwnerId(UUID itemId, LocalDate entryDate, UUID ownerId);
}
