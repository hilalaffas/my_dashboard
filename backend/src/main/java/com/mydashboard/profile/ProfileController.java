package com.mydashboard.profile;

import static com.mydashboard.profile.ProfileDtos.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService service;

    @GetMapping
    public ProfileResponse get() {
        return service.get();
    }

    @PutMapping
    public ProfileResponse update(@Valid @RequestBody ProfileRequest req) {
        return service.update(req);
    }
}
