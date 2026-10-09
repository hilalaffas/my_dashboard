package com.mydashboard.budget;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HolidayRepository extends JpaRepository<Holiday, UUID> {

    List<Holiday> findAllByHolidayDateBetweenOrderByHolidayDate(LocalDate from, LocalDate to);

    Optional<Holiday> findByHolidayDate(LocalDate date);
}
