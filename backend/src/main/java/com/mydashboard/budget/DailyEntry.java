package com.mydashboard.budget;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Pengeluaran nyata sebuah item pada satu tanggal (atau koreksi atas potongan otomatis). */
@Entity
@Table(name = "daily_entries")
@Getter
@Setter
@NoArgsConstructor
public class DailyEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "owner_id", nullable = false, updatable = false)
    private UUID ownerId;

    @Column(name = "item_id", nullable = false, updatable = false)
    private UUID itemId;

    @Column(name = "entry_date", nullable = false, updatable = false)
    private LocalDate entryDate;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;
}
