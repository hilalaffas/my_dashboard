package com.mydashboard.budget;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRuleRepository extends JpaRepository<BudgetRule, UUID> {

    List<BudgetRule> findAllByOwnerId(UUID ownerId);

    Optional<BudgetRule> findByItemIdAndOwnerId(UUID itemId, UUID ownerId);
}
