package com.mydashboard.budget;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Hari libur nasional atau cuti bersama. Data bersama untuk semua pengguna; hanya superuser yang mengubahnya. */
@Entity
@Table(name = "holidays")
@Getter
@Setter
@NoArgsConstructor
public class Holiday {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "holiday_date", nullable = false)
    private LocalDate holidayDate;

    @Column(nullable = false, length = 120)
    private String name;

    /** Nama enum HolidayKind: NATIONAL atau COLLECTIVE. */
    @Column(nullable = false, length = 12)
    private String kind;
}
