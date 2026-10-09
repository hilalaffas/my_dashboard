package com.mydashboard.costcolumn;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CostCellValueRepository extends JpaRepository<CostCellValue, UUID> {

    List<CostCellValue> findAllByColumnIdIn(Collection<UUID> columnIds);

    Optional<CostCellValue> findByColumnIdAndRowTypeAndRowId(UUID columnId, String rowType, UUID rowId);
}
