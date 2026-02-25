package com.nhom25.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "discounts")
@Data
@EqualsAndHashCode(callSuper = true)
public class Discount extends BaseEntity {

    // Mã giảm giá (coupon code) người dùng nhập
    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(nullable = false)
    private String name;

    private String description;

    // Giá trị đơn hàng tối thiểu để áp dụng mã
    @Column(name = "min_order_value")
    private BigDecimal minOrderValue;

    // Giới hạn số tiền giảm tối đa (cho loại PERCENTAGE)
    @Column(name = "max_discount_amount")
    private BigDecimal maxDiscountAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false)
    private BigDecimal discountValue;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // Loại voucher: SHOP (ai cũng dùng), TIER (theo hạng), LOYALTY (từ đổi điểm)
    @Enumerated(EnumType.STRING)
    @Column(name = "voucher_source")
    private VoucherSource voucherSource = VoucherSource.SHOP;

    // Hạng tối thiểu để sử dụng voucher (null = không yêu cầu hạng)
    @Enumerated(EnumType.STRING)
    @Column(name = "required_tier")
    private MembershipTier requiredTier;

    // Một khuyến mãi có thể áp dụng cho nhiều sản phẩm
    @ManyToMany(mappedBy = "discounts", fetch = FetchType.LAZY)
    private List<Product> products;

    // --- MỚI: Hỗ trợ "Mua X Tặng Y" ---
    @Column(name = "buy_quantity")
    private Integer buyQuantity; // Mua bao nhiêu

    @Column(name = "get_quantity")
    private Integer getQuantity; // Được bao nhiêu

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gift_product_id")
    private Product giftProduct;
}