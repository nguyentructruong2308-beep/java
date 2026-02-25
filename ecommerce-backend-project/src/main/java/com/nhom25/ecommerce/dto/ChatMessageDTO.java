package com.nhom25.ecommerce.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private String role; // "user" or "assistant"
    private String content;
    private LocalDateTime timestamp;
}
