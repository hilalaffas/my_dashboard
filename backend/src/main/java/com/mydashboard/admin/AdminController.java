package com.mydashboard.admin;

import static com.mydashboard.admin.AdminDtos.*;

import com.mydashboard.account.AccountDtos.CategoryResponse;
import com.mydashboard.auth.AuthUser;
import com.mydashboard.costestimate.CostEstimateDtos.CostEstimateResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/** Khusus superuser (ADMIN). Membaca data pengguna lain, membuat akun, mengubah detail, dan mengatur status aktif. */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService service;

    @GetMapping
    public List<AdminUserResponse> users(@AuthenticationPrincipal AuthUser me) {
        return service.listUsers(me.id());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminUserResponse create(@AuthenticationPrincipal AuthUser me, @Valid @RequestBody CreateUserRequest req) {
        return service.createUser(me.id(), req);
    }

    @PutMapping("/{userId}")
    public AdminUserResponse update(
            @AuthenticationPrincipal AuthUser me, @PathVariable UUID userId, @Valid @RequestBody UpdateUserRequest req) {
        return service.updateUser(me.id(), userId, req);
    }

    // PUT (bukan PATCH): CORS di CorsConfig hanya mengizinkan GET, POST, PUT, DELETE
    @PutMapping("/{userId}/enabled")
    public AdminUserResponse setEnabled(
            @AuthenticationPrincipal AuthUser me, @PathVariable UUID userId, @Valid @RequestBody EnabledRequest req) {
        return service.setEnabled(me.id(), userId, req.enabled());
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
