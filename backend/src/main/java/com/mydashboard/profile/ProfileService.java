package com.mydashboard.profile;

import static com.mydashboard.profile.ProfileDtos.*;

import com.mydashboard.common.exception.NotFoundException;
import com.mydashboard.user.User;
import com.mydashboard.user.UserRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileService {

    private final UserRepository users;

    @Transactional(readOnly = true)
    public ProfileResponse get(UUID userId) {
        return toResponse(find(userId));
    }

    public ProfileResponse update(UUID userId, ProfileRequest req) {
        User user = find(userId);
        user.setFullName(req.fullName().trim());
        return toResponse(user);
    }

    private User find(UUID userId) {
        return users.findById(userId).orElseThrow(() -> new NotFoundException("Profil tidak ditemukan."));
    }

    private ProfileResponse toResponse(User u) {
        return new ProfileResponse(u.getUsername(), u.getFullName(), u.getEmail());
    }
}
