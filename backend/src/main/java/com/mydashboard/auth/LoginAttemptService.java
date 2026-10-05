package com.mydashboard.auth;

import com.mydashboard.common.exception.TooManyAttemptsException;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/** Pembatas percobaan login: 5 kali gagal dalam 15 menit mengunci kombinasi username+IP selama 15 menit. */
@Component
public class LoginAttemptService {

    private static final int MAX_FAILURES = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);

    private record State(int failures, Instant firstAt, Instant lockedUntil) {}

    private final ConcurrentHashMap<String, State> states = new ConcurrentHashMap<>();

    public void checkAllowed(String key) {
        State state = states.get(key);
        if (state == null) return;
        Instant now = Instant.now();
        if (state.lockedUntil() != null) {
            if (now.isBefore(state.lockedUntil())) {
                throw new TooManyAttemptsException("Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.");
            }
            states.remove(key);
        } else if (now.isAfter(state.firstAt().plus(WINDOW))) {
            states.remove(key);
        }
    }

    public void recordFailure(String key) {
        Instant now = Instant.now();
        states.compute(key, (k, state) -> {
            int failures = (state == null ? 0 : state.failures()) + 1;
            Instant firstAt = state == null ? now : state.firstAt();
            return failures >= MAX_FAILURES ? new State(0, now, now.plus(WINDOW)) : new State(failures, firstAt, null);
        });
    }

    public void reset(String key) {
        states.remove(key);
    }
}
