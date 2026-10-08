package com.mydashboard.admin;

import static com.mydashboard.admin.AdminDtos.*;

import com.mydashboard.account.AccountDtos.CategoryResponse;
import com.mydashboard.account.AccountService;
import com.mydashboard.common.exception.BadRequestException;
import com.mydashboard.common.exception.ForbiddenException;
import com.mydashboard.common.exception.NotFoundException;
import com.mydashboard.costestimate.CostEstimateDtos.CostEstimateResponse;
import com.mydashboard.costestimate.CostEstimateService;
import com.mydashboard.user.Role;
import com.mydashboard.user.User;
import com.mydashboard.user.UserRepository;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Akses superuser (role ADMIN): membaca data semua pengguna dan membuat akun baru.
 * Data milik pengguna lain sengaja hanya bisa DIBACA: superuser tidak bisa mengubahnya.
 * Peran diperiksa ulang ke database pada setiap panggilan (bukan hanya dari token).
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository users;
    private final AccountService accounts;
    private final CostEstimateService estimates;
    private final PasswordEncoder encoder;

    public List<AdminUserResponse> listUsers(UUID adminId) {
        assertSuperuser(adminId);
        return users.findAll(Sort.by("username")).stream().map(AdminUserResponse::from).toList();
    }

    public AdminUserResponse getUser(UUID adminId, UUID userId) {
        assertSuperuser(adminId);
        return AdminUserResponse.from(requireUser(userId));
    }

    /** Membuat akun pengguna biasa (role USER) yang langsung aktif; tidak perlu verifikasi email. */
    public AdminUserResponse createUser(UUID adminId, CreateUserRequest req) {
        assertSuperuser(adminId);
        String username = req.username().trim().toLowerCase(Locale.ROOT);
        if (users.findByUsername(username).isPresent()) throw new BadRequestException("Username sudah dipakai.");

        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(encoder.encode(req.password()));
        user.setFullName(username);
        user.setRole(Role.USER);
        user.setEnabled(true);
        try {
            return AdminUserResponse.from(users.saveAndFlush(user));
        } catch (DataIntegrityViolationException e) {
            // Dua permintaan dengan username sama pada saat bersamaan: batas unik di database yang menang
            throw new BadRequestException("Username sudah dipakai.");
        }
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
