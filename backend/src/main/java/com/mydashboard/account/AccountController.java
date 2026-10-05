package com.mydashboard.account;

import static com.mydashboard.account.AccountDtos.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService service;

    @GetMapping
    public List<CategoryResponse> tree() {
        return service.tree();
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse createCategory(@Valid @RequestBody NameRequest req) {
        return service.createCategory(req);
    }

    @PutMapping("/categories/{id}")
    public CategoryResponse updateCategory(@PathVariable UUID id, @Valid @RequestBody NameRequest req) {
        return service.updateCategory(id, req);
    }

    @DeleteMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable UUID id) {
        service.deleteCategory(id);
    }

    @PostMapping("/categories/{categoryId}/subs")
    @ResponseStatus(HttpStatus.CREATED)
    public SubResponse createSub(@PathVariable UUID categoryId, @Valid @RequestBody NameRequest req) {
        return service.createSub(categoryId, req);
    }

    @PutMapping("/subs/{id}")
    public SubResponse updateSub(@PathVariable UUID id, @Valid @RequestBody NameRequest req) {
        return service.updateSub(id, req);
    }

    @DeleteMapping("/subs/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSub(@PathVariable UUID id) {
        service.deleteSub(id);
    }

    @PostMapping("/subs/{subId}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public ItemResponse createItem(@PathVariable UUID subId, @Valid @RequestBody ItemRequest req) {
        return service.createItem(subId, req);
    }

    @PutMapping("/items/{id}")
    public ItemResponse updateItem(@PathVariable UUID id, @Valid @RequestBody ItemRequest req) {
        return service.updateItem(id, req);
    }

    @DeleteMapping("/items/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(@PathVariable UUID id) {
        service.deleteItem(id);
    }
}
