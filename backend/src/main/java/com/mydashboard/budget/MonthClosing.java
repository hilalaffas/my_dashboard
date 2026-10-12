package com.mydashboard.budget;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Penutupan satu bulan milik seorang pengguna. closingMonth selalu tanggal 1 bulan itu. */
@Entity
@Table(name = "month_closings")
@Getter
@Setter
@NoArgsConstructor
public class MonthClosing {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "owner_id", nullable = false, updatable = false)
    private UUID ownerId;

    @Column(name = "closing_month", nullable = false, updatable = false)
    private LocalDate closingMonth;

    @Column(name = "closed_at", insertable = false, updatable = false)
    private Instant closedAt;
}
