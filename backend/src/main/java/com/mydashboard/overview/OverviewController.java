package com.mydashboard.overview;

import com.mydashboard.auth.AuthUser;
import com.mydashboard.overview.OverviewDtos.OverviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/overview")
@RequiredArgsConstructor
public class OverviewController {

    private final OverviewService service;

    @GetMapping
    public OverviewResponse overview(@AuthenticationPrincipal AuthUser me) {
        return service.overview(me.id());
    }
}
