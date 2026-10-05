package com.mydashboard.profile;

import static com.mydashboard.profile.ProfileDtos.*;

import com.mydashboard.common.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileService {

    private final ProfileRepository repository;

    @Transactional(readOnly = true)
    public ProfileResponse get() {
        return toResponse(current());
    }

    public ProfileResponse update(ProfileRequest req) {
        Profile p = current();
        p.setFullName(req.fullName().trim());
        p.setEmail(req.email().trim());
        return toResponse(p);
    }

    private Profile current() {
        return repository.findAll().stream().findFirst().orElseThrow(() -> new NotFoundException("Profil tidak ditemukan."));
    }

    private ProfileResponse toResponse(Profile p) {
        return new ProfileResponse(p.getFullName(), p.getEmail());
    }
}
