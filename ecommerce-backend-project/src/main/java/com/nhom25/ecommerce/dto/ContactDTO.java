package com.nhom25.ecommerce.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ContactDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String subject;
    private String message;
    private Boolean isRead;
    private String response;
    private LocalDateTime createdAt;
}
