package com.mydashboard.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public final class AccountDtos {

    private AccountDtos() {}

    public record NameRequest(@NotBlank(message = "Nama wajib diisi.") @Size(max = 120) String name) {}

    public record ItemRequest(
            @NotBlank(message = "Nama wajib diisi.") @Size(max = 120) String name,
            @NotNull(message = "Nominal wajib diisi.") @PositiveOrZero(message = "Nominal tidak boleh negatif.") BigDecimal amount) {}

    public record ItemResponse(UUID id, String name, BigDecimal amount) {}

    public record SubResponse(UUID id, String name, List<ItemResponse> items) {}

    public record CategoryResponse(UUID id, String name, List<SubResponse> subs) {}

    public record AccountSummary(int categories, int subCategories, int items, BigDecimal total) {}
}
