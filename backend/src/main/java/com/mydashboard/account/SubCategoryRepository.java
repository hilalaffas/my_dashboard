package com.mydashboard.account;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubCategoryRepository extends JpaRepository<SubCategory, UUID> {
}
