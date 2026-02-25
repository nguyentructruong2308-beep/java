package com.nhom25.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_item_toppings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class OrderItemTopping extends BaseEntity {

    // Đơn hàng nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;

    // Topping gốc (để trace)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topping_id")
    private Topping topping;

    // ✅ SNAPSHOT TÊN TOPPING (QUAN TRỌNG)
    @Column(name = "topping_name", nullable = false)
    private String toppingName;

    // Giá topping tại thời điểm mua
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
}
