package com.nhom25.ecommerce.service;

import com.nhom25.ecommerce.dto.ProductDTO;
import com.nhom25.ecommerce.entity.Product;
import com.nhom25.ecommerce.entity.User;
import com.nhom25.ecommerce.entity.ViewHistory;
import com.nhom25.ecommerce.repository.ProductRepository;
import com.nhom25.ecommerce.repository.UserRepository;
import com.nhom25.ecommerce.repository.ViewHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ViewHistoryService {

    private final ViewHistoryRepository viewHistoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    private static final int MAX_HISTORY_SIZE = 50; // Giữ tối đa 50 sản phẩm trong lịch sử

    /**
     * Ghi nhận lượt xem sản phẩm
     */
    @Transactional
    public void recordView(Long productId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return; // Không ghi lịch sử cho anonymous user
        }

        String email = auth.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return;
        }

        User user = userOpt.get();
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            return;
        }

        Product product = productOpt.get();

        // Kiểm tra xem đã xem sản phẩm này chưa
        Optional<ViewHistory> existingView = viewHistoryRepository.findByUserIdAndProductId(user.getId(), productId);

        if (existingView.isPresent()) {
            // Cập nhật thời gian xem mới nhất
            ViewHistory vh = existingView.get();
            vh.setViewedAt(LocalDateTime.now());
            viewHistoryRepository.save(vh);
        } else {
            // Tạo bản ghi mới
            ViewHistory viewHistory = new ViewHistory();
            viewHistory.setUser(user);
            viewHistory.setProduct(product);
            viewHistory.setViewedAt(LocalDateTime.now());
            viewHistoryRepository.save(viewHistory);

            // Dọn dẹp lịch sử cũ nếu vượt quá giới hạn
            long count = viewHistoryRepository.countByUserId(user.getId());
            if (count > MAX_HISTORY_SIZE) {
                int toDelete = (int) (count - MAX_HISTORY_SIZE);
                List<ViewHistory> oldRecords = viewHistoryRepository.findOldestByUserId(
                        user.getId(), PageRequest.of(0, toDelete));
                viewHistoryRepository.deleteAll(oldRecords);
            }
        }

        log.debug("Recorded view for product {} by user {}", productId, user.getId());
    }

    /**
     * Lấy danh sách sản phẩm đã xem gần đây
     */
    @Transactional(readOnly = true)
    public List<ProductDTO> getRecentlyViewed(int limit) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return List.of();
        }

        String email = auth.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return List.of();
        }

        User user = userOpt.get();
        List<ViewHistory> viewHistories = viewHistoryRepository
                .findByUserIdOrderByViewedAtDesc(user.getId(), PageRequest.of(0, limit));

        return viewHistories.stream()
                .map(vh -> mapToProductDTO(vh.getProduct()))
                .collect(Collectors.toList());
    }

    private ProductDTO mapToProductDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setImageUrl(product.getImageUrl());
        dto.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        dto.setCategoryName(product.getCategory() != null ? product.getCategory().getName() : null);
        dto.setStockQuantity(product.getStockQuantity());
        return dto;
    }
}
