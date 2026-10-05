package com.mydashboard.auth;

import com.mydashboard.common.exception.ForbiddenException;
import com.mydashboard.common.exception.UnauthorizedException;
import java.util.Map;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/** Memverifikasi ID token Google lewat endpoint tokeninfo (tanda tangan dan masa berlaku diperiksa oleh Google). */
@Component
public class GoogleTokenVerifier {

    public record GoogleProfile(String email, String name) {}

    private static final Set<String> ISSUERS = Set.of("accounts.google.com", "https://accounts.google.com");

    private final RestClient http;

    @Value("${app.auth.google-client-id:}")
    private String clientId;

    public GoogleTokenVerifier() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(5000);
        this.http = RestClient.builder().requestFactory(factory).build();
    }

    public GoogleProfile verify(String idToken) {
        if (clientId.isBlank()) throw new ForbiddenException("Login Google belum diaktifkan.");
        Map<String, Object> claims;
        try {
            claims = http.get()
                    .uri("https://oauth2.googleapis.com/tokeninfo?id_token={token}", idToken)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});
        } catch (RestClientException e) {
            throw new UnauthorizedException("Token Google tidak valid.");
        }
        if (claims == null
                || !clientId.equals(claims.get("aud"))
                || !ISSUERS.contains(String.valueOf(claims.get("iss")))
                || !"true".equals(String.valueOf(claims.get("email_verified")))
                || claims.get("email") == null) {
            throw new UnauthorizedException("Token Google tidak valid.");
        }
        Object name = claims.get("name");
        return new GoogleProfile(String.valueOf(claims.get("email")).trim().toLowerCase(), name == null ? null : String.valueOf(name));
    }
}
