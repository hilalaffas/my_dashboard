package com.mydashboard.costcolumn;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Definisi satu kolom tambahan tabel Cost milik satu pengguna. */
@Entity
@Table(name = "cost_columns")
@Getter
@Setter
@NoArgsConstructor
public class CostColumn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "owner_id", nullable = false, updatable = false)
    private UUID ownerId;

    @Column(nullable = false, length = 60)
    private String name;

    /** Nama enum ColumnType. Jenis tidak bisa diubah setelah kolom dibuat. */
    @Column(nullable = false, updatable = false, length = 20)
    private String type;

    /** Hanya untuk jenis SELECT: daftar pilihan, satu per baris. */
    @Column(columnDefinition = "text")
    private String options;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}
