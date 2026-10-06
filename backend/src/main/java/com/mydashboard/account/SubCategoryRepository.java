package com.mydashboard.account;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SubCategoryRepository extends JpaRepository<SubCategory, UUID> {

    /** Hanya mengembalikan sub kategori jika kategorinya milik ownerId. */
    @Query("select s from SubCategory s where s.id = :id and s.category.ownerId = :ownerId")
    Optional<SubCategory> findOwned(@Param("id") UUID id, @Param("ownerId") UUID ownerId);
}
