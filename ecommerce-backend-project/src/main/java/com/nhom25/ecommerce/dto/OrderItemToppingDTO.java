package com.nhom25.ecommerce.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemToppingDTO {
    private Long id;
    private String toppingName;
    private BigDecimal price;
}
