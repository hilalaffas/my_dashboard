package com.mydashboard.admin;

import static com.mydashboard.admin.AdminDtos.*;

import com.mydashboard.account.AccountDtos.CategoryResponse;
import com.mydashboard.auth.AuthUser;
import com.mydashboard.costestimate.CostEstimateDtos.CostEstimateResponse;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/** Khusus superuser (ADMIN). Hanya membaca data pengguna lain. */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService service;

    @GetMapping
    public List<AdminUserResponse> users(@AuthenticationPrincipal AuthUser me) {
        return service.listUsers(me.id());
    }

    @GetMapping("/{userId}")
    public AdminUserResponse user(@AuthenticationPrincipal AuthUser me, @PathVariable UUID userId) {
        return service.getUser(me.id(), userId);
    }

    @GetMapping("/{userId}/accounts")
    public List<CategoryResponse> accounts(@AuthenticationPrincipal AuthUser me, @PathVariable UUID userId) {
        return service.accountsOf(me.id(), userId);
    }

    @GetMapping("/{userId}/cost-estimates")
    public List<CostEstimateResponse> costEstimates(@AuthenticationPrincipal AuthUser me, @PathVariable UUID userId) {
        return service.estimatesOf(me.id(), userId);
    }
}
