package com.nhom25.ecommerce.controller;

import com.nhom25.ecommerce.dto.ProductDTO;
import com.nhom25.ecommerce.service.ViewHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/view-history")
@RequiredArgsConstructor
public class ViewHistoryController {

    private final ViewHistoryService viewHistoryService;

    /**
     * Ghi nhận lượt xem sản phẩm
     */
    @PostMapping("/{productId}")
    public ResponseEntity<Map<String, String>> recordView(@PathVariable Long productId) {
        viewHistoryService.recordView(productId);
        return ResponseEntity.ok(Map.of("message", "View recorded"));
    }

    /**
     * Lấy danh sách sản phẩm đã xem gần đây
     */
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getRecentlyViewed(
            @RequestParam(defaultValue = "10") int limit) {
        List<ProductDTO> products = viewHistoryService.getRecentlyViewed(limit);
        return ResponseEntity.ok(products);
    }
}
