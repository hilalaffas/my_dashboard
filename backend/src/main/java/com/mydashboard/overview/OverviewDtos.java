package com.mydashboard.overview;

import java.math.BigDecimal;

public final class OverviewDtos {

    private OverviewDtos() {}

    public record OverviewResponse(
            BigDecimal totalDebit, BigDecimal totalCredit, BigDecimal netEstimate, long lineItems,
            int categories, int subCategories, int items, BigDecimal accountTotal) {}
}
