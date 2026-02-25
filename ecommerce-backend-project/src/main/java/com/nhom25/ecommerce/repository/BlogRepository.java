package com.nhom25.ecommerce.repository;

import com.nhom25.ecommerce.entity.Blog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {
    Page<Blog> findByPublishedTrue(Pageable pageable);

    Page<Blog> findByCategoryAndPublishedTrue(String category, Pageable pageable);
}
