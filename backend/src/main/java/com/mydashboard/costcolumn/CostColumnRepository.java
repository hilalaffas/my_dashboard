package com.mydashboard.costcolumn;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CostColumnRepository extends JpaRepository<CostColumn, UUID> {

    List<CostColumn> findAllByOwnerIdOrderBySortOrderAscCreatedAtAsc(UUID ownerId);

    Optional<CostColumn> findByIdAndOwnerId(UUID id, UUID ownerId);

    long countByOwnerId(UUID ownerId);
}
