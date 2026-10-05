package com.mydashboard.overview;

import com.mydashboard.account.AccountDtos.AccountSummary;
import com.mydashboard.account.AccountService;
import com.mydashboard.costestimate.CostEstimateDtos.CostEstimateTotals;
import com.mydashboard.costestimate.CostEstimateService;
import com.mydashboard.overview.OverviewDtos.OverviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OverviewService {

    private final CostEstimateService costEstimates;
    private final AccountService accounts;

    public OverviewResponse overview() {
        CostEstimateTotals totals = costEstimates.totals();
        AccountSummary summary = accounts.summary();
        return new OverviewResponse(
                totals.debit(), totals.credit(), totals.credit().subtract(totals.debit()), totals.count(),
                summary.categories(), summary.subCategories(), summary.items(), summary.total());
    }
}
