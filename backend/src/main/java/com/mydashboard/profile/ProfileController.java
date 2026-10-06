package com.mydashboard.profile;

import static com.mydashboard.profile.ProfileDtos.*;

import com.mydashboard.auth.AuthUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService service;

    @GetMapping
    public ProfileResponse get(@AuthenticationPrincipal AuthUser me) {
        return service.get(me.id());
    }

    @PutMapping
    public ProfileResponse update(@AuthenticationPrincipal AuthUser me, @Valid @RequestBody ProfileRequest req) {
        return service.update(me.id(), req);
    }
}
