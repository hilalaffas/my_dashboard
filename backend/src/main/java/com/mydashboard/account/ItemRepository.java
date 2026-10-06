package com.mydashboard.account;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ItemRepository extends JpaRepository<Item, UUID> {

    /** Hanya mengembalikan item jika kategorinya milik ownerId. */
    @Query("select i from Item i where i.id = :id and i.subCategory.category.ownerId = :ownerId")
    Optional<Item> findOwned(@Param("id") UUID id, @Param("ownerId") UUID ownerId);
}
