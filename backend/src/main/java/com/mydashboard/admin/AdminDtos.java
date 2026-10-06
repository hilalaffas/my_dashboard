package com.mydashboard.admin;

import com.mydashboard.user.Role;
import com.mydashboard.user.User;
import java.util.UUID;

public final class AdminDtos {

    private AdminDtos() {}

    /** Ringkasan pengguna untuk superuser. Tidak pernah memuat password maupun kode verifikasi. */
    public record AdminUserResponse(UUID id, String username, String email, String fullName, Role role, boolean enabled, boolean emailVerified) {
        public static AdminUserResponse from(User u) {
            return new AdminUserResponse(u.getId(), u.getUsername(), u.getEmail(), u.getFullName(), u.getRole(), u.isEnabled(), u.isEmailVerified());
        }
    }
}
