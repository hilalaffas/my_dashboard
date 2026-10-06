package com.mydashboard.account;

import static com.mydashboard.account.AccountDtos.*;

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
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService service;

    @GetMapping
    public List<CategoryResponse> tree(@AuthenticationPrincipal AuthUser me) {
        return service.tree(me.id());
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse createCategory(@AuthenticationPrincipal AuthUser me, @Valid @RequestBody NameRequest req) {
        return service.createCategory(me.id(), req);
    }

    @PutMapping("/categories/{id}")
    public CategoryResponse updateCategory(@AuthenticationPrincipal AuthUser me, @PathVariable UUID id, @Valid @RequestBody NameRequest req) {
        return service.updateCategory(me.id(), id, req);
    }

    @DeleteMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@AuthenticationPrincipal AuthUser me, @PathVariable UUID id) {
        service.deleteCategory(me.id(), id);
    }

    @PostMapping("/categories/{categoryId}/subs")
    @ResponseStatus(HttpStatus.CREATED)
    public SubResponse createSub(@AuthenticationPrincipal AuthUser me, @PathVariable UUID categoryId, @Valid @RequestBody NameRequest req) {
        return service.createSub(me.id(), categoryId, req);
    }

    @PutMapping("/subs/{id}")
    public SubResponse updateSub(@AuthenticationPrincipal AuthUser me, @PathVariable UUID id, @Valid @RequestBody NameRequest req) {
        return service.updateSub(me.id(), id, req);
    }

    @DeleteMapping("/subs/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSub(@AuthenticationPrincipal AuthUser me, @PathVariable UUID id) {
        service.deleteSub(me.id(), id);
    }

    @PostMapping("/subs/{subId}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public ItemResponse createItem(@AuthenticationPrincipal AuthUser me, @PathVariable UUID subId, @Valid @RequestBody ItemRequest req) {
        return service.createItem(me.id(), subId, req);
    }

    @PutMapping("/items/{id}")
    public ItemResponse updateItem(@AuthenticationPrincipal AuthUser me, @PathVariable UUID id, @Valid @RequestBody ItemRequest req) {
        return service.updateItem(me.id(), id, req);
    }

    @DeleteMapping("/items/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(@AuthenticationPrincipal AuthUser me, @PathVariable UUID id) {
        service.deleteItem(me.id(), id);
    }
}
