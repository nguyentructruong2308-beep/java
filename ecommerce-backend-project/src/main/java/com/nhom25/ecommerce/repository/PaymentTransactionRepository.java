package com.nhom25.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.nhom25.ecommerce.entity.PaymentStatus;
import com.nhom25.ecommerce.entity.PaymentTransaction;

import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    // Tìm giao dịch cho một đơn hàng theo trạng thái (PENDING, SUCCESSFUL, FAILED)
    Optional<PaymentTransaction> findByOrderIdAndStatus(Long orderId, PaymentStatus status);

    Optional<PaymentTransaction> findByTransactionId(String transactionId);

    // Tìm transaction mới nhất của một order (dùng làm fallback)
    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.order.id = :orderId ORDER BY pt.createdAt DESC")
    Optional<PaymentTransaction> findTopByOrderIdOrderByCreatedAtDesc(Long orderId);
}
