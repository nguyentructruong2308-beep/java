package com.nhom25.ecommerce.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BlogDTO {
    private Long id;
    private String title;
    private String content;
    private String excerpt;
    private String imageUrl;
    private String author;
    private String category;
    private boolean published;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
