package com.nhom25.ecommerce.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TopProductDTO {
    private Long productId;
    private String name;
    private Long salesCount;
    private BigDecimal totalRevenue;
    private String imageUrl;
}
