package com.nhom25.ecommerce.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nhom25.ecommerce.dto.CartItemDTO;
import com.nhom25.ecommerce.dto.ToppingDTO;
import com.nhom25.ecommerce.entity.*;
import com.nhom25.ecommerce.exception.BadRequestException;
import com.nhom25.ecommerce.exception.ResourceNotFoundException;
import com.nhom25.ecommerce.repository.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    // private final CartItemToppingRepository cartItemToppingRepository; // Unused
    private final ToppingRepository toppingRepository;
    private final ProductRepository productRepository; // [MỚI]

    // =====================================================
    // ADD TO CART (KHÔNG TOPPING – GIỮ NGUYÊN)
    // =====================================================
    public CartItemDTO addToCart(Long userId, Long productVariantId, Integer quantity) {
        return addToCart(userId, productVariantId, quantity, null, false);
    }

    public CartItemDTO addToCart(Long userId, Long productVariantId, Integer quantity, Boolean isGift) {
        return addToCart(userId, productVariantId, quantity, null, isGift);
    }

    // =====================================================
    // ADD TO CART (CÓ TOPPING) ⭐⭐⭐
    // =====================================================
    public CartItemDTO addToCart(
            Long userId,
            Long productVariantId,
            Integer quantity,
            List<Long> toppingIds,
            Boolean isGift) {
        final Boolean finalIsGift = (isGift != null) ? isGift : false;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        ProductVariant variant = productVariantRepository.findById(productVariantId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product Variant not found with id: " + productVariantId));

        if (!variant.getProduct().getIsActive()) {
            throw new BadRequestException("Product is not available");
        }

        if (variant.getStockQuantity() < quantity) {
            throw new BadRequestException("Insufficient stock. Available: " + variant.getStockQuantity());
        }

        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndProductVariantId(userId, productVariantId)
                .stream().filter(item -> item.getIsGift().equals(finalIsGift)).findFirst();

        CartItem cartItem;
        if (existingItem.isPresent()) {
            cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + quantity;

            if (variant.getStockQuantity() < newQuantity) {
                throw new BadRequestException("Insufficient stock. Available: " + variant.getStockQuantity());
            }

            cartItem.setQuantity(newQuantity);

            // ❗ Nếu add lại → xóa topping cũ
            cartItem.getToppings().clear();
        } else {
            cartItem = new CartItem();
            cartItem.setUser(user);
            cartItem.setProductVariant(variant);
            cartItem.setQuantity(quantity);
            cartItem.setIsGift(finalIsGift);
        }

        // ================= ADD TOPPING =================
        if (toppingIds != null && !toppingIds.isEmpty()) {
            List<Topping> toppings = toppingRepository.findAllById(toppingIds);

            if (toppings.size() != toppingIds.size()) {
                throw new BadRequestException("Invalid topping selection");
            }

            for (Topping topping : toppings) {
                if (!topping.getIsActive()) {
                    throw new BadRequestException("Topping is inactive: " + topping.getName());
                }

                CartItemTopping cit = new CartItemTopping();
                cit.setCartItem(cartItem);
                cit.setTopping(topping);
                cit.setPrice(topping.getPrice());

                cartItem.getToppings().add(cit);
            }
        }

        CartItem savedItem = cartItemRepository.save(cartItem);
        return convertToDTO(savedItem);
    }

    // =====================================================
    // ADD PRODUCT TO CART (CHO SẢN PHẨM KHÔNG CÓ BIẾN THỂ)
    // =====================================================
    public CartItemDTO addProductToCart(
            Long userId,
            Long productId,
            Integer quantity,
            List<Long> toppingIds,
            String selectedSize,
            Boolean isGift) {
        final Boolean finalIsGift = (isGift != null) ? isGift : false;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!product.getIsActive()) {
            throw new BadRequestException("Product is not available");
        }

        // Kiểm tra tồn kho (Global stock of product)
        int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        if (currentStock < quantity) {
            throw new BadRequestException("Insufficient stock. Available: " + currentStock);
        }

        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndProductIdAndSelectedSize(userId, productId,
                selectedSize).stream().filter(item -> item.getIsGift().equals(finalIsGift)).findFirst();

        CartItem cartItem;
        if (existingItem.isPresent()) {
            cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + quantity;

            if (currentStock < newQuantity) {
                throw new BadRequestException("Insufficient stock. Available: " + currentStock);
            }

            cartItem.setQuantity(newQuantity);
            cartItem.getToppings().clear(); // Reset toppings on update
        } else {
            cartItem = new CartItem();
            cartItem.setUser(user);
            cartItem.setProduct(product); // Link to product
            cartItem.setProductVariant(null); // No variant
            cartItem.setSelectedSize(selectedSize); // Store size
            cartItem.setQuantity(quantity);
            cartItem.setIsGift(finalIsGift);
        }

        // ================= ADD TOPPING =================
        if (toppingIds != null && !toppingIds.isEmpty()) {
            List<Topping> toppings = toppingRepository.findAllById(toppingIds);
            if (toppings.size() != toppingIds.size()) {
                throw new BadRequestException("Invalid topping selection");
            }
            for (Topping topping : toppings) {
                if (!topping.getIsActive())
                    throw new BadRequestException("Topping is inactive: " + topping.getName());
                CartItemTopping cit = new CartItemTopping();
                cit.setCartItem(cartItem);
                cit.setTopping(topping);
                cit.setPrice(topping.getPrice());
                cartItem.getToppings().add(cit);
            }
        }

        CartItem savedItem = cartItemRepository.save(cartItem);
        return convertToDTO(savedItem);
    }

    // =====================================================
    // UPDATE CART ITEM
    // =====================================================
    public CartItemDTO updateCartItem(Long userId, Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new BadRequestException("Cart item does not belong to user");
        }

        // Check stock logic update
        int availableStock;
        if (cartItem.getProductVariant() != null) {
            availableStock = cartItem.getProductVariant().getStockQuantity();
        } else {
            availableStock = cartItem.getProduct().getStockQuantity();
        }

        if (availableStock < quantity) {
            throw new BadRequestException("Insufficient stock. Available: " + availableStock);
        }

        cartItem.setQuantity(quantity);
        CartItem updatedItem = cartItemRepository.save(cartItem);
        return convertToDTO(updatedItem);
    }

    // =====================================================
    // REMOVE CART ITEM
    // =====================================================
    public void removeFromCart(Long userId, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new BadRequestException("Cart item does not belong to user");
        }

        cartItemRepository.delete(cartItem);
    }

    // =====================================================
    // GET CART ITEMS
    // =====================================================
    @Transactional(readOnly = true)
    public List<CartItemDTO> getCartItems(Long userId) {
        return cartItemRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // =====================================================
    // GET CART TOTAL (CÓ TOPPING)
    // =====================================================
    private BigDecimal calculateItemTotal(CartItem cartItem) {
        if (Boolean.TRUE.equals(cartItem.getIsGift())) {
            return BigDecimal.ZERO;
        }

        ProductVariant variant = cartItem.getProductVariant();
        Product product = variant != null ? variant.getProduct() : cartItem.getProduct();

        if (product == null)
            return BigDecimal.ZERO;

        BigDecimal basePrice;
        if (variant != null) {
            basePrice = variant.getPrice() != null ? variant.getPrice() : product.getPrice();
        } else {
            // Sản phẩm đơn giản: Kiểm tra giá theo size
            if (cartItem.getSelectedSize() != null && product.getSizePrices() != null
                    && product.getSizePrices().containsKey(cartItem.getSelectedSize())) {
                basePrice = product.getSizePrices().get(cartItem.getSelectedSize());
            } else {
                basePrice = product.getPrice();
            }
        }

        BigDecimal toppingTotal = BigDecimal.ZERO;

        if (cartItem.getToppings() != null && !cartItem.getToppings().isEmpty()) {
            toppingTotal = cartItem.getToppings()
                    .stream()
                    .map(CartItemTopping::getPrice)
                    .filter(p -> p != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        return basePrice
                .add(toppingTotal)
                .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
    }

    // =====================================================
    // CLEAR CART
    // =====================================================
    @Transactional
    public void clearCart(Long userId) {
        List<CartItem> items = cartItemRepository.findByUserIdOrderByCreatedAtDesc(userId);
        cartItemRepository.deleteAll(items);
    }

    // =====================================================
    // CONVERT DTO (BASE – FE đã dùng)
    // =====================================================
    private CartItemDTO convertToDTO(CartItem cartItem) {
        CartItemDTO dto = new CartItemDTO();
        ProductVariant variant = cartItem.getProductVariant();
        // Nếu variant null thì lấy product từ cartItem
        Product product = variant != null ? variant.getProduct() : cartItem.getProduct();

        dto.setId(cartItem.getId());
        dto.setProductId(product.getId());
        dto.setProductVariantId(variant != null ? variant.getId() : null);
        dto.setProductName(product.getName());
        dto.setQuantity(cartItem.getQuantity());
        dto.setIsGift(cartItem.getIsGift());

        BigDecimal unitPrice;
        String imageUrl;
        String size;
        String color;

        if (variant != null) {
            unitPrice = variant.getPrice() != null ? variant.getPrice() : product.getPrice();
            imageUrl = variant.getImageUrl() != null ? variant.getImageUrl() : product.getImageUrl();
            size = variant.getProductSize();
            color = variant.getColor();
        } else {
            // Simple product logic
            if (cartItem.getSelectedSize() != null && product.getSizePrices() != null
                    && product.getSizePrices().containsKey(cartItem.getSelectedSize())) {
                unitPrice = product.getSizePrices().get(cartItem.getSelectedSize());
            } else {
                unitPrice = product.getPrice();
            }
            imageUrl = product.getImageUrl();
            size = cartItem.getSelectedSize(); // Size từ field mới
            color = null; // Không có màu cho sp đơn giản
        }

        dto.setColor(color);
        dto.setSize(size);
        dto.setUnitPrice(unitPrice);
        dto.setTotalPrice(calculateItemTotal(cartItem));
        dto.setImageUrl(imageUrl);

        // [MỚI] Set danh sách topping
        if (cartItem.getToppings() != null && !cartItem.getToppings().isEmpty()) {
            List<ToppingDTO> toppingDTOs = cartItem.getToppings().stream()
                    .map(cit -> {
                        ToppingDTO toppingDTO = new ToppingDTO();
                        toppingDTO.setId(cit.getTopping().getId());
                        toppingDTO.setName(cit.getTopping().getName());
                        toppingDTO.setPrice(cit.getPrice());
                        toppingDTO.setImageUrl(cit.getTopping().getImageUrl());
                        return toppingDTO;
                    })
                    .collect(Collectors.toList());
            dto.setToppings(toppingDTOs);
        }

        return dto;
    }

    public BigDecimal getCartTotal(Long userId) {
        List<CartItem> cartItems = cartItemRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return cartItems.stream()
                .map(this::calculateItemTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // =====================================================
    // HELPER: LẤY BIẾN THỂ MẶC ĐỊNH TỪ PRODUCT ID
    // =====================================================
    public Long getDefaultVariantId(Long productId) {
        // [FIX] Ưu tiên lấy biến thể còn hàng trước để nút "Thêm nhanh" (+) hoạt động
        List<ProductVariant> variants = productVariantRepository.findAllByProductId(productId);
        if (variants.isEmpty())
            return null;

        // Tìm variant đầu tiên còn hàng
        return variants.stream()
                .filter(v -> v.getStockQuantity() > 0)
                .map(ProductVariant::getId)
                .findFirst()
                // Nếu tất cả hết hàng, trả về cái đầu tiên (để Controller báo lỗi Insufficient
                // stock cụ thể)
                .orElse(variants.get(0).getId());
    }

}
