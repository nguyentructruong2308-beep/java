package com.nhom25.ecommerce.dto;

import lombok.Data;
import java.util.List;

@Data
public class WishlistDTO {
    private List<ProductDTO> products;
    private int count;
}