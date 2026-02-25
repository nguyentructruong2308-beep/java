package com.nhom25.ecommerce.controller;

import com.nhom25.ecommerce.dto.ChatMessageDTO;
import com.nhom25.ecommerce.service.AIChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class AIChatController {

    private final AIChatService aiChatService;

    /**
     * Endpoint để gửi tin nhắn và nhận phản hồi từ AI
     */
    @PostMapping("/message")
    public ResponseEntity<ChatMessageDTO> sendMessage(@RequestBody Map<String, Object> request) {
        String message = (String) request.get("message");

        @SuppressWarnings("unchecked")
        List<Map<String, String>> historyRaw = (List<Map<String, String>>) request.getOrDefault("history",
                new ArrayList<>());

        List<ChatMessageDTO> history = new ArrayList<>();
        for (Map<String, String> msg : historyRaw) {
            history.add(ChatMessageDTO.builder()
                    .role(msg.get("role"))
                    .content(msg.get("content"))
                    .build());
        }

        ChatMessageDTO response = aiChatService.processMessage(message, history);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint để lấy tin nhắn chào mừng ban đầu
     */
    @GetMapping("/welcome")
    public ResponseEntity<ChatMessageDTO> getWelcomeMessage() {
        return ResponseEntity.ok(ChatMessageDTO.builder()
                .role("assistant")
                .content("🍦 Xin chào! Tôi là trợ lý AI của ICREAM.\n\n" +
                        "Tôi có thể giúp bạn:\n" +
                        "• Tìm kiếm sản phẩm\n" +
                        "• Xem danh mục\n" +
                        "• Thông tin đặt hàng\n" +
                        "• Khuyến mãi\n\n" +
                        "Hãy hỏi tôi bất cứ điều gì! 😊")
                .timestamp(LocalDateTime.now())
                .build());
    }
}
