package com.nhom25.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nhom25.ecommerce.entity.CartItemTopping;

import java.util.List;

@Repository
public interface CartItemToppingRepository
        extends JpaRepository<CartItemTopping, Long> {

    // Lấy danh sách topping theo cartItemId
    List<CartItemTopping> findByCartItemId(Long cartItemId);

    // Xóa toàn bộ topping của 1 cart item
    void deleteByCartItemId(Long cartItemId);
}
