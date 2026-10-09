package com.mydashboard.budget;

import static com.mydashboard.budget.BudgetDtos.*;

import com.mydashboard.auth.AuthUser;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/** Kalender anggaran milik pengguna yang sedang login: hari libur, cuti, dan aturan hitung per item. */
@RestController
@RequestMapping("/api/budget")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService service;

    @GetMapping("/calendar")
    public CalendarResponse calendar(@AuthenticationPrincipal AuthUser me, @RequestParam int year) {
        return service.calendar(me.id(), year);
    }

    @PutMapping("/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void setLeave(@AuthenticationPrincipal AuthUser me, @Valid @RequestBody LeaveRequest req) {
        service.setLeave(me.id(), req);
    }

    @GetMapping("/rules")
    public List<RuleResponse> rules(@AuthenticationPrincipal AuthUser me) {
        return service.rules(me.id());
    }

    @PutMapping("/rules/{itemId}")
    public RuleResponse saveRule(@AuthenticationPrincipal AuthUser me, @PathVariable UUID itemId, @Valid @RequestBody RuleRequest req) {
        return service.saveRule(me.id(), itemId, req);
    }

    @DeleteMapping("/rules/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRule(@AuthenticationPrincipal AuthUser me, @PathVariable UUID itemId) {
        service.deleteRule(me.id(), itemId);
    }
}
