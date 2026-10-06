package com.mydashboard.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class ProfileDtos {

    private ProfileDtos() {}

    /** Hanya nama lengkap yang bisa diubah; email dan username tidak. */
    public record ProfileRequest(@NotBlank(message = "Nama lengkap wajib diisi.") @Size(max = 120) String fullName) {}

    public record ProfileResponse(String username, String fullName, String email) {}
}
