package com.nhom25.ecommerce.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nhom25.ecommerce.entity.Product;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

        @Query("SELECT p FROM Product p WHERE p.isActive = true")
        Page<Product> findAllActiveProducts(Pageable pageable);

        List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);

        @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
                        "(:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
                        "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
                        "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
                        "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
                        "(:minRating IS NULL OR p.averageRating >= :minRating)")
        Page<Product> findProductsWithFilters(
                        @Param("name") String name,
                        @Param("categoryId") Long categoryId,
                        @Param("minPrice") BigDecimal minPrice,
                        @Param("maxPrice") BigDecimal maxPrice,
                        @Param("minRating") Double minRating,
                        Pageable pageable);

        List<Product> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);

        // Methods thêm cho AI Chat
        Page<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description,
                        Pageable pageable);

        Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

        // Thêm phương thức bị thiếu
        List<Product> findByIsFeaturedTrueAndIsActiveTrue();

        // [MỚI] Tìm sản phẩm không có biến thể và tồn kho thấp hoặc variant tồn kho
        // thấp
        @Query("SELECT DISTINCT p FROM Product p LEFT JOIN p.variants v WHERE p.isActive = true AND ((p.variants IS EMPTY AND p.stockQuantity <= :threshold) OR (v.stockQuantity <= :threshold))")
        Page<Product> findLowStockProducts(@Param("threshold") Integer threshold, Pageable pageable);

        List<Product> findByVariantsIsEmptyAndStockQuantityLessThan(Integer stockQuantity);

        // [MỚI] Tìm sản phẩm "tồn kho lâu": Tồn nhiều, bán ít, xem ít
        @Query("SELECT p FROM Product p " +
                        "WHERE p.isActive = true " +
                        "AND (p.stockQuantity >= :minStock OR (SELECT SUM(v.stockQuantity) FROM p.variants v) >= :minStock) "
                        +
                        "AND p.soldCount <= :maxSold " +
                        "AND p.viewCount <= :maxViews " +
                        "ORDER BY p.stockQuantity DESC")
        Page<Product> findStagnantProducts(@Param("minStock") int minStock,
                        @Param("maxSold") long maxSold,
                        @Param("maxViews") long maxViews,
                        Pageable pageable);
}
