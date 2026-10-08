package com.mydashboard.admin;

import com.mydashboard.user.Role;
import com.mydashboard.user.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public final class AdminDtos {

    private AdminDtos() {}

    /** Akun baru yang dibuat superuser: hanya username dan password. Nama lengkap diisi sama dengan username. */
    public record CreateUserRequest(
            @NotBlank(message = "Username wajib diisi.")
                    @Size(min = 3, max = 60, message = "Username 3 sampai 60 karakter.")
                    @Pattern(regexp = "^[A-Za-z0-9._-]+$", message = "Username hanya boleh huruf, angka, titik, garis bawah, dan strip.")
                    String username,
            @NotBlank(message = "Password wajib diisi.")
                    @Size(min = 8, max = 72, message = "Password 8 sampai 72 karakter.") String password) {}

    /** Ringkasan pengguna untuk superuser. Tidak pernah memuat password maupun kode verifikasi. */
    public record AdminUserResponse(UUID id, String username, String email, String fullName, Role role, boolean enabled, boolean emailVerified) {
        public static AdminUserResponse from(User u) {
            return new AdminUserResponse(u.getId(), u.getUsername(), u.getEmail(), u.getFullName(), u.getRole(), u.isEnabled(), u.isEmailVerified());
        }
    }
}
