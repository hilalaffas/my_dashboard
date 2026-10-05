package com.mydashboard.user;

import java.security.SecureRandom;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository users;

    public String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    public String localPart(String email) {
        int at = email.indexOf('@');
        return at > 0 ? email.substring(0, at) : email;
    }

    /** Membuat username dari bagian depan email; menambah angka acak bila sudah dipakai. */
    public String uniqueUsername(String email) {
        String base = localPart(email).toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9._-]", "");
        if (base.isBlank()) base = "user";
        if (base.length() > 40) base = base.substring(0, 40);
        String candidate = base;
        while (users.findByUsername(candidate).isPresent()) {
            candidate = base + (1000 + RANDOM.nextInt(9000));
        }
        return candidate;
    }
}
