package com.mydashboard.auth;

import static com.mydashboard.auth.AuthDtos.*;

import com.mydashboard.auth.GoogleTokenVerifier.GoogleProfile;
import com.mydashboard.common.exception.ForbiddenException;
import com.mydashboard.common.exception.UnauthorizedException;
import com.mydashboard.user.Role;
import com.mydashboard.user.User;
import com.mydashboard.user.UserRepository;
import com.mydashboard.user.UserService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final UserRepository users;
    private final UserService userService;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final GoogleTokenVerifier verifier;

    @Value("${app.auth.registration-enabled:false}")
    private boolean registrationEnabled;

    @Transactional
    public LoginResult login(String credential) {
        GoogleProfile profile = verifier.verify(credential);
        User user = users.findByEmail(profile.email()).orElse(null);

        if (user == null) {
            if (!registrationEnabled) throw new ForbiddenException("Akun belum terdaftar. Hubungi admin sistem.");
            user = new User();
            user.setEmail(profile.email());
            user.setUsername(userService.uniqueUsername(profile.email()));
            String name = profile.name();
            user.setFullName(name == null || name.isBlank() ? userService.localPart(profile.email()) : name.trim());
            user.setRole(Role.USER);
            user.setPasswordHash(encoder.encode(UUID.randomUUID().toString()));
            user.setEnabled(true);
        } else if (!user.isEmailVerified()) {
            // Email kini terbukti milik pengguna Google ini. Password dari pendaftaran yang belum terverifikasi
            // dibuang agar tidak bisa dipakai pihak yang mendaftarkan email orang lain lebih dulu.
            user.setPasswordHash(encoder.encode(UUID.randomUUID().toString()));
            user.clearVerification();
            user.setEnabled(true);
        } else if (!user.isEnabled()) {
            throw new UnauthorizedException("Akun dinonaktifkan.");
        }
        user.setEmailVerified(true);
        users.save(user);
        return new LoginResult(jwt.issue(user), UserResponse.from(user));
    }
}
