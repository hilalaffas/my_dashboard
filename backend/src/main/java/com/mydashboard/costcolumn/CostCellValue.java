package com.mydashboard.costcolumn;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Nilai satu sel: kolom kustom x baris (item Accounts atau estimasi manual). Sel kosong tidak disimpan. */
@Entity
@Table(name = "cost_cell_values")
@Getter
@Setter
@NoArgsConstructor
public class CostCellValue {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "column_id", nullable = false, updatable = false)
    private UUID columnId;

    /** Nama enum RowType: ITEM atau ESTIMATE. */
    @Column(name = "row_type", nullable = false, updatable = false, length = 10)
    private String rowType;

    @Column(name = "row_id", nullable = false, updatable = false)
    private UUID rowId;

    /** Bentuk baku sesuai jenis kolom: angka polos, tanggal ISO, "true" untuk centang, dan seterusnya. */
    @Column(name = "cell_value", nullable = false, columnDefinition = "text")
    private String value;
}
