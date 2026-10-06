package com.mydashboard.admin;

import static com.mydashboard.admin.AdminDtos.*;

import com.mydashboard.account.AccountDtos.CategoryResponse;
import com.mydashboard.account.AccountService;
import com.mydashboard.common.exception.ForbiddenException;
import com.mydashboard.common.exception.NotFoundException;
import com.mydashboard.costestimate.CostEstimateDtos.CostEstimateResponse;
import com.mydashboard.costestimate.CostEstimateService;
import com.mydashboard.user.Role;
import com.mydashboard.user.User;
import com.mydashboard.user.UserRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

/**
 * Akses baca untuk superuser (role ADMIN) ke data semua pengguna.
 * Sengaja hanya BACA: superuser tidak bisa mengubah data milik pengguna lain.
 * Peran diperiksa ulang ke database pada setiap panggilan (bukan hanya dari token).
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository users;
    private final AccountService accounts;
    private final CostEstimateService estimates;

    public List<AdminUserResponse> listUsers(UUID adminId) {
        assertSuperuser(adminId);
        return users.findAll(Sort.by("username")).stream().map(AdminUserResponse::from).toList();
    }

    public AdminUserResponse getUser(UUID adminId, UUID userId) {
        assertSuperuser(adminId);
        return AdminUserResponse.from(requireUser(userId));
    }

    public List<CategoryResponse> accountsOf(UUID adminId, UUID userId) {
        assertSuperuser(adminId);
        requireUser(userId);
        return accounts.tree(userId);
    }

    public List<CostEstimateResponse> estimatesOf(UUID adminId, UUID userId) {
        assertSuperuser(adminId);
        requireUser(userId);
        return estimates.list(userId);
    }

    private void assertSuperuser(UUID id) {
        User user = users.findById(id).orElse(null);
        if (user == null || !user.isEnabled() || user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Hanya superuser yang boleh mengakses data pengguna lain.");
        }
    }

    private User requireUser(UUID id) {
        return users.findById(id).orElseThrow(() -> new NotFoundException("Pengguna tidak ditemukan."));
    }
}
