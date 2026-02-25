package com.nhom25.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.nhom25.ecommerce.entity.Category;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    @Query("SELECT c FROM Category c WHERE c.isActive = true")
    List<Category> findAllActiveCategories();
    
    List<Category> findByNameContainingIgnoreCase(String name);
}