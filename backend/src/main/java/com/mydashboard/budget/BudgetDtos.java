package com.mydashboard.budget;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class BudgetDtos {

    private BudgetDtos() {}

    public enum Unit { DAY, WORKDAY, WEEK }

    public enum Basis { RATE, FORECAST }

    public enum HolidayKind { NATIONAL, COLLECTIVE }

    /** AUTO = terpotong otomatis sesuai jadwal; MANUAL = pengeluaran nyata diisi pengguna tiap hari. */
    public enum Mode { AUTO, MANUAL }

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

    /** rate wajib bila basis RATE; weekDay hanya dipakai bila unit WEEK (kosong = Senin); mode kosong = tidak diubah (baru = AUTO). */
    public record RuleRequest(
            @NotNull(message = "Satuan hitung wajib dipilih.") Unit unit,
            @NotNull(message = "Dasar tarif wajib dipilih.") Basis basis,
            @DecimalMin(value = "0", message = "Tarif tidak boleh negatif.") BigDecimal rate,
            @Min(value = 1, message = "Hari minggu 1 sampai 7.") @Max(value = 7, message = "Hari minggu 1 sampai 7.") Integer weekDay,
            Mode mode) {}

    public record RuleResponse(UUID itemId, Unit unit, Basis basis, BigDecimal rate, int weekDay, Mode mode) {}

    /** amount kosong = hapus catatan (kembali ke jadwal pada mode AUTO, belum diisi pada mode MANUAL); 0 = tidak ada pengeluaran. */
    public record EntryRequest(
            @NotNull(message = "Item wajib diisi.") UUID itemId,
            @NotNull(message = "Tanggal wajib diisi.") LocalDate date,
            @DecimalMin(value = "0", message = "Jumlah tidak boleh negatif.") BigDecimal amount) {}

    public record EntryResponse(UUID itemId, LocalDate date, BigDecimal amount) {}

    /** Banyak catatan sekaligus dalam satu transaksi (mis. "isi semua sesuai rencana"). */
    public record BatchEntryRequest(
            @NotNull(message = "Catatan wajib diisi.") @Size(min = 1, max = 400, message = "Kirim 1 sampai 400 catatan.") List<@Valid EntryRequest> entries) {}

    public record ClosingItemRequest(
            @NotNull(message = "Item wajib diisi.") UUID itemId,
            @NotBlank(message = "Nama item wajib diisi.") @Size(max = 120, message = "Nama item maksimal 120 karakter.") String itemName,
            @NotBlank(message = "Nama kategori wajib diisi.") @Size(max = 120, message = "Nama kategori maksimal 120 karakter.") String categoryName,
            @NotBlank(message = "Nama sub kategori wajib diisi.") @Size(max = 120, message = "Nama sub kategori maksimal 120 karakter.") String subName,
            @NotNull(message = "Mode wajib diisi.") Mode mode,
            @NotNull(message = "Anggaran wajib diisi.") @DecimalMin(value = "0", message = "Anggaran tidak boleh negatif.") BigDecimal budget,
            @NotNull(message = "Rencana wajib diisi.") @DecimalMin(value = "0", message = "Rencana tidak boleh negatif.") BigDecimal plannedToDate,
            @NotNull(message = "Aktual wajib diisi.") @DecimalMin(value = "0", message = "Aktual tidak boleh negatif.") BigDecimal actual) {}

    /** month berformat YYYY-MM. */
    public record ClosingRequest(
            @NotNull(message = "Bulan wajib diisi.") @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$", message = "Format bulan harus YYYY-MM.") String month,
            @NotNull(message = "Item wajib diisi.") @Size(min = 1, max = 200, message = "Kirim 1 sampai 200 item.") List<@Valid ClosingItemRequest> items) {}

    public record ClosingItemResponse(
            UUID itemId, String itemName, String categoryName, String subName, Mode mode,
            BigDecimal budget, BigDecimal plannedToDate, BigDecimal actual) {}

    public record ClosingResponse(String month, Instant closedAt, List<ClosingItemResponse> items) {}
}
