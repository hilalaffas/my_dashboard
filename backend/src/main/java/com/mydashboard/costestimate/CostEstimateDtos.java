package com.mydashboard.costestimate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public final class CostEstimateDtos {

    private CostEstimateDtos() {}

    public record CostEstimateRequest(
            @NotBlank(message = "Type wajib diisi.") @Size(max = 80) String type,
            @NotBlank(message = "Detail wajib diisi.") @Size(max = 120) String detail,
            @NotNull(message = "Debit wajib diisi.") @PositiveOrZero(message = "Debit tidak boleh negatif.") BigDecimal debit,
            @NotNull(message = "Credit wajib diisi.") @PositiveOrZero(message = "Credit tidak boleh negatif.") BigDecimal credit) {}

    public record CostEstimateResponse(UUID id, String type, String detail, BigDecimal debit, BigDecimal credit) {}

    public record CostEstimateTotals(BigDecimal debit, BigDecimal credit, long count) {}
}
