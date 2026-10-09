package com.mydashboard.budget;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveDayRepository extends JpaRepository<LeaveDay, UUID> {

    List<LeaveDay> findAllByOwnerIdAndLeaveDateBetweenOrderByLeaveDate(UUID ownerId, LocalDate from, LocalDate to);

    List<LeaveDay> findAllByOwnerIdAndLeaveDateIn(UUID ownerId, Collection<LocalDate> dates);
}
