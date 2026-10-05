package com.mydashboard.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Membuat akun admin pertama dari variabel lingkungan, hanya jika belum ada pengguna sama sekali. */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements ApplicationRunner {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final UserService userService;

    @Value("${app.auth.admin.username:}")
    private String username;

    @Value("${app.auth.admin.password:}")
    private String password;

    @Value("${app.auth.admin.full-name:Administrator}")
    private String fullName;

    @Value("${app.auth.admin.email:}")
    private String email;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (users.count() > 0) return;
        if (username.isBlank() || password.length() < 8) {
            log.warn("Belum ada pengguna. Isi APP_ADMIN_USERNAME dan APP_ADMIN_PASSWORD (min. 8 karakter) lalu jalankan ulang agar admin pertama dibuat.");
            return;
        }
        User admin = new User();
        admin.setUsername(username.trim().toLowerCase());
        admin.setPasswordHash(encoder.encode(password));
        admin.setFullName(fullName.trim());
        admin.setRole(Role.ADMIN);
        if (!email.isBlank()) {
            admin.setEmail(userService.normalizeEmail(email));
            admin.setEmailVerified(true);
        }
        users.save(admin);
        log.info("Akun admin '{}' dibuat.", admin.getUsername());
    }
}
