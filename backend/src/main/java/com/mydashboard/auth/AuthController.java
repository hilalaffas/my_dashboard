package com.mydashboard.auth;

import static com.mydashboard.auth.AuthDtos.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;
    private final RegistrationService registration;
    private final GoogleAuthService google;
    private final AuthCookies cookies;

    @GetMapping("/config")
    public AuthConfigResponse config() {
        return service.config();
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest req, HttpServletRequest http) {
        return withSession(service.login(req.username(), req.password(), http.getRemoteAddr()));
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void register(@Valid @RequestBody RegisterRequest req, HttpServletRequest http) {
        registration.register(req.email(), req.password(), http.getRemoteAddr());
    }

    @PostMapping("/verify-email")
    public ResponseEntity<UserResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest req) {
        return withSession(registration.verify(req.email(), req.code()));
    }

    @PostMapping("/resend-code")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void resendCode(@Valid @RequestBody ResendCodeRequest req, HttpServletRequest http) {
        registration.resend(req.email(), http.getRemoteAddr());
    }

    @PostMapping("/google")
    public ResponseEntity<UserResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest req) {
        return withSession(google.login(req.credential()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, cookies.clear().toString()).build();
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal AuthUser principal) {
        return service.me(principal.id());
    }

    @PutMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@AuthenticationPrincipal AuthUser principal, @Valid @RequestBody ChangePasswordRequest req) {
        service.changePassword(principal.id(), req);
    }

    private ResponseEntity<UserResponse> withSession(LoginResult result) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookies.issue(result.token()).toString())
                .body(result.user());
    }
}
