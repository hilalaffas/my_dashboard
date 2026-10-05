package com.mydashboard.costestimate;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CostEstimateRepository extends JpaRepository<CostEstimate, UUID> {
    List<CostEstimate> findAllByOrderByCreatedAtAsc();
}
