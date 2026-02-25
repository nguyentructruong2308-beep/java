package com.nhom25.ecommerce.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.nhom25.ecommerce.util.JpaMapConverter;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Product extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = JpaMapConverter.class)
    private Map<String, String> specifications;

    @Column(name = "average_rating")
    private Double averageRating = 0.0;

    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @Column(name = "view_count")
    private Long viewCount = 0L;

    @Column(name = "sold_count")
    private Long soldCount = 0L;

    // Tồn kho cho sản phẩm không có biến thể
    @Column(name = "stock_quantity")
    private Integer stockQuantity = 0;

    // Các size có sẵn cho sản phẩm không có biến thể (VD: "M,L,XL")
    @Column(name = "available_sizes", length = 255)
    private String availableSizes;

    // Giá tùy chỉnh cho từng size (nếu có)
    @ElementCollection
    @CollectionTable(name = "product_size_prices", joinColumns = @JoinColumn(name = "product_id"))
    @MapKeyColumn(name = "size_name")
    @Column(name = "price")
    private Map<String, BigDecimal> sizePrices;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVariant> variants = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "product_discounts", joinColumns = @JoinColumn(name = "product_id"), inverseJoinColumns = @JoinColumn(name = "discount_id"))
    private List<Discount> discounts;

    // [XÓA] Mối quan hệ này không còn đúng nữa vì OrderItem giờ liên kết với
    // ProductVariant.
    // @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch =
    // FetchType.LAZY)
    // private List<OrderItem> orderItems;
    // [XÓA] Mối quan hệ này không còn đúng nữa vì CartItem giờ liên kết với
    // ProductVariant.
    // @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch =
    // FetchType.LAZY)
    // private List<CartItem> cartItems;
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Review> reviews;
}
