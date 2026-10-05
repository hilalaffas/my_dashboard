package com.mydashboard.account;

import static com.mydashboard.account.AccountDtos.*;

import com.mydashboard.common.exception.NotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AccountService {

    private final CategoryRepository categories;
    private final SubCategoryRepository subs;
    private final ItemRepository items;

    @Transactional(readOnly = true)
    public List<CategoryResponse> tree() {
        return categories.findAllByOrderByCreatedAtAsc().stream().map(this::toCategory).toList();
    }

    @Transactional(readOnly = true)
    public AccountSummary summary() {
        int subCount = 0;
        int itemCount = 0;
        BigDecimal total = BigDecimal.ZERO;
        List<Category> all = categories.findAll();
        for (Category c : all) {
            subCount += c.getSubs().size();
            for (SubCategory s : c.getSubs()) {
                itemCount += s.getItems().size();
                for (Item i : s.getItems()) total = total.add(i.getAmount());
            }
        }
        return new AccountSummary(all.size(), subCount, itemCount, total);
    }

    public CategoryResponse createCategory(NameRequest req) {
        Category c = new Category();
        c.setName(req.name().trim());
        return toCategory(categories.save(c));
    }

    public CategoryResponse updateCategory(UUID id, NameRequest req) {
        Category c = findCategory(id);
        c.setName(req.name().trim());
        return toCategory(c);
    }

    public void deleteCategory(UUID id) {
        categories.delete(findCategory(id));
    }

    public SubResponse createSub(UUID categoryId, NameRequest req) {
        SubCategory s = new SubCategory();
        s.setCategory(findCategory(categoryId));
        s.setName(req.name().trim());
        return toSub(subs.save(s));
    }

    public SubResponse updateSub(UUID id, NameRequest req) {
        SubCategory s = findSub(id);
        s.setName(req.name().trim());
        return toSub(s);
    }

    public void deleteSub(UUID id) {
        subs.delete(findSub(id));
    }

    public ItemResponse createItem(UUID subId, ItemRequest req) {
        Item i = new Item();
        i.setSubCategory(findSub(subId));
        i.setName(req.name().trim());
        i.setAmount(req.amount());
        return toItem(items.save(i));
    }

    public ItemResponse updateItem(UUID id, ItemRequest req) {
        Item i = findItem(id);
        i.setName(req.name().trim());
        i.setAmount(req.amount());
        return toItem(i);
    }

    public void deleteItem(UUID id) {
        items.delete(findItem(id));
    }

    private Category findCategory(UUID id) {
        return categories.findById(id).orElseThrow(() -> new NotFoundException("Kategori tidak ditemukan."));
    }

    private SubCategory findSub(UUID id) {
        return subs.findById(id).orElseThrow(() -> new NotFoundException("Sub kategori tidak ditemukan."));
    }

    private Item findItem(UUID id) {
        return items.findById(id).orElseThrow(() -> new NotFoundException("Item tidak ditemukan."));
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
