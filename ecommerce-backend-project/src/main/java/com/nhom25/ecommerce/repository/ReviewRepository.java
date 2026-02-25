package com.nhom25.ecommerce.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nhom25.ecommerce.entity.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

        Page<Review> findByProductId(Long productId, Pageable pageable);

        @Query("""
                        SELECT r FROM Review r
                        JOIN FETCH r.user u
                        JOIN FETCH r.product p
                        WHERE r.product.id = :productId
                        """)
        Page<Review> findByProductIdWithUser(@Param("productId") Long productId, Pageable pageable);

        @Query("""
                        SELECT r FROM Review r
                        JOIN FETCH r.user u
                        JOIN FETCH r.product p
                        WHERE r.product.id = :productId AND r.rating = :rating
                        """)
        Page<Review> findByProductIdAndRatingWithUser(@Param("productId") Long productId,
                        @Param("rating") int rating,
                        Pageable pageable);

        @Query("""
                        SELECT r FROM Review r
                        JOIN FETCH r.user u
                        JOIN FETCH r.product p
                        """)
        Page<Review> findAllWithUserAndProduct(Pageable pageable);

        @Query("""
                        SELECT r FROM Review r
                        JOIN FETCH r.user u
                        JOIN FETCH r.product p
                        WHERE (:productName IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :productName, '%')))
                        AND (:rating IS NULL OR r.rating = :rating)
                        AND (:startDate IS NULL OR r.createdAt >= :startDate)
                        AND (:endDate IS NULL OR r.createdAt <= :endDate)
                        """)
        Page<Review> searchReviews(@Param("productName") String productName,
                        @Param("rating") Integer rating,
                        @Param("startDate") java.time.LocalDateTime startDate,
                        @Param("endDate") java.time.LocalDateTime endDate,
                        Pageable pageable);

        boolean existsByUserIdAndProductId(Long userId, Long productId);

        boolean existsByUserIdAndProductIdAndOrderId(Long userId, Long productId, Long orderId);

        @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
        Double calculateAverageRating(@Param("productId") Long productId);

        /**
         * Kiểm tra xem một user đã mua và nhận một sản phẩm cụ thể hay chưa.
         */
        @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi " +
                        "WHERE oi.order.user.id = :userId " +
                        "AND (oi.product.id = :productId OR (oi.productVariant IS NOT NULL AND oi.productVariant.product.id = :productId)) "
                        +
                        "AND oi.order.status = com.nhom25.ecommerce.entity.OrderStatus.DELIVERED")
        boolean didUserPurchaseProduct(@Param("userId") Long userId, @Param("productId") Long productId);

        long countByProductId(Long productId);

        long countByProductIdAndRating(Long productId, int rating);
}