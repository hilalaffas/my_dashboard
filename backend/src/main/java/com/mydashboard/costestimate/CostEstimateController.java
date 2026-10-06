package com.mydashboard.costestimate;

import static com.mydashboard.costestimate.CostEstimateDtos.*;

import com.mydashboard.auth.AuthUser;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/** Semua endpoint bekerja pada data milik pengguna yang sedang login. */
@RestController
@RequestMapping("/api/cost-estimates")
@RequiredArgsConstructor
public class CostEstimateController {

    private final CostEstimateService service;

    @GetMapping
    public List<CostEstimateResponse> list(@AuthenticationPrincipal AuthUser me) {
        return service.list(me.id());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CostEstimateResponse create(@AuthenticationPrincipal AuthUser me, @Valid @RequestBody CostEstimateRequest req) {
        return service.create(me.id(), req);
    }

    @PutMapping("/{id}")
    public CostEstimateResponse update(@AuthenticationPrincipal AuthUser me, @PathVariable UUID id, @Valid @RequestBody CostEstimateRequest req) {
        return service.update(me.id(), id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal AuthUser me, @PathVariable UUID id) {
        service.delete(me.id(), id);
    }
}
