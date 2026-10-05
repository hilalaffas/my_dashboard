package com.mydashboard.auth;

import com.mydashboard.user.Role;
import com.mydashboard.user.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public final class AuthDtos {

    private AuthDtos() {}

    /** "username" boleh berisi username atau email. */
    public record LoginRequest(
            @NotBlank(message = "Email atau username wajib diisi.") @Size(max = 160) String username,
            @NotBlank(message = "Password wajib diisi.") @Size(max = 100) String password) {}

    public record RegisterRequest(
            @NotBlank(message = "Email wajib diisi.") @Email(message = "Format email tidak valid.") @Size(max = 160) String email,
            @NotBlank(message = "Password wajib diisi.")
                    @Size(min = 8, max = 100, message = "Password minimal 8 karakter.") String password) {}

    public record VerifyEmailRequest(
            @NotBlank(message = "Email wajib diisi.") @Email(message = "Format email tidak valid.") @Size(max = 160) String email,
            @NotBlank(message = "Kode wajib diisi.") @Pattern(regexp = "\\d{6}", message = "Kode harus 6 digit angka.") String code) {}

    public record ResendCodeRequest(
            @NotBlank(message = "Email wajib diisi.") @Email(message = "Format email tidak valid.") @Size(max = 160) String email) {}

    public record GoogleLoginRequest(@NotBlank(message = "Kredensial Google wajib diisi.") @Size(max = 4096) String credential) {}

    public record ChangePasswordRequest(
            @NotBlank(message = "Password saat ini wajib diisi.") @Size(max = 100) String currentPassword,
            @NotBlank(message = "Password baru wajib diisi.")
                    @Size(min = 8, max = 100, message = "Password baru minimal 8 karakter.") String newPassword) {}

    public record UserResponse(UUID id, String username, String fullName, Role role) {
        public static UserResponse from(User u) {
            return new UserResponse(u.getId(), u.getUsername(), u.getFullName(), u.getRole());
        }
    }

    /** Pengaturan publik untuk halaman login. googleClientId null bila login Google tidak aktif. */
    public record AuthConfigResponse(boolean registrationEnabled, String googleClientId) {}

    public record LoginResult(String token, UserResponse user) {}
}
