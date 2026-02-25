package com.nhom25.ecommerce.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "toppings")
@Data
@EqualsAndHashCode(callSuper = false)
public class Topping extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name; // Trân châu, Socola chip, Hạnh nhân...

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price; // Giá cộng thêm

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "is_active")
    private Boolean isActive = true;
}
