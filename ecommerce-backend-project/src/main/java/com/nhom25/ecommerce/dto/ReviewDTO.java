package com.nhom25.ecommerce.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReviewDTO {
    private Long id;

    @NotNull(message = "Product ID is required")
    private Long productId;
    private String productName;
    private String categoryName;

    private Long userId;
    private String userFullName; // (FirstName + LastName)

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    private String comment;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
}