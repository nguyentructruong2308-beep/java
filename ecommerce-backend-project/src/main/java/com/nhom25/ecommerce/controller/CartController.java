package com.nhom25.ecommerce.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.nhom25.ecommerce.dto.CartItemDTO;
import com.nhom25.ecommerce.dto.UserDTO;
import com.nhom25.ecommerce.exception.BadRequestException;
import com.nhom25.ecommerce.service.CartService;
import com.nhom25.ecommerce.service.UserService;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    // =====================================================
    // ADD TO CART (CÓ / KHÔNG TOPPING)
    // =====================================================
    @PostMapping("/add")
    public ResponseEntity<CartItemDTO> addToCart(
            @RequestParam(required = false) Long productVariantId,
            @RequestParam(required = false) Long productId, // hỗ trợ frontend cũ
            @RequestParam(defaultValue = "1") Integer quantity,
            @RequestParam(required = false) List<Long> toppingIds,
            @RequestParam(required = false) String selectedSize, // Size đã chọn (cho sản phẩm không có biến thể)
            @RequestParam(defaultValue = "false") Boolean isGift,
            Authentication authentication) {

        // 🔥 FIX LỖI 500: authentication null
        if (authentication == null) {
            throw new BadRequestException("User not authenticated");
        }

        UserDTO user = userService.getUserByEmail(authentication.getName());

        // Nếu có productVariantId thì dùng trực tiếp
        if (productVariantId != null) {
            CartItemDTO cartItem = cartService.addToCart(
                    user.getId(),
                    productVariantId,
                    quantity,
                    toppingIds,
                    isGift);
            return new ResponseEntity<>(cartItem, HttpStatus.CREATED);
        }

        // Nếu chỉ có productId (sản phẩm không có biến thể hoặc map sang variant mặc
        // định)
        if (productId != null) {
            Long variantId = cartService.getDefaultVariantId(productId);
            if (variantId != null) {
                // Có variant mặc định
                CartItemDTO cartItem = cartService.addToCart(
                        user.getId(),
                        variantId,
                        quantity,
                        toppingIds,
                        isGift);
                return new ResponseEntity<>(cartItem, HttpStatus.CREATED);
            } else {
                // Sản phẩm không có biến thể - thêm trực tiếp bằng productId
                CartItemDTO cartItem = cartService.addProductToCart(
                        user.getId(),
                        productId,
                        quantity,
                        toppingIds,
                        selectedSize,
                        isGift);
                return new ResponseEntity<>(cartItem, HttpStatus.CREATED);
            }
        }

        throw new BadRequestException("Missing productVariantId or productId");
    }

    // =====================================================
    // GET CART ITEMS
    // =====================================================
    @GetMapping
    public ResponseEntity<List<CartItemDTO>> getCartItems(Authentication authentication) {

        if (authentication == null) {
            throw new BadRequestException("User not authenticated");
        }

        UserDTO user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(cartService.getCartItems(user.getId()));
    }

    // =====================================================
    // GET CART TOTAL
    // =====================================================
    @GetMapping("/total")
    public ResponseEntity<BigDecimal> getCartTotal(Authentication authentication) {

        if (authentication == null) {
            throw new BadRequestException("User not authenticated");
        }

        UserDTO user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(cartService.getCartTotal(user.getId()));
    }

    // =====================================================
    // UPDATE CART ITEM
    // =====================================================
    @PutMapping("/{cartItemId}")
    public ResponseEntity<CartItemDTO> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity,
            Authentication authentication) {

        if (authentication == null) {
            throw new BadRequestException("User not authenticated");
        }

        UserDTO user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(
                cartService.updateCartItem(user.getId(), cartItemId, quantity));
    }

    // =====================================================
    // REMOVE CART ITEM
    // =====================================================
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(
            @PathVariable Long cartItemId,
            Authentication authentication) {

        if (authentication == null) {
            throw new BadRequestException("User not authenticated");
        }

        UserDTO user = userService.getUserByEmail(authentication.getName());
        cartService.removeFromCart(user.getId(), cartItemId);
        return ResponseEntity.noContent().build();
    }

    // =====================================================
    // CLEAR CART
    // =====================================================
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(Authentication authentication) {

        if (authentication == null) {
            throw new BadRequestException("User not authenticated");
        }

        UserDTO user = userService.getUserByEmail(authentication.getName());
        cartService.clearCart(user.getId());
        return ResponseEntity.noContent().build();
    }
}
