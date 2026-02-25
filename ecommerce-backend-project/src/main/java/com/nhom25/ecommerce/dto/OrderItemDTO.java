package com.nhom25.ecommerce.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderItemDTO {

    private Long id;

    // ID sản phẩm cha (ice cream)
    private Long productId;

    // ID biến thể (size kem)
    private Long productVariantId;

    // Tên hiển thị (ví dụ: Kem Vani - Size L)
    private String productName;

    private Integer quantity;

    // Giá kem (chưa topping) tại thời điểm mua
    private BigDecimal unitPrice;

    // Tổng tiền = (kem + topping) * quantity
    private BigDecimal totalPrice;

    private boolean reviewed;

    private Boolean isGift;

    // =================== [MỚI] TOPPING ===================

    // Danh sách topping khách chọn cho item này
    private List<OrderItemToppingDTO> toppings;
}
