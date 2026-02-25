package com.nhom25.ecommerce.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.nhom25.ecommerce.entity.DiscountType;

@Data
public class DiscountDTO {
    private Long id;
    private String code;
    private String name;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderValue;
    private BigDecimal maxDiscountAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Tier-based voucher fields
    private String voucherSource;
    private String requiredTier;
    private String requiredTierName;

    // "Buy X Get Y" fields
    private Integer buyQuantity;
    private Integer getQuantity;

    // Gift product fields for "Buy A Get B"
    private Long giftProductId;
    private String giftProductName;
    private String giftProductImage;

    // Products to which this discount applies (Product A)
    private java.util.List<Long> productIds;
    private java.util.List<String> productNames;
    private java.util.List<String> productImages;
}
