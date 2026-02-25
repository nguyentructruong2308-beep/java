package com.nhom25.ecommerce.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize; // <-- ĐÃ XÓA
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import com.nhom25.ecommerce.dto.CreatePaymentRequestDTO;
import com.nhom25.ecommerce.dto.CreatePaymentResponseDTO;
import com.nhom25.ecommerce.entity.Order;
import com.nhom25.ecommerce.entity.PaymentStatus;
import com.nhom25.ecommerce.entity.PaymentTransaction;
import com.nhom25.ecommerce.exception.BadRequestException;
import com.nhom25.ecommerce.exception.ResourceNotFoundException;
import com.nhom25.ecommerce.repository.OrderRepository;
import com.nhom25.ecommerce.service.CartService;
import com.nhom25.ecommerce.service.PaymentGatewayService;
import com.nhom25.ecommerce.service.UserService;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
@Slf4j
public class PaymentController {

    private final PaymentGatewayService vnPayService;
    private final PaymentGatewayService momoService;
    private final OrderRepository orderRepository;
    private final UserService userService;
    private final CartService cartService;

    @org.springframework.beans.factory.annotation.Value("${app.frontend-url}")
    private String frontendUrl;

    public PaymentController(
            @Qualifier("vnPayServiceImpl") PaymentGatewayService vnPayService,
            @Qualifier("momoServiceImpl") PaymentGatewayService momoService,
            OrderRepository orderRepository,
            UserService userService,
            CartService cartService) {
        this.vnPayService = vnPayService;
        this.momoService = momoService;
        this.orderRepository = orderRepository;
        this.userService = userService;
        this.cartService = cartService;
    }

    private PaymentGatewayService getService(String method) {
        if ("VNPAY".equalsIgnoreCase(method))
            return vnPayService;
        if ("MOMO".equalsIgnoreCase(method))
            return momoService;
        throw new BadRequestException("Gateway không hỗ trợ: " + method);
    }

    @PostMapping("/create")
    public ResponseEntity<CreatePaymentResponseDTO> createPayment(
            @Valid @RequestBody CreatePaymentRequestDTO requestDTO,
            Authentication authentication,
            HttpServletRequest request) {

        Long userId = userService.getUserByEmail(authentication.getName()).getId();
        Order order = orderRepository.findById(requestDTO.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not own this order.");
        }

        PaymentGatewayService service = getService(order.getPaymentMethod());
        CreatePaymentResponseDTO response = service.createPaymentUrl(order, request);
        return ResponseEntity.ok(response);
    }

    // --- VNPAY CALLBACKS ---

    @GetMapping("/vnpay_return")
    public ResponseEntity<Void> vnpayReturn(
            @RequestParam Map<String, String> params,
            HttpServletRequest request) {
        log.info("VNPAY return URL called: {}", params);
        return handleReturn(vnPayService, params);
    }

    @GetMapping("/vnpay_ipn")
    public ResponseEntity<Map<String, String>> vnpayIpn(
            @RequestParam Map<String, String> params) {
        log.info("VNPAY IPN URL called: {}", params);
        try {
            PaymentTransaction transaction = vnPayService.handlePaymentCallback(params);

            // XÓA GIỎ HÀNG NẾU THANH TOÁN THÀNH CÔNG
            if (transaction.getStatus() == PaymentStatus.SUCCESSFUL) {
                try {
                    Long userId = transaction.getOrder().getUser().getId();
                    cartService.clearCart(userId);
                } catch (Exception e) {
                    log.error("Failed to clear cart in IPN: {}", e.getMessage());
                }
            }

            return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
        } catch (Exception e) {
            log.error("Error processing VNPAY IPN: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("RspCode", "99", "Message", "Failed"));
        }
    }

    // --- MOMO CALLBACKS ---

    @GetMapping("/momo_return")
    public ResponseEntity<Void> momoReturn(
            @RequestParam Map<String, String> params) {
        log.info("MOMO return URL called: {}", params);
        return handleReturn(momoService, params);
    }

    @PostMapping("/momo_ipn")
    public ResponseEntity<Map<String, String>> momoIpn(
            @RequestBody Map<String, String> params) {

        log.info("MOMO IPN URL called: {}", params);
        try {
            PaymentTransaction transaction = momoService.handlePaymentCallback(params);

            // XÓA GIỎ HÀNG NẾU THANH TOÁN THÀNH CÔNG (IPN có thể đến trước Return URL)
            if (transaction.getStatus() == PaymentStatus.SUCCESSFUL) {
                try {
                    Long userId = transaction.getOrder().getUser().getId();
                    cartService.clearCart(userId);
                } catch (Exception e) {
                    log.error("Failed to clear cart in IPN: {}", e.getMessage());
                }
            }

            return ResponseEntity.ok(Map.of("message", "Success"));
        } catch (Exception e) {
            log.error("Error processing MOMO IPN: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Failed"));
        }
    }

    // Helper xử lý redirect về Frontend
    private ResponseEntity<Void> handleReturn(PaymentGatewayService service, Map<String, String> params) {

        UriComponentsBuilder urlBuilder = UriComponentsBuilder.fromHttpUrl(frontendUrl + "/payment-result");

        try {
            log.info("Processing payment callback for {}: {}", service.getGatewayName(), params);
            PaymentTransaction transaction = service.handlePaymentCallback(params);
            String status = transaction.getStatus() == PaymentStatus.SUCCESSFUL ? "success" : "failed";
            String msg = transaction.getStatus() == PaymentStatus.SUCCESSFUL
                    ? "Thanh toán thành công!"
                    : "Thanh toán thất bại.";

            log.info("Payment callback result: status={}, orderId={}", status, transaction.getOrder().getId());

            // XÓA GIỎ HÀNG SAU KHI THANH TOÁN THÀNH CÔNG
            if (transaction.getStatus() == PaymentStatus.SUCCESSFUL) {
                try {
                    Long userId = transaction.getOrder().getUser().getId();
                    cartService.clearCart(userId);
                } catch (Exception e) {
                    log.error("Failed to clear cart after payment: {}", e.getMessage());
                    // Không ném lại lỗi để người dùng vẫn thấy trang thành công
                }
            }

            urlBuilder.queryParam("status", status);
            urlBuilder.queryParam("message", msg);
            urlBuilder.queryParam("orderId", transaction.getOrder().getId());
        } catch (Exception e) {
            log.error("Error processing payment callback: {}", e.getMessage(), e);
            urlBuilder.queryParam("status", "failed");
            urlBuilder.queryParam("message", "Lỗi xử lý kết quả thanh toán: " + e.getMessage());
        }

        String redirectUrl = urlBuilder.build().encode(StandardCharsets.UTF_8).toUriString();
        log.info("Redirecting to: {}", redirectUrl);
        return ResponseEntity.status(302).header("Location", redirectUrl).build();
    }

}
