package com.mydashboard.budget;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Satu hari cuti pribadi milik seorang pengguna. */
@Entity
@Table(name = "leave_days")
@Getter
@Setter
@NoArgsConstructor
public class LeaveDay {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "owner_id", nullable = false, updatable = false)
    private UUID ownerId;

    @Column(name = "leave_date", nullable = false, updatable = false)
    private LocalDate leaveDate;
}
