package com.nhom25.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cart_items", indexes = {
        @Index(name = "idx_cartitem_user_id", columnList = "user_id"),
        @Index(name = "idx_cartitem_temp_cart_id", columnList = "tempCartId")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CartItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id") // Nullable cho sản phẩm đơn giản
    private ProductVariant productVariant;

    // [MỚI] Cho sản phẩm không có biến thể
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    // [MỚI] Size đã chọn cho sản phẩm đơn giản
    @Column(name = "selected_size")
    private String selectedSize;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "tempCartId")
    private String tempCartId;

    @Column(name = "is_gift")
    private Boolean isGift = false;

    // ================= TOPPING =================
    @OneToMany(mappedBy = "cartItem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER // ✅ THÊM
                                                                                                               // DÒNG
                                                                                                               // NÀY
    )
    private List<CartItemTopping> toppings = new ArrayList<>();

}
