package com.mydashboard.auth;

import static com.mydashboard.auth.AuthDtos.*;

import com.mydashboard.common.exception.BadRequestException;
import com.mydashboard.common.exception.ForbiddenException;
import com.mydashboard.common.exception.TooManyAttemptsException;
import com.mydashboard.user.Role;
import com.mydashboard.user.User;
import com.mydashboard.user.UserRepository;
import com.mydashboard.user.UserService;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Pendaftaran mandiri dengan verifikasi email (kode 6 digit). */
@Service
@RequiredArgsConstructor
public class RegistrationService {

    private static final Duration CODE_TTL = Duration.ofMinutes(10);
    private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(60);
    private static final int MAX_CODE_ATTEMPTS = 5;
    private static final String INVALID_CODE = "Kode tidak valid atau sudah kedaluwarsa.";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository users;
    private final UserService userService;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final MailService mail;
    private final LoginAttemptService attempts;

    @Value("${app.auth.registration-enabled:false}")
    private boolean registrationEnabled;

    @Transactional
    public void register(String email, String password, String clientIp) {
        if (!registrationEnabled) throw new ForbiddenException("Pendaftaran sedang ditutup. Hubungi admin sistem.");
        limit("register|" + clientIp);

        String normalized = userService.normalizeEmail(email);
        User user = users.findByEmail(normalized).orElse(null);
        if (user != null && user.isEmailVerified()) throw new BadRequestException("Email sudah terdaftar. Silakan masuk.");
        if (user == null) {
            user = new User();
            user.setEmail(normalized);
            user.setUsername(userService.uniqueUsername(normalized));
            user.setFullName(userService.localPart(normalized));
            user.setRole(Role.USER);
        }
        // Pendaftaran yang belum terverifikasi boleh diulang: password dan kode diganti dengan yang baru
        user.setPasswordHash(encoder.encode(password));
        user.setEnabled(false);
        user.setEmailVerified(false);
        String code = issueCode(user);
        users.save(user);
        mail.sendVerificationCode(normalized, code);
    }

    @Transactional
    public void resend(String email, String clientIp) {
        limit("resend|" + clientIp);
        User user = users.findByEmail(userService.normalizeEmail(email)).orElse(null);
        // Tidak membocorkan apakah email terdaftar: kasus tak relevan diam-diam diabaikan
        if (user == null || user.isEmailVerified()) return;
        Instant sentAt = user.getVerificationSentAt();
        if (sentAt != null && Instant.now().isBefore(sentAt.plus(RESEND_COOLDOWN))) {
            throw new TooManyAttemptsException("Tunggu 1 menit sebelum meminta kode baru.");
        }
        String code = issueCode(user);
        users.save(user);
        mail.sendVerificationCode(user.getEmail(), code);
    }

    /** noRollbackFor: jumlah percobaan yang salah harus tetap tersimpan walau permintaan ditolak. */
    @Transactional(noRollbackFor = BadRequestException.class)
    public LoginResult verify(String email, String code) {
        User user = users.findByEmail(userService.normalizeEmail(email)).orElseThrow(() -> new BadRequestException(INVALID_CODE));
        boolean usable = !user.isEmailVerified()
                && user.getVerificationCodeHash() != null
                && user.getVerificationExpiresAt() != null
                && Instant.now().isBefore(user.getVerificationExpiresAt())
                && user.getVerificationAttempts() < MAX_CODE_ATTEMPTS;
        if (!usable) throw new BadRequestException(INVALID_CODE);
        if (!encoder.matches(code, user.getVerificationCodeHash())) {
            user.setVerificationAttempts(user.getVerificationAttempts() + 1);
            throw new BadRequestException(INVALID_CODE);
        }
        user.setEmailVerified(true);
        user.setEnabled(true);
        user.clearVerification();
        return new LoginResult(jwt.issue(user), UserResponse.from(user));
    }

    private void limit(String key) {
        attempts.checkAllowed(key);
        attempts.recordFailure(key);
    }

    private String issueCode(User user) {
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        user.setVerificationCodeHash(encoder.encode(code));
        user.setVerificationExpiresAt(Instant.now().plus(CODE_TTL));
        user.setVerificationAttempts(0);
        user.setVerificationSentAt(Instant.now());
        return code;
    }
}
