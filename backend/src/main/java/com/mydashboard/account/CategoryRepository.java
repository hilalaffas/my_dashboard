package com.mydashboard.account;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findAllByOwnerIdOrderByCreatedAtAsc(UUID ownerId);

    Optional<Category> findByIdAndOwnerId(UUID id, UUID ownerId);
}
