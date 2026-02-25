package com.nhom25.ecommerce.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
// Import mới
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import com.nhom25.ecommerce.dto.ReviewDTO;
import com.nhom25.ecommerce.dto.UserDTO;
import com.nhom25.ecommerce.service.ReviewService;
import com.nhom25.ecommerce.service.UserService;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    private Long getUserId(Authentication authentication) {
        UserDTO user = userService.getUserByEmail(authentication.getName());
        return user.getId();
    }

    // [THAY ĐỔI] Toàn bộ phương thức addReview
    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<ReviewDTO> addReview(
            @Valid @ModelAttribute ReviewDTO dto, // Dùng @ModelAttribute
            @RequestParam(value = "images", required = false) List<MultipartFile> images, // Nhận danh sách tệp
            Authentication authentication) {

        // Truyền DTO và tệp ảnh vào service
        ReviewDTO review = reviewService.addReview(getUserId(authentication), dto, images);
        return new ResponseEntity<>(review, HttpStatus.CREATED);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<ReviewDTO>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) Integer rating) { // thêm rating

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<ReviewDTO> reviews;
        if (rating != null) {
            reviews = reviewService.getReviewsForProductByRating(productId, rating, pageable);
        } else {
            reviews = reviewService.getReviewsForProduct(productId, pageable);
        }
        return ResponseEntity.ok(reviews);
    }

    @GetMapping
    public ResponseEntity<Page<ReviewDTO>> getAllReviews(
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(reviewService.getAllReviews(productName, rating, startDate, endDate, pageable));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId, Authentication authentication) {
        reviewService.deleteReview(reviewId, getUserId(authentication));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/product/{productId}/stats")
    public ResponseEntity<Map<Integer, Long>> getRatingStats(@PathVariable Long productId) {
        Map<Integer, Long> stats = reviewService.getRatingStats(productId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/product/{productId}/average")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long productId) {
        Double avg = reviewService.getAverageRating(productId);
        return ResponseEntity.ok(avg);
    }

}
