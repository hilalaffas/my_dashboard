package com.mydashboard.budget;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Angka beku satu item pada bulan yang ditutup. */
@Entity
@Table(name = "month_closing_items")
@Getter
@Setter
@NoArgsConstructor
public class MonthClosingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "closing_id", nullable = false, updatable = false)
    private UUID closingId;

    @Column(name = "item_id", nullable = false, updatable = false)
    private UUID itemId;

    @Column(name = "item_name", nullable = false, length = 120)
    private String itemName;

    @Column(name = "category_name", nullable = false, length = 120)
    private String categoryName;

    @Column(name = "sub_name", nullable = false, length = 120)
    private String subName;

    @Column(nullable = false, length = 6)
    private String mode;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal budget;

    @Column(name = "planned_to_date", nullable = false, precision = 15, scale = 2)
    private BigDecimal plannedToDate;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal actual;
}
