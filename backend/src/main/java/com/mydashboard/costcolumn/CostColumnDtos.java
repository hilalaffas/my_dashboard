package com.mydashboard.costcolumn;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public final class CostColumnDtos {

    private CostColumnDtos() {}

    public enum ColumnType { TEXT, NUMBER, CURRENCY, DATE, SELECT, CHECKBOX }

    /** ITEM = item Accounts, ESTIMATE = estimasi manual. */
    public enum RowType { ITEM, ESTIMATE }

    public record ColumnRequest(
            @NotBlank(message = "Nama kolom wajib diisi.") @Size(max = 60, message = "Nama kolom maksimal 60 karakter.") String name,
            @NotNull(message = "Jenis kolom wajib dipilih.") ColumnType type,
            @Size(max = 20, message = "Pilihan maksimal 20.") List<@Size(max = 60, message = "Satu pilihan maksimal 60 karakter.") String> options) {}

    /** Jenis kolom tidak bisa diganti (nilai yang sudah ada akan tidak cocok), hanya nama dan pilihan. */
    public record ColumnUpdateRequest(
            @NotBlank(message = "Nama kolom wajib diisi.") @Size(max = 60, message = "Nama kolom maksimal 60 karakter.") String name,
            @Size(max = 20, message = "Pilihan maksimal 20.") List<@Size(max = 60, message = "Satu pilihan maksimal 60 karakter.") String> options) {}

    public record OrderRequest(@NotNull(message = "Urutan wajib diisi.") @Size(max = 50) List<UUID> ids) {}

    /** value: teks, angka, atau boolean sesuai jenis kolom; null atau kosong = hapus nilai. */
    public record CellRequest(
            @NotNull(message = "Jenis baris wajib diisi.") RowType rowType,
            @NotNull(message = "Baris wajib diisi.") UUID rowId,
            Object value) {}

    public record ColumnResponse(UUID id, String name, ColumnType type, List<String> options, int position) {}

    public record CellValueResponse(UUID columnId, RowType rowType, UUID rowId, String value) {}

    public record TableMeta(List<ColumnResponse> columns, List<CellValueResponse> values) {}
}
