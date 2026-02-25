package com.nhom25.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.nhom25.ecommerce.entity.DiscountType;

@Data
public class CreateDiscountRequest {

    @NotBlank(message = "Mã giảm giá không được để trống")
    private String code;

    @NotBlank(message = "Tên không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Loại giảm giá không được để trống")
    private DiscountType discountType;

    @NotNull(message = "Giá trị giảm không được để trống")
    @Min(value = 0, message = "Giá trị giảm không được âm")
    private BigDecimal discountValue;

    private BigDecimal minOrderValue;

    private BigDecimal maxDiscountAmount;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDateTime startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDateTime endDate;

    private Boolean isActive = true;

    // Tier-based voucher fields
    private String voucherSource; // SHOP, TIER, LOYALTY
    private String requiredTier; // NEW, MEMBER, LOYAL, SILVER, GOLD, VIP

    // "Buy X Get Y" fields
    private Integer buyQuantity;
    private Integer getQuantity;

    // Apply to specific products
    private java.util.List<Long> productIds;

    // Gift product for "Buy A Get B"
    private Long giftProductId;
}
