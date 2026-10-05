package com.mydashboard.auth;

import static com.mydashboard.auth.AuthDtos.*;

import com.mydashboard.common.exception.BadRequestException;
import com.mydashboard.common.exception.UnauthorizedException;
import com.mydashboard.user.User;
import com.mydashboard.user.UserRepository;
import jakarta.annotation.PostConstruct;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final LoginAttemptService attempts;

    @Value("${app.auth.registration-enabled:false}")
    private boolean registrationEnabled;

    @Value("${app.auth.google-client-id:}")
    private String googleClientId;

    /** Hash palsu agar waktu respons sama baik akun ada maupun tidak (mencegah enumerasi akun). */
    private String dummyHash;

    @PostConstruct
    void init() {
        dummyHash = encoder.encode("dummy-password-for-timing");
    }

    public AuthConfigResponse config() {
        return new AuthConfigResponse(registrationEnabled, googleClientId.isBlank() ? null : googleClientId);
    }

    @Transactional(readOnly = true)
    public LoginResult login(String identifier, String password, String clientIp) {
        String id = identifier.trim().toLowerCase(Locale.ROOT);
        String key = id + "|" + clientIp;
        attempts.checkAllowed(key);

        User user = (id.contains("@") ? users.findByEmail(id) : users.findByUsername(id)).orElse(null);
        boolean passwordOk = encoder.matches(password, user != null ? user.getPasswordHash() : dummyHash);
        if (user == null || !passwordOk || !user.isEnabled()) {
            attempts.recordFailure(key);
            throw new UnauthorizedException("Email/username atau password salah.");
        }
        attempts.reset(key);
        return new LoginResult(jwt.issue(user), UserResponse.from(user));
    }

    @Transactional(readOnly = true)
    public UserResponse me(UUID userId) {
        User user = users.findById(userId).orElseThrow(() -> new UnauthorizedException("Sesi tidak valid."));
        if (!user.isEnabled()) throw new UnauthorizedException("Akun dinonaktifkan.");
        return UserResponse.from(user);
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest req) {
        User user = users.findById(userId).orElseThrow(() -> new UnauthorizedException("Sesi tidak valid."));
        if (!encoder.matches(req.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Password saat ini salah.");
        }
        user.setPasswordHash(encoder.encode(req.newPassword()));
    }
}
