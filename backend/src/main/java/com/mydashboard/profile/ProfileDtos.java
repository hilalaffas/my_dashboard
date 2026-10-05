package com.mydashboard.profile;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class ProfileDtos {

    private ProfileDtos() {}

    public record ProfileRequest(
            @NotBlank(message = "Nama lengkap wajib diisi.") @Size(max = 120) String fullName,
            @NotBlank(message = "Email wajib diisi.") @Email(message = "Format email tidak valid.") @Size(max = 160) String email) {}

    public record ProfileResponse(String fullName, String email) {}
}
