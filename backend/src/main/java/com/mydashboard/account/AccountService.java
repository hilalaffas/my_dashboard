package com.mydashboard.account;

import static com.mydashboard.account.AccountDtos.*;

import com.mydashboard.common.exception.NotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Semua method menerima ownerId dan hanya menyentuh data milik pengguna itu.
 * Data milik orang lain dijawab "tidak ditemukan" (404), bukan "dilarang", agar keberadaannya tidak bocor.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AccountService {

    private final CategoryRepository categories;
    private final SubCategoryRepository subs;
    private final ItemRepository items;

    @Transactional(readOnly = true)
    public List<CategoryResponse> tree(UUID ownerId) {
        return categories.findAllByOwnerIdOrderByCreatedAtAsc(ownerId).stream().map(this::toCategory).toList();
    }

    @Transactional(readOnly = true)
    public AccountSummary summary(UUID ownerId) {
        int subCount = 0;
        int itemCount = 0;
        BigDecimal total = BigDecimal.ZERO;
        List<Category> all = categories.findAllByOwnerIdOrderByCreatedAtAsc(ownerId);
        for (Category c : all) {
            subCount += c.getSubs().size();
            for (SubCategory s : c.getSubs()) {
                itemCount += s.getItems().size();
                for (Item i : s.getItems()) total = total.add(i.getAmount());
            }
        }
        return new AccountSummary(all.size(), subCount, itemCount, total);
    }

    public CategoryResponse createCategory(UUID ownerId, NameRequest req) {
        Category c = new Category();
        c.setOwnerId(ownerId);
        c.setName(req.name().trim());
        return toCategory(categories.save(c));
    }

    public CategoryResponse updateCategory(UUID ownerId, UUID id, NameRequest req) {
        Category c = findCategory(ownerId, id);
        c.setName(req.name().trim());
        return toCategory(c);
    }

    public void deleteCategory(UUID ownerId, UUID id) {
        categories.delete(findCategory(ownerId, id));
    }

    public SubResponse createSub(UUID ownerId, UUID categoryId, NameRequest req) {
        SubCategory s = new SubCategory();
        s.setCategory(findCategory(ownerId, categoryId));
        s.setName(req.name().trim());
        return toSub(subs.save(s));
    }

    public SubResponse updateSub(UUID ownerId, UUID id, NameRequest req) {
        SubCategory s = findSub(ownerId, id);
        s.setName(req.name().trim());
        return toSub(s);
    }

    public void deleteSub(UUID ownerId, UUID id) {
        subs.delete(findSub(ownerId, id));
    }

    public ItemResponse createItem(UUID ownerId, UUID subId, ItemRequest req) {
        Item i = new Item();
        i.setSubCategory(findSub(ownerId, subId));
        i.setName(req.name().trim());
        i.setAmount(req.amount());
        return toItem(items.save(i));
    }

    public ItemResponse updateItem(UUID ownerId, UUID id, ItemRequest req) {
        Item i = findItem(ownerId, id);
        i.setName(req.name().trim());
        i.setAmount(req.amount());
        return toItem(i);
    }

    public void deleteItem(UUID ownerId, UUID id) {
        items.delete(findItem(ownerId, id));
    }

    private Category findCategory(UUID ownerId, UUID id) {
        return categories.findByIdAndOwnerId(id, ownerId).orElseThrow(() -> new NotFoundException("Kategori tidak ditemukan."));
    }

    private SubCategory findSub(UUID ownerId, UUID id) {
        return subs.findOwned(id, ownerId).orElseThrow(() -> new NotFoundException("Sub kategori tidak ditemukan."));
    }

    private Item findItem(UUID ownerId, UUID id) {
        return items.findOwned(id, ownerId).orElseThrow(() -> new NotFoundException("Item tidak ditemukan."));
    }

    private ItemResponse toItem(Item i) {
        return new ItemResponse(i.getId(), i.getName(), i.getAmount());
    }

    private SubResponse toSub(SubCategory s) {
        return new SubResponse(s.getId(), s.getName(), s.getItems().stream().map(this::toItem).toList());
    }

    private CategoryResponse toCategory(Category c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getSubs().stream().map(this::toSub).toList());
    }
}
