package com.mydashboard.budget;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MonthClosingItemRepository extends JpaRepository<MonthClosingItem, UUID> {

    List<MonthClosingItem> findAllByClosingIdIn(Collection<UUID> closingIds);
}
