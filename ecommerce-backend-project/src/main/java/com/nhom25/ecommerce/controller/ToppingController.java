package com.nhom25.ecommerce.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.nhom25.ecommerce.dto.ToppingDTO;
import com.nhom25.ecommerce.entity.Topping;
import com.nhom25.ecommerce.exception.ResourceNotFoundException;
import com.nhom25.ecommerce.repository.ToppingRepository;

import java.util.List;

@RestController
@RequestMapping("/api/toppings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ToppingController {

    private final ToppingRepository toppingRepository;

    // =====================================================
    // CLIENT: Lấy tất cả topping đang active
    // =====================================================
    @GetMapping
    public List<Topping> getAllActiveToppings() {
        return toppingRepository.findByIsActiveTrue();
    }

    // Lấy topping theo product ID (trả về tất cả topping active)
    @GetMapping("/product/{productId}")
    public List<Topping> getToppingsByProduct(@PathVariable Long productId) {
        return toppingRepository.findByIsActiveTrue();
    }

    // =====================================================
    // ADMIN: Lấy TẤT CẢ topping (bao gồm inactive)
    // =====================================================
    @GetMapping("/admin/all")
    public List<Topping> getAllToppingsForAdmin() {
        return toppingRepository.findAll();
    }

    // =====================================================
    // ADMIN: Thêm topping mới
    // =====================================================
    @PostMapping
    public ResponseEntity<Topping> createTopping(@RequestBody ToppingDTO dto) {
        Topping topping = new Topping();
        topping.setName(dto.getName());
        topping.setPrice(dto.getPrice());
        topping.setImageUrl(dto.getImageUrl());
        topping.setIsActive(true);

        Topping saved = toppingRepository.save(topping);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // =====================================================
    // ADMIN: Cập nhật topping
    // =====================================================
    @PutMapping("/{id}")
    public ResponseEntity<Topping> updateTopping(
            @PathVariable Long id,
            @RequestBody ToppingDTO dto) {
        Topping topping = toppingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topping not found with id: " + id));

        topping.setName(dto.getName());
        topping.setPrice(dto.getPrice());
        topping.setImageUrl(dto.getImageUrl());

        Topping updated = toppingRepository.save(topping);
        return ResponseEntity.ok(updated);
    }

    // =====================================================
    // ADMIN: Xóa topping (soft delete - set isActive = false)
    // =====================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopping(@PathVariable Long id) {
        Topping topping = toppingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topping not found with id: " + id));

        topping.setIsActive(false);
        toppingRepository.save(topping);
        return ResponseEntity.noContent().build();
    }

    // =====================================================
    // ADMIN: Khôi phục topping đã xóa
    // =====================================================
    @PutMapping("/{id}/restore")
    public ResponseEntity<Topping> restoreTopping(@PathVariable Long id) {
        Topping topping = toppingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topping not found with id: " + id));

        topping.setIsActive(true);
        Topping restored = toppingRepository.save(topping);
        return ResponseEntity.ok(restored);
    }
}
