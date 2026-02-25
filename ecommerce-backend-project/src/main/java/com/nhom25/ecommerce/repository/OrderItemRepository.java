package com.nhom25.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.nhom25.ecommerce.entity.OrderItem;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

        /**
         * Truy vấn bảo mật: Tìm một OrderItem bằng ID của nó và ID của User sở hữu đơn
         * hàng.
         * Điều này ngăn người dùng A thao tác trên OrderItem của người dùng B.
         * Logic này vẫn đúng kể cả khi OrderItem liên kết với ProductVariant.
         */
        Optional<OrderItem> findByIdAndOrder_UserId(Long orderItemId, Long userId);

        @Query("SELECT oi.product.id as productId, oi.product.name as name, SUM(oi.quantity) as salesCount, SUM(oi.totalPrice) as totalRevenue, oi.product.imageUrl as imageUrl "
                        +
                        "FROM OrderItem oi " +
                        "WHERE oi.order.status = com.nhom25.ecommerce.entity.OrderStatus.DELIVERED " +
                        "GROUP BY oi.product.id, oi.product.name, oi.product.imageUrl " +
                        "ORDER BY salesCount DESC")
        List<Object[]> findTopSellingProducts(org.springframework.data.domain.Pageable pageable);

        @Query("SELECT oi.product.category.name as categoryName, SUM(oi.totalPrice) as totalRevenue " +
                        "FROM OrderItem oi " +
                        "WHERE oi.order.status = com.nhom25.ecommerce.entity.OrderStatus.DELIVERED " +
                        "GROUP BY oi.product.category.name")
        List<Object[]> findRevenueByCategory();
}
