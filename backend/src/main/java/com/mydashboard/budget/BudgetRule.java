package com.mydashboard.budget;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Aturan hitung sebuah item Accounts (satu aturan per item). Item tanpa aturan memakai nominal bulanan tetap. */
@Entity
@Table(name = "budget_rules")
@Getter
@Setter
@NoArgsConstructor
public class BudgetRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "owner_id", nullable = false, updatable = false)
    private UUID ownerId;

    @Column(name = "item_id", nullable = false, updatable = false)
    private UUID itemId;

    /** Nama enum Unit: DAY, WORKDAY, atau WEEK. */
    @Column(nullable = false, length = 10)
    private String unit;

    /** Nama enum Basis: RATE atau FORECAST. */
    @Column(nullable = false, length = 10)
    private String basis;

    /** Tarif per satuan; wajib bila basis RATE, kosong bila FORECAST. */
    @Column(precision = 15, scale = 2)
    private BigDecimal rate;

    /** Untuk unit WEEK: hari penarikan, 1 = Senin sampai 7 = Minggu. */
    @Column(name = "week_day", nullable = false)
    private int weekDay = 1;
}
