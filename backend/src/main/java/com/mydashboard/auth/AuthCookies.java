package com.mydashboard.auth;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/** Cookie httpOnly berisi JWT, sehingga tidak bisa dibaca oleh JavaScript di browser. */
@Component
public class AuthCookies {

    public static final String NAME = "access_token";

    private final boolean secure;
    private final String sameSite;
    private final Duration maxAge;

    public AuthCookies(
            @Value("${app.auth.cookie-secure}") boolean secure,
            @Value("${app.auth.cookie-same-site}") String sameSite,
            @Value("${app.auth.token-ttl-minutes}") long ttlMinutes) {
        this.secure = secure;
        this.sameSite = sameSite;
        this.maxAge = Duration.ofMinutes(ttlMinutes);
    }

    public ResponseCookie issue(String token) {
        return base(token).maxAge(maxAge).build();
    }

    public ResponseCookie clear() {
        return base("").maxAge(Duration.ZERO).build();
    }

    private ResponseCookie.ResponseCookieBuilder base(String value) {
        return ResponseCookie.from(NAME, value).httpOnly(true).secure(secure).sameSite(sameSite).path("/");
    }
}
