package com.mydashboard.budget;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MonthClosingRepository extends JpaRepository<MonthClosing, UUID> {

    List<MonthClosing> findAllByOwnerIdOrderByClosingMonthDesc(UUID ownerId);

    Optional<MonthClosing> findByOwnerIdAndClosingMonth(UUID ownerId, LocalDate closingMonth);

    boolean existsByOwnerIdAndClosingMonth(UUID ownerId, LocalDate closingMonth);
}
