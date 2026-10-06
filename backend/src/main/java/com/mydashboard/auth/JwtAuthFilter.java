package com.mydashboard.auth;

import com.mydashboard.user.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Dibuat manual di SecurityConfig (bukan @Component) agar hanya berjalan di dalam rantai Spring Security.
 * Selain memeriksa tanda tangan token, pengguna dimuat ulang dari database pada setiap request, sehingga akun yang
 * dinonaktifkan atau diubah role-nya langsung berlaku tanpa menunggu token kedaluwarsa.
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwt;
    private final UserRepository users;

    public JwtAuthFilter(JwtService jwt, UserRepository users) {
        this.jwt = jwt;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (!AuthCookies.NAME.equals(cookie.getName())) continue;
                jwt.parse(cookie.getValue())
                        .flatMap(claims -> users.findById(claims.id()))
                        .filter(user -> user.isEnabled())
                        .ifPresent(user -> {
                            var principal = new AuthUser(user.getId(), user.getUsername(), user.getRole());
                            var authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
                            SecurityContextHolder.getContext().setAuthentication(
                                    new UsernamePasswordAuthenticationToken(principal, null, List.of(authority)));
                        });
            }
        }
        chain.doFilter(request, response);
    }
}
