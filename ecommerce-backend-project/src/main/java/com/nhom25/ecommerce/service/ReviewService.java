package com.nhom25.ecommerce.service;

import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.nhom25.ecommerce.dto.ReviewDTO;
import com.nhom25.ecommerce.entity.Order;
import com.nhom25.ecommerce.entity.Product;
import com.nhom25.ecommerce.entity.Review;
import com.nhom25.ecommerce.entity.User;
import com.nhom25.ecommerce.exception.BadRequestException;
import com.nhom25.ecommerce.exception.ResourceNotFoundException;
import com.nhom25.ecommerce.repository.OrderRepository;
import com.nhom25.ecommerce.repository.ProductRepository;
import com.nhom25.ecommerce.repository.ReviewRepository;
import com.nhom25.ecommerce.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final FileStorageService fileStorageService;

    private final NotificationService notificationService;

    // ADD REVIEW
    public ReviewDTO addReview(Long userId, ReviewDTO dto, List<MultipartFile> imageFiles) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Validate Order belongs to User
        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Order does not belong to you");
        }

        // Validate Order is Delivered
        if (order.getStatus() != com.nhom25.ecommerce.entity.OrderStatus.DELIVERED) {
            throw new BadRequestException("You can only review delivered orders");
        }

        // Validate Product is in Order
        boolean productInOrder = order.getOrderItems().stream()
                .anyMatch(item -> item.getProduct().getId().equals(dto.getProductId()));

        if (reviewRepository.existsByUserIdAndProductIdAndOrderId(userId, dto.getProductId(), dto.getOrderId())) {
            throw new BadRequestException("You have already reviewed this product in this order");
        }

        List<String> fileNames = new ArrayList<>();
        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile file : imageFiles) {
                if (!file.isEmpty()) {
                    fileNames.add(fileStorageService.storeFile(file));
                }
            }
        }
        // Limit 5 images
        if (fileNames.size() > 5) {
            throw new BadRequestException("You can upload max 5 images");
        }

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setOrder(order);
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setImageUrls(fileNames);

        Review savedReview = reviewRepository.save(review);

        // TRIGGER NOTIFICATION
        notificationService.createNotification(
                "Đánh giá mới từ " + (user != null ? user.getFirstName() + " " + user.getLastName() : "Khách"),
                "Sản phẩm: " + product.getName() + " - " + dto.getRating() + " sao",
                "REVIEW",
                savedReview.getId());

        updateProductAverageRating(dto.getProductId());

        return convertToDTO(savedReview);
    }

    // GET REVIEWS FOR PRODUCT (FIXED: Use fetch join)
    @Transactional(readOnly = true)
    public Page<ReviewDTO> getReviewsForProduct(Long productId, Pageable pageable) {
        return reviewRepository.findByProductIdWithUser(productId, pageable)
                .map(this::convertToDTO);
    }

    // DELETE REVIEW
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only delete your own reviews");
        }

        Long productId = review.getProduct().getId();

        if (review.getImageUrls() != null) {
            for (String splitUrl : review.getImageUrls()) {
                fileStorageService.deleteFile(splitUrl);
            }
        }

        reviewRepository.delete(review);
        updateProductAverageRating(productId);
    }

    // UPDATE PRODUCT RATING
    private void updateProductAverageRating(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Double averageRating = reviewRepository.calculateAverageRating(productId);
        long reviewCount = reviewRepository.countByProductId(productId);

        product.setAverageRating(averageRating != null ? averageRating : 0.0);
        product.setReviewCount((int) reviewCount);
        productRepository.save(product);
    }

    // CONVERT ENTITY TO DTO (SAFE: Null protection)
    private ReviewDTO convertToDTO(Review entity) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(entity.getId());
        dto.setProductId(entity.getProduct().getId());
        dto.setProductName(entity.getProduct().getName());
        if (entity.getProduct().getCategory() != null) {
            dto.setCategoryName(entity.getProduct().getCategory().getName());
        }
        dto.setOrderId(entity.getOrder().getId());

        User user = entity.getUser();
        if (user != null) {
            dto.setUserId(user.getId());
            dto.setUserFullName(user.getFirstName() + " " + user.getLastName());
        } else {
            dto.setUserId(null);
            dto.setUserFullName("Khách");
        }

        dto.setRating(entity.getRating());
        dto.setComment(entity.getComment());
        dto.setImageUrls(entity.getImageUrls() != null ? new ArrayList<>(entity.getImageUrls()) : new ArrayList<>());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    @Transactional(readOnly = true)
    public Page<ReviewDTO> getReviewsForProductByRating(Long productId, int rating, Pageable pageable) {
        return reviewRepository.findByProductIdAndRatingWithUser(productId, rating, pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Map<Integer, Long> getRatingStats(Long productId) {
        Map<Integer, Long> stats = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            stats.put(i, reviewRepository.countByProductIdAndRating(productId, i));
        }
        return stats;
    }

    // GET ALL REVIEWS (ADMIN) - WITH FILTERS
    @Transactional(readOnly = true)
    public Page<ReviewDTO> getAllReviews(String productName, Integer rating, java.time.LocalDateTime startDate,
            java.time.LocalDateTime endDate, Pageable pageable) {
        return reviewRepository.searchReviews(productName, rating, startDate, endDate, pageable)
                .map(this::convertToDTO);
    }

    public Double getAverageRating(Long productId) {
        return reviewRepository.calculateAverageRating(productId);
    }
}
