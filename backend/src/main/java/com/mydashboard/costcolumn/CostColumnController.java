package com.mydashboard.costcolumn;

import static com.mydashboard.costcolumn.CostColumnDtos.*;

import com.mydashboard.auth.AuthUser;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/** Kolom kustom tabel Cost. Semua endpoint bekerja pada data milik pengguna yang sedang login. */
@RestController
@RequestMapping("/api/cost-columns")
@RequiredArgsConstructor
public class CostColumnController {

    private final CostColumnService service;

    /** Definisi kolom beserta seluruh nilai selnya, dalam satu panggilan. */
    @GetMapping
    public TableMeta meta(@AuthenticationPrincipal AuthUser me) {
        return service.meta(me.id());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ColumnResponse create(@AuthenticationPrincipal AuthUser me, @Valid @RequestBody ColumnRequest req) {
        return service.create(me.id(), req);
    }

    // PUT (bukan PATCH): CORS di CorsConfig hanya mengizinkan GET, POST, PUT, DELETE
    @PutMapping("/order")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reorder(@AuthenticationPrincipal AuthUser me, @Valid @RequestBody OrderRequest req) {
        service.reorder(me.id(), req);
    }

    @PutMapping("/{id}")
    public ColumnResponse update(@AuthenticationPrincipal AuthUser me, @PathVariable UUID id, @Valid @RequestBody ColumnUpdateRequest req) {
        return service.update(me.id(), id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal AuthUser me, @PathVariable UUID id) {
        service.delete(me.id(), id);
    }

    @PutMapping("/{id}/cells")
    public CellValueResponse setCell(@AuthenticationPrincipal AuthUser me, @PathVariable UUID id, @Valid @RequestBody CellRequest req) {
        return service.setCell(me.id(), id, req);
    }
}
