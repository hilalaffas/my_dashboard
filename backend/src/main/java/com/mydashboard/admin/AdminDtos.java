package com.mydashboard.admin;

import com.mydashboard.user.Role;
import com.mydashboard.user.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

    /**
     * Detail akun yang bisa diubah superuser. email kosong = hapus email; newPassword kosong = password tidak diubah.
     * Peran (role) sengaja tidak bisa diubah dari sini.
     */
    public record UpdateUserRequest(
            @NotBlank(message = "Nama lengkap wajib diisi.") @Size(max = 120, message = "Nama lengkap maksimal 120 karakter.") String fullName,
            @NotBlank(message = "Username wajib diisi.")
                    @Size(min = 3, max = 60, message = "Username 3 sampai 60 karakter.")
                    @Pattern(regexp = "^[A-Za-z0-9._-]+$", message = "Username hanya boleh huruf, angka, titik, garis bawah, dan strip.")
                    String username,
            @Email(message = "Format email tidak valid.") @Size(max = 160, message = "Email maksimal 160 karakter.") String email,
            @Size(min = 8, max = 72, message = "Password baru 8 sampai 72 karakter.") String newPassword) {}

    /** Mengaktifkan atau menonaktifkan akun. Boolean pembungkus agar field yang hilang ditolak, bukan dianggap false. */
    public record EnabledRequest(@NotNull(message = "Status wajib diisi.") Boolean enabled) {}

    /** Ringkasan pengguna untuk superuser. Tidak pernah memuat password maupun kode verifikasi. */
    public record AdminUserResponse(UUID id, String username, String email, String fullName, Role role, boolean enabled, boolean emailVerified) {
        public static AdminUserResponse from(User u) {
            return new AdminUserResponse(u.getId(), u.getUsername(), u.getEmail(), u.getFullName(), u.getRole(), u.isEnabled(), u.isEmailVerified());
        }
    }
}
