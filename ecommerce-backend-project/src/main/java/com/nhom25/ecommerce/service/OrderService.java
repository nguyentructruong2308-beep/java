package com.nhom25.ecommerce.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nhom25.ecommerce.dto.AddressDTO;
import com.nhom25.ecommerce.dto.OrderDTO;
import com.nhom25.ecommerce.dto.OrderItemDTO;
import com.nhom25.ecommerce.dto.OrderItemToppingDTO;
import com.nhom25.ecommerce.dto.UserDTO;
import com.nhom25.ecommerce.entity.*;
import com.nhom25.ecommerce.exception.BadRequestException;
import com.nhom25.ecommerce.exception.ResourceNotFoundException;
import com.nhom25.ecommerce.repository.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductService productService;
    private final AddressRepository addressRepository;
    private final EmailService emailService;
    private final ReviewRepository reviewRepository;
    private final DiscountService discountService;

    @Transactional
    public OrderDTO createOrder(Long userId, Long addressId, String paymentMethod, String discountCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found or does not belong to user"));
        List<CartItem> cartItems = cartItemRepository.findByUserIdOrderByCreatedAtDesc(userId);

        if (cartItems.isEmpty()) {
            throw new BadRequestException("Giỏ hàng trống");
        }

        Order order = new Order();
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        order.setUser(user);
        order.setShippingAddress(address);
        order.setShippingAddressSnapshot(address.getFullAddress());
        order.setPaymentMethod(paymentMethod);

        // ===== [LOGIC GIAO HÀNG MỚI] =====
        // 1. Kiểm tra thành phố
        String city = address.getCity() != null ? address.getCity().toLowerCase().trim() : "";
        if (!city.contains("hồ chí minh") && !city.contains("hcm") && !city.contains("ho chi minh")
                && !city.contains("sài gòn")) {
            throw new BadRequestException(
                    "Hiện tại shop chỉ nhận giao hàng trong khu vực TP. Hồ Chí Minh để đảm bảo chất lượng kem.");
        }

        // 2. Kiểm tra quận để xác định phương thức giao
        String district = address.getDistrict() != null ? address.getDistrict().toLowerCase().trim() : "";
        boolean isShopDelivery = district.contains("thủ đức") || district.contains("thu duc") ||
                district.contains("quận 7") || district.contains("quan 7") ||
                (district.contains("quận 1") && !district.contains("10") && !district.contains("11")
                        && !district.contains("12"))
                ||
                (district.contains("quan 1") && !district.contains("10") && !district.contains("11")
                        && !district.contains("12"))
                ||
                district.contains("bình thạnh") || district.contains("binh thanh");

        if (isShopDelivery) {
            order.setShippingNote("Shop giao hàng tiêu chuẩn");
        } else {
            order.setShippingNote("Shop sẽ đặt Grab giao hàng. Quý khách vui lòng thanh toán phí ship cho tài xế.");
        }

        List<OrderItem> orderItems = cartItems.stream().map(cartItem -> {
            ProductVariant variant = cartItem.getProductVariant();
            Product product = variant != null ? variant.getProduct() : cartItem.getProduct();

            // 1. KIỂM TRA TỒN KHO
            int currentStock = variant != null ? variant.getStockQuantity()
                    : (product.getStockQuantity() != null ? product.getStockQuantity() : 0);
            if (currentStock < cartItem.getQuantity()) {
                throw new BadRequestException("Sản phẩm không đủ hàng trong kho: " + product.getName());
            }

            // 2. TRỪ KHO NGAY LẬP TỨC
            if (variant != null) {
                productService.updateVariantStock(variant.getId(), cartItem.getQuantity());
            } else {
                productService.updateProductStock(product.getId(), cartItem.getQuantity());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setCreatedAt(LocalDateTime.now());
            orderItem.setUpdatedAt(LocalDateTime.now());
            orderItem.setOrder(order);
            orderItem.setProductVariant(variant);
            orderItem.setProduct(product); // Liên kết trực tiếp tới product
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setIsGift(cartItem.getIsGift() != null ? cartItem.getIsGift() : false);

            // ===== BASE PRICE =====
            BigDecimal unitPrice;
            if (variant != null) {
                unitPrice = variant.getPrice() != null ? variant.getPrice() : product.getPrice();
            } else {
                // Giá theo size cho sp đơn giản
                if (cartItem.getSelectedSize() != null && product.getSizePrices() != null
                        && product.getSizePrices().containsKey(cartItem.getSelectedSize())) {
                    unitPrice = product.getSizePrices().get(cartItem.getSelectedSize());
                } else {
                    unitPrice = product.getPrice();
                }
            }

            // ===== TOPPING =====
            List<OrderItemTopping> orderItemToppings = cartItem.getToppings()
                    .stream()
                    .map(cartTopping -> {
                        OrderItemTopping oit = new OrderItemTopping();
                        oit.setCreatedAt(LocalDateTime.now());
                        oit.setUpdatedAt(LocalDateTime.now());
                        oit.setOrderItem(orderItem);
                        oit.setTopping(cartTopping.getTopping());
                        oit.setToppingName(cartTopping.getTopping().getName());
                        oit.setPrice(cartTopping.getPrice());
                        return oit;
                    })
                    .collect(Collectors.toList());

            orderItem.setToppings(orderItemToppings);

            BigDecimal toppingTotal = orderItemToppings.stream()
                    .map(OrderItemTopping::getPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // ===== TOTAL PRICE =====
            BigDecimal itemTotalPrice;
            if (Boolean.TRUE.equals(orderItem.getIsGift())) {
                unitPrice = BigDecimal.ZERO;
                itemTotalPrice = BigDecimal.ZERO;
            } else {
                itemTotalPrice = unitPrice
                        .add(toppingTotal)
                        .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            }

            orderItem.setUnitPrice(unitPrice);
            orderItem.setTotalPrice(itemTotalPrice);

            return orderItem;

        }).collect(Collectors.toList());

        BigDecimal totalBeforeDiscount = orderItems.stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // ===== XỬ LÝ MÃ GIẢM GIÁ =====
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (discountCode != null && !discountCode.trim().isEmpty()) {
            try {
                discountAmount = discountService.calculateDiscountAmount(discountCode, totalBeforeDiscount);
                order.setDiscountCode(discountCode.toUpperCase());
                order.setDiscountAmount(discountAmount);
            } catch (Exception e) {
                log.warn("Lỗi khi áp dụng mã giảm giá {}: {}", discountCode, e.getMessage());
                // Tiếp tục đặt hàng mà không có mã nếu mã không hợp lệ (hoặc ném lỗi nếu muốn
                // bắt buộc)
            }
        }

        BigDecimal finalTotal = totalBeforeDiscount.subtract(discountAmount);
        if (finalTotal.compareTo(BigDecimal.ZERO) < 0)
            finalTotal = BigDecimal.ZERO;

        order.setTotalAmount(finalTotal);
        order.setOrderItems(orderItems);

        if ("COD".equalsIgnoreCase(paymentMethod)) {
            order.setStatus(OrderStatus.PENDING);
            order.setPaymentStatus("PENDING");
        } else if ("VNPAY".equalsIgnoreCase(paymentMethod) || "MOMO".equalsIgnoreCase(paymentMethod)) {
            order.setStatus(OrderStatus.PENDING);
            order.setPaymentStatus("PENDING");
        } else {
            throw new BadRequestException("Phương thức thanh toán không hỗ trợ: " + paymentMethod);
        }

        // Lưu đơn hàng
        try {
            log.info("Attempting to save order for user: {}", userId);
            Order savedOrder = orderRepository.saveAndFlush(order);

            // CHỈ XÓA GIỎ HÀNG CHO COD - ONLINE PAYMENT SẼ XÓA SAU KHI THANH TOÁN THÀNH
            // CÔNG
            if ("COD".equalsIgnoreCase(paymentMethod)) {
                cartItemRepository.deleteAll(cartItems);
            }

            log.info("Order {} created ({}). Total: {}đ. Discount: {}đ.",
                    savedOrder.getId(), paymentMethod, finalTotal, discountAmount);

            // Gửi email xác nhận (Chạy async hoặc đơn giản gọi trực tiếp ở đây)
            try {
                emailService.sendOrderConfirmation(savedOrder);
            } catch (Exception e) {
                log.error("Lỗi gửi email xác nhận cho đơn hàng {}: {}", savedOrder.getId(), e.getMessage());
            }

            return convertToDTO(savedOrder);

        } catch (Exception e) {
            log.error("CRITICAL ERROR during order creation: {}", e.getMessage(), e);
            throw new BadRequestException("Lỗi hệ thống khi tạo đơn hàng: " + e.getMessage());
        }
    }

    @Transactional
    public OrderDTO confirmCodPayment(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!"COD".equalsIgnoreCase(order.getPaymentMethod()) || order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Order cannot be confirmed for payment.");
        }

        // [SỬA ĐỔI] XÓA LOGIC TRỪ KHO (Đã làm ở createOrder)
        // order.getOrderItems().forEach(orderItem -> {
        // productService.updateVariantStock(orderItem.getProductVariant().getId(),
        // orderItem.getQuantity());
        // });

        order.setStatus(OrderStatus.PROCESSING);
        order.setPaymentStatus("PAID");
        Order saved = orderRepository.saveAndFlush(order);

        // [SỬA ĐỔI] XÓA LOGIC XÓA GIỎ HÀNG (Đã làm ở createOrder)
        // cartItemRepository.deleteAllByUserId(order.getUser().getId());

        // ... (email logic)
        return convertToDTO(saved);
    }

    public void cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Order does not belong to user");
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Order cannot be cancelled. Current status: " + order.getStatus());
        }
        order.setStatus(OrderStatus.CANCELLED);

        // [SỬA ĐỔI] HOÀN KHO KHI HỦY ĐƠN
        // Vì kho đã bị trừ lúc createOrder, nên PENDING (chưa thanh toán)
        // khi hủy cũng phải hoàn kho.
        log.info("User cancelled order {}. Restoring stock.", orderId);
        try {
            order.getOrderItems().forEach(orderItem -> {
                if (orderItem.getProductVariant() != null) {
                    productService.restoreVariantStock(orderItem.getProductVariant().getId(), orderItem.getQuantity());
                } else if (orderItem.getProduct() != null) {
                    productService.restoreProductStock(orderItem.getProduct().getId(), orderItem.getQuantity());
                }
            });
        } catch (Exception e) {
            log.error("CRITICAL: Failed to restore stock for cancelled order {}: {}", orderId, e.getMessage());
        }

        orderRepository.save(order);
    }

    public OrderDTO updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);

        // Hoàn kho nếu hủy một đơn hàng đã được xử lý (đã trừ kho)
        if (newStatus == OrderStatus.CANCELLED
                && (oldStatus == OrderStatus.PROCESSING || oldStatus == OrderStatus.SHIPPED)) {
            log.info("Admin cancelled processed order {}. Restoring stock.", orderId);
            order.getOrderItems().forEach(orderItem -> {
                if (orderItem.getProductVariant() != null) {
                    productService.restoreVariantStock(orderItem.getProductVariant().getId(), orderItem.getQuantity());
                } else if (orderItem.getProduct() != null) {
                    productService.restoreProductStock(orderItem.getProduct().getId(), orderItem.getQuantity());
                }
            });
        }
        Order updatedOrder = orderRepository.save(order);

        // ===== LOGIC TÍCH ĐIỂM (LOYALTY POINTS) =====
        // Công thức: 100,000 VNĐ = 100 điểm → 1,000 VNĐ = 1 điểm
        if (newStatus == OrderStatus.DELIVERED && oldStatus != OrderStatus.DELIVERED) {
            User user = updatedOrder.getUser();
            int pointsToAdd = updatedOrder.getTotalAmount().divide(BigDecimal.valueOf(1000), 0, RoundingMode.FLOOR)
                    .intValue();
            if (pointsToAdd > 0) {
                int currentPoints = user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0;
                int newTotalPoints = currentPoints + pointsToAdd;
                user.setLoyaltyPoints(newTotalPoints);

                // Tự động nâng hạng dựa trên tổng điểm
                MembershipTier newTier = MembershipTier.fromPoints(newTotalPoints);
                MembershipTier oldTier = user.getMembershipTier() != null ? user.getMembershipTier()
                        : MembershipTier.NEW;
                user.setMembershipTier(newTier);

                userRepository.save(user);
                log.info("Added {} loyalty points to user {} for order {}. Total: {} points. Tier: {} -> {}",
                        pointsToAdd, user.getId(), orderId, newTotalPoints, oldTier.name(), newTier.name());
            }
        }

        return convertToDTO(updatedOrder);

    }

    // ... (Các phương thức get, update tracking không thay đổi) ...
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return convertToDTO(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByUser(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<OrderDTO> getOrdersByUser(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        return orderRepository
                .findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC,
                        "createdAt"))
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO updateOrderTracking(Long orderId, String trackingNumber) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setTrackingNumber(trackingNumber);
        if (order.getStatus() == OrderStatus.PROCESSING) {
            order.setStatus(OrderStatus.SHIPPED);
        }
        Order updatedOrder = orderRepository.save(order);
        // ... (email logic)
        return convertToDTO(updatedOrder);
    }

    public OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUser().getId());

        UserDTO userDTO = new UserDTO();
        userDTO.setId(order.getUser().getId());
        userDTO.setFirstName(order.getUser().getFirstName());
        userDTO.setLastName(order.getUser().getLastName());
        userDTO.setEmail(order.getUser().getEmail());
        userDTO.setRole(order.getUser().getRole());
        dto.setUser(userDTO);

        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setTrackingNumber(order.getTrackingNumber());

        // MỚI: Map mã giảm giá
        dto.setDiscountCode(order.getDiscountCode());
        dto.setDiscountAmount(order.getDiscountAmount());

        if (order.getShippingAddress() != null) {
            Address address = order.getShippingAddress();
            AddressDTO addressDTO = new AddressDTO();
            addressDTO.setId(address.getId());
            addressDTO.setFullName(address.getFullName());
            addressDTO.setPhone(address.getPhone());
            addressDTO.setStreet(address.getStreet());
            addressDTO.setCity(address.getCity());
            addressDTO.setDistrict(address.getDistrict());
            addressDTO.setWard(address.getWard());
            addressDTO.setIsDefault(address.getIsDefault());
            dto.setShippingAddress(addressDTO);

            // Bổ sung thông tin người nhận trực tiếp vào DTO cha
            dto.setRecipientName(address.getFullName());
            dto.setRecipientPhone(address.getPhone());
        }
        dto.setShippingAddressSnapshot(order.getShippingAddressSnapshot());
        dto.setShippingNote(order.getShippingNote());
        dto.setCreatedAt(order.getCreatedAt());
        if (order.getOrderItems() != null) {
            List<OrderItemDTO> orderItemDTOs = order.getOrderItems().stream()
                    .map(orderItem -> convertOrderItemToDTO(orderItem, order.getUser().getId()))
                    .collect(Collectors.toList());
            dto.setOrderItems(orderItemDTOs);
        }
        return dto;
    }

    private OrderItemDTO convertOrderItemToDTO(OrderItem orderItem, Long userId) {
        OrderItemDTO dto = new OrderItemDTO();
        ProductVariant variant = orderItem.getProductVariant();
        Product product = variant != null ? variant.getProduct() : orderItem.getProduct();

        dto.setId(orderItem.getId());
        if (product != null) {
            dto.setProductId(product.getId());
            String name = product.getName();
            if (variant != null) {
                String variantInfo = "";
                if (variant.getColor() != null && !variant.getColor().equalsIgnoreCase("null")) {
                    variantInfo = variant.getColor();
                }
                if (variant.getProductSize() != null) {
                    variantInfo = variantInfo.isEmpty() ? variant.getProductSize()
                            : variantInfo + " - " + variant.getProductSize();
                }
                if (!variantInfo.isEmpty()) {
                    name += " (" + variantInfo + ")";
                }
            }
            dto.setProductName(name);
        }
        dto.setProductVariantId(variant != null ? variant.getId() : null);
        dto.setQuantity(orderItem.getQuantity());
        dto.setUnitPrice(orderItem.getUnitPrice());
        dto.setTotalPrice(orderItem.getTotalPrice());
        dto.setIsGift(orderItem.getIsGift());
        boolean hasReviewed = product != null && reviewRepository.existsByUserIdAndProductIdAndOrderId(userId,
                product.getId(), orderItem.getOrder().getId());
        dto.setReviewed(hasReviewed);

        // ===== TOPPING DTO =====
        if (orderItem.getToppings() != null && !orderItem.getToppings().isEmpty()) {
            dto.setToppings(
                    orderItem.getToppings()
                            .stream()
                            .map(t -> {
                                OrderItemToppingDTO tdto = new OrderItemToppingDTO();
                                tdto.setId(t.getId());
                                tdto.setToppingName(t.getToppingName());
                                tdto.setPrice(t.getPrice());
                                return tdto;
                            })
                            .collect(Collectors.toList()));
        }

        return dto;

    }

    // [SỬA ĐỔI] XÓA LOGIC TRỪ KHO/XÓA GIỎ HÀNG
    // Chỉ cập nhật trạng thái
    @Transactional
    public OrderDTO handleVnPayCallback(Long orderId, String vnpResponseCode) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!"PENDING".equals(order.getPaymentStatus())) {
            throw new BadRequestException("Order is not in a valid state for payment");
        }

        if ("00".equals(vnpResponseCode)) { // 00 là code thành công của VNPAY
            order.setStatus(OrderStatus.PROCESSING);
            order.setPaymentStatus("PAID");

            // [SỬA ĐỔI] XÓA HẾT LOGIC TRỪ KHO VÀ XÓA GIỎ HÀNG

            orderRepository.save(order);
        } else {
            order.setStatus(OrderStatus.CANCELLED);
            order.setPaymentStatus("FAILED");

            // [SỬA ĐỔI] THÊM LOGIC HOÀN KHO KHI THANH TOÁN THẤT BẠI
            try {
                log.info("Restoring stock for failed payment on order {}", orderId);
                order.getOrderItems().forEach(item -> {
                    if (item.getProductVariant() != null) {
                        productService.restoreVariantStock(item.getProductVariant().getId(), item.getQuantity());
                    } else if (item.getProduct() != null) {
                        productService.restoreProductStock(item.getProduct().getId(), item.getQuantity());
                    }
                });
            } catch (Exception e) {
                log.error("CRITICAL: Failed to restore stock for cancelled order {}: {}", orderId, e.getMessage());
            }

            orderRepository.save(order);
        }

        return convertToDTO(order);
    }
}