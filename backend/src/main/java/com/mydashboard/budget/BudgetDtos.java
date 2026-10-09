package com.mydashboard.budget;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class BudgetDtos {

    private BudgetDtos() {}

    public enum Unit { DAY, WORKDAY, WEEK }

    public enum Basis { RATE, FORECAST }

    public enum HolidayKind { NATIONAL, COLLECTIVE }

    public record HolidayRequest(
            @NotNull(message = "Tanggal wajib diisi.") LocalDate date,
            @NotBlank(message = "Nama libur wajib diisi.") @Size(max = 120, message = "Nama libur maksimal 120 karakter.") String name,
            @NotNull(message = "Jenis libur wajib dipilih.") HolidayKind kind) {}

    public record HolidayResponse(UUID id, LocalDate date, String name, HolidayKind kind) {}

    /** leave = true menandai tanggal sebagai cuti, false menghapus tandanya. */
    public record LeaveRequest(
            @NotNull(message = "Tanggal wajib diisi.") @Size(min = 1, max = 62, message = "Pilih 1 sampai 62 tanggal.") List<@NotNull LocalDate> dates,
            @NotNull(message = "Status cuti wajib diisi.") Boolean leave) {}

    /** Hari libur setahun penuh (data bersama) dan hari cuti milik pengguna pada tahun itu. */
    public record CalendarResponse(int year, List<HolidayResponse> holidays, List<LocalDate> leaveDays) {}

    /** rate wajib bila basis RATE; weekDay hanya dipakai bila unit WEEK (kosong = Senin). */
    public record RuleRequest(
            @NotNull(message = "Satuan hitung wajib dipilih.") Unit unit,
            @NotNull(message = "Dasar tarif wajib dipilih.") Basis basis,
            @DecimalMin(value = "0", message = "Tarif tidak boleh negatif.") BigDecimal rate,
            @Min(value = 1, message = "Hari minggu 1 sampai 7.") @Max(value = 7, message = "Hari minggu 1 sampai 7.") Integer weekDay) {}

    public record RuleResponse(UUID itemId, Unit unit, Basis basis, BigDecimal rate, int weekDay) {}
}
