package com.mydashboard.budget;

import static com.mydashboard.budget.BudgetDtos.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/** Daftar hari libur: khusus superuser (SecurityConfig membatasi /api/admin/** untuk ADMIN). */
@RestController
@RequestMapping("/api/admin/holidays")
@RequiredArgsConstructor
public class HolidayAdminController {

    private final HolidayService service;

    @GetMapping
    public List<HolidayResponse> list(@RequestParam int year) {
        return service.list(year);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public HolidayResponse create(@Valid @RequestBody HolidayRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public HolidayResponse update(@PathVariable UUID id, @Valid @RequestBody HolidayRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
