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
import java.util.Objects;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Akses superuser (role ADMIN): membaca data semua pengguna, membuat akun, mengubah detail akun, dan
 * mengaktifkan/menonaktifkan akun. Data keuangan milik pengguna lain sengaja hanya bisa DIBACA.
 * Akun superuser tidak bisa diubah atau dinonaktifkan lewat sini (mencegah terkunci dari sistem).
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

    /** Mengubah detail akun pengguna biasa. Nama, username, dan email diganti; password hanya bila diisi. */
    public AdminUserResponse updateUser(UUID adminId, UUID userId, UpdateUserRequest req) {
        assertSuperuser(adminId);
        User user = requireManageable(userId);

        String username = req.username().trim().toLowerCase(Locale.ROOT);
        if (!username.equals(user.getUsername()) && users.findByUsername(username).isPresent()) {
            throw new BadRequestException("Username sudah dipakai.");
        }

        String email = req.email() == null || req.email().isBlank() ? null : req.email().trim().toLowerCase(Locale.ROOT);
        if (email != null && users.findByEmail(email).filter(other -> !other.getId().equals(userId)).isPresent()) {
            throw new BadRequestException("Email sudah dipakai akun lain.");
        }
        if (!Objects.equals(email, user.getEmail())) {
            user.setEmail(email);
            user.setEmailVerified(false); // email yang diisi superuser belum pernah diverifikasi pemiliknya
            user.clearVerification();
        }

        user.setUsername(username);
        user.setFullName(req.fullName().trim());
        if (req.newPassword() != null && !req.newPassword().isBlank()) {
            user.setPasswordHash(encoder.encode(req.newPassword()));
        }
        try {
            return AdminUserResponse.from(users.saveAndFlush(user));
        } catch (DataIntegrityViolationException e) {
            throw new BadRequestException("Username atau email sudah dipakai.");
        }
    }

    /** Aktif/nonaktif berlaku seketika: JwtAuthFilter dan login memeriksa status ini ke database. */
    public AdminUserResponse setEnabled(UUID adminId, UUID userId, boolean enabled) {
        assertSuperuser(adminId);
        User user = requireManageable(userId);
        user.setEnabled(enabled);
        return AdminUserResponse.from(users.save(user));
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

    /** Pengguna yang boleh diubah superuser: bukan akun superuser (termasuk dirinya sendiri). */
    private User requireManageable(UUID id) {
        User user = requireUser(id);
        if (user.getRole() == Role.ADMIN) {
            throw new ForbiddenException("Akun superuser tidak dapat diubah dari sini.");
        }
        return user;
    }
}
