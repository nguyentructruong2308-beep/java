package com.nhom25.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nhom25.ecommerce.entity.ProductVariant;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    // Phương thức này đã có
    boolean existsBySku(String sku);

    // [THÊM DÒNG NÀY] Phương thức còn thiếu để phục vụ logic update
    Optional<ProductVariant> findBySku(String sku);

    // [MỚI] Tìm tất cả biến thể của sản phẩm
    java.util.List<ProductVariant> findAllByProductId(Long productId);

    // [MỚI] Tìm biến thể đầu tiên của sản phẩm (dùng làm mặc định)
    Optional<ProductVariant> findFirstByProductId(Long productId);

    // [MỚI] Tìm các biến thể có tồn kho thấp
    List<ProductVariant> findByStockQuantityLessThan(Integer threshold);
}
