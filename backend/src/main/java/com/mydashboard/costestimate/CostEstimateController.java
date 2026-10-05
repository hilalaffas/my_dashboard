package com.mydashboard.costestimate;

import static com.mydashboard.costestimate.CostEstimateDtos.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cost-estimates")
@RequiredArgsConstructor
public class CostEstimateController {

    private final CostEstimateService service;

    @GetMapping
    public List<CostEstimateResponse> list() {
        return service.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CostEstimateResponse create(@Valid @RequestBody CostEstimateRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public CostEstimateResponse update(@PathVariable UUID id, @Valid @RequestBody CostEstimateRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
