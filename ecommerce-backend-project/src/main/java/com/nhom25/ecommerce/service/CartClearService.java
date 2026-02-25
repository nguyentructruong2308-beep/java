package com.nhom25.ecommerce.service;

import com.nhom25.ecommerce.repository.CartItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartClearService {

    private final CartItemRepository cartItemRepository;

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void clearCartForUser(Long userId) {
        log.info("Starting clearCartForUser for userId: {}", userId);
        try {
            java.util.List<com.nhom25.ecommerce.entity.CartItem> items = cartItemRepository
                    .findByUserIdOrderByCreatedAtDesc(userId);
            if (items != null && !items.isEmpty()) {
                log.info("Found {} items in cart for user {}. Deleting...", items.size(), userId);
                cartItemRepository.deleteAllInBatch(items);
                log.info("Successfully deleted all cart items for user {}", userId);
            } else {
                log.info("Cart is already empty for user {}", userId);
            }
        } catch (Exception e) {
            log.error("Error clearing cart for user {}: {}", userId, e.getMessage());
        }
    }

}
