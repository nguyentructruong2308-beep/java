package com.nhom25.ecommerce.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.nhom25.ecommerce.dto.CreateDiscountRequest;
import com.nhom25.ecommerce.dto.DiscountDTO;
import com.nhom25.ecommerce.service.DiscountService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DiscountController {

    private final DiscountService discountService;

    /**
     * Lấy tất cả mã giảm giá (Admin)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DiscountDTO>> getAllDiscounts() {
        return ResponseEntity.ok(discountService.getAllDiscounts());
    }

    /**
     * Lấy mã giảm giá theo ID (Admin)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DiscountDTO> getDiscountById(@PathVariable Long id) {
        return ResponseEntity.ok(discountService.getDiscountById(id));
    }

    /**
     * Tạo mã giảm giá mới (Admin)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DiscountDTO> createDiscount(@Valid @RequestBody CreateDiscountRequest request) {
        DiscountDTO discount = discountService.createDiscount(request);
        return new ResponseEntity<>(discount, HttpStatus.CREATED);
    }

    /**
     * Cập nhật mã giảm giá (Admin)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DiscountDTO> updateDiscount(
            @PathVariable Long id,
            @Valid @RequestBody CreateDiscountRequest request) {
        return ResponseEntity.ok(discountService.updateDiscount(id, request));
    }

    /**
     * Xóa mã giảm giá (Admin)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteDiscount(@PathVariable Long id) {
        discountService.deleteDiscount(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa mã giảm giá thành công!"));
    }

    /**
     * Validate mã giảm giá (Client - dùng khi checkout)
     */
    @PostMapping("/validate")
    public ResponseEntity<DiscountDTO> validateDiscount(
            @RequestParam String code,
            @RequestParam BigDecimal orderTotal) {
        return ResponseEntity.ok(discountService.validateDiscountCode(code, orderTotal));
    }

    /**
     * Tính số tiền được giảm (Client)
     */
    @PostMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateDiscount(
            @RequestParam String code,
            @RequestParam BigDecimal orderTotal) {
        DiscountDTO discount = discountService.validateDiscountCode(code, orderTotal);
        BigDecimal discountAmount = discountService.calculateDiscountAmount(code, orderTotal);

        return ResponseEntity.ok(Map.of(
                "discount", discount,
                "discountAmount", discountAmount,
                "finalTotal", orderTotal.subtract(discountAmount)));
    }

    /**
     * Lấy các deal đang hoạt động (Public)
     */
    @GetMapping("/public/active")
    public ResponseEntity<List<DiscountDTO>> getActivePublicDeals() {
        return ResponseEntity.ok(discountService.getActivePublicDeals());
    }
}
