package com.nhom25.ecommerce.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ToppingDTO {

    private Long id;
    private String name;
    private BigDecimal price;
    private String imageUrl;
}
