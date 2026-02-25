package com.nhom25.ecommerce.dto;

import lombok.Data;

@Data
public class LowStockDTO {
    private String name;
    private String variantInfo;
    private Integer currentStock;
    private Long productId;
}
