package com.nhom25.ecommerce.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nhom25.ecommerce.config.VnPayConfig;
import com.nhom25.ecommerce.dto.CreatePaymentResponseDTO;

import com.nhom25.ecommerce.entity.*;
import com.nhom25.ecommerce.exception.BadRequestException;
import com.nhom25.ecommerce.exception.ResourceNotFoundException;
import com.nhom25.ecommerce.repository.CartItemRepository;
import com.nhom25.ecommerce.repository.OrderRepository;
import com.nhom25.ecommerce.repository.PaymentTransactionRepository;
import com.nhom25.ecommerce.util.VnPayUtil;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class VnPayServiceImpl implements PaymentGatewayService {

    private final VnPayConfig vnPayConfig;
    private final OrderRepository orderRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductService productService;
    private final EmailService emailService;

    @Override
    public String getGatewayName() {
        return "VNPAY";
    }

    @Override
    // === SỬA LỖI: XÓA @Transactional KHỎI HÀM NÀY ===
    // @Transactional // <--- XÓA DÒNG NÀY
    public CreatePaymentResponseDTO createPaymentUrl(Order order, HttpServletRequest request) {
        if (!"PENDING".equals(order.getPaymentStatus()) || order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Order is not in a valid state for payment.");
        }

        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setUpdatedAt(LocalDateTime.now());
        transaction.setOrder(order);
        transaction.setAmount(order.getTotalAmount());
        transaction.setStatus(PaymentStatus.PENDING);
        transaction.setPaymentMethod(getGatewayName());

        // Khi không có @Transactional, lệnh save() này sẽ commit ngay lập tức
        PaymentTransaction savedTransaction = transactionRepository.saveAndFlush(transaction);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        long amount = order.getTotalAmount().multiply(new BigDecimal(100)).longValue();
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", savedTransaction.getId().toString()); // Dùng ID đã commit
        vnp_Params.put("vnp_OrderInfo", buildOrderInfo(order.getOrderItems()));
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrlBase());
        vnp_Params.put("vnp_IpAddr", "127.0.0.1");
        vnp_Params.put("vnp_CreateDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));

        // VNPAY 2.1.0: Cần băm trên chuỗi ĐÃ mã hóa
        String queryParams = VnPayUtil.buildQueryString(vnp_Params);
        log.info("VNPAY_QUERY_PARAMS: {}", queryParams);

        String vnp_SecureHash = VnPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), queryParams);
        log.info("VNPAY_SECURE_HASH: {}", vnp_SecureHash);

        String paymentUrl = vnPayConfig.getUrl() + "?" + queryParams + "&vnp_SecureHash=" + vnp_SecureHash;
        log.info("VNPAY_FINAL_URL: {}", paymentUrl);

        return new CreatePaymentResponseDTO(paymentUrl, order.getId().toString());
    }

    @Override
    @Transactional // (Giữ @Transactional ở hàm callback là ĐÚNG)
    public PaymentTransaction handlePaymentCallback(Map<String, String> params) {
        log.info("Handling VNPAY IPN callback: {}", params);
        if (!VnPayUtil.verifySignature(new HashMap<>(params), vnPayConfig.getHashSecret())) {
            log.error("VNPAY signature verification failed!");
            throw new BadRequestException("Invalid VNPAY signature");
        }

        String paymentTransactionIdStr = params.get("vnp_TxnRef");
        String transactionNo = params.get("vnp_TransactionNo");
        String responseCode = params.get("vnp_ResponseCode");

        // Bây giờ lệnh tìm kiếm này sẽ thành công
        PaymentTransaction transaction = transactionRepository.findById(Long.parseLong(paymentTransactionIdStr))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "PaymentTransaction not found: " + paymentTransactionIdStr));

        Order order = transaction.getOrder();

        if (!"PENDING".equals(order.getPaymentStatus())) {
            log.warn("Order {} already processed. Skipping IPN.", order.getId());
            PaymentStatus currentStatus = "PAID".equals(order.getPaymentStatus()) ? PaymentStatus.SUCCESSFUL
                    : PaymentStatus.FAILED;
            return transactionRepository.findByOrderIdAndStatus(order.getId(), currentStatus)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Processed transaction not found for order: " + order.getId()));
        }

        if (transaction.getStatus() != PaymentStatus.PENDING) {
            log.warn("Transaction {} already processed. Skipping IPN.", transaction.getId());
            return transaction;
        }

        transaction.setTransactionId(transactionNo);
        transaction.setPayload(params);

        if ("00".equals(responseCode)) {
            log.info("Payment successful for order {}", order.getId());
            transaction.setStatus(PaymentStatus.SUCCESSFUL);
            order.setPaymentStatus("PAID");
            order.setStatus(OrderStatus.PROCESSING);

            try {
                emailService.sendOrderConfirmation(order);
            } catch (Exception e) {
                log.error("Failed to send confirmation email for order {}: {}", order.getId(), e.getMessage());
            }

        } else {
            log.warn("Payment failed for order {} with code {}", order.getId(), responseCode);
            transaction.setStatus(PaymentStatus.FAILED);
            order.setPaymentStatus("FAILED");
            order.setStatus(OrderStatus.CANCELLED);

            try {
                log.info("Restoring stock for failed payment on order {}", order.getId());
                order.getOrderItems().forEach(item -> {
                    if (item.getProductVariant() != null) {
                        productService.restoreVariantStock(item.getProductVariant().getId(), item.getQuantity());
                    } else if (item.getProduct() != null) {
                        productService.restoreProductStock(item.getProduct().getId(), item.getQuantity());
                    }
                });
            } catch (Exception e) {
                log.error("CRITICAL: Failed to restore stock for cancelled order {}: {}", order.getId(),
                        e.getMessage());
            }
        }

        orderRepository.saveAndFlush(order);
        return transactionRepository.saveAndFlush(transaction);
    }

    private String buildOrderInfo(List<OrderItem> orderItems) {
        return "ThanhToanDonHangEcommerce";
    }

    private String getIpAddress(HttpServletRequest request) {
        String ipAddr = request.getHeader("X-Forwarded-For");
        if (ipAddr == null || ipAddr.isEmpty() || "unknown".equalsIgnoreCase(ipAddr)) {
            ipAddr = request.getRemoteAddr();
        }
        return ipAddr.split(",")[0].trim();
    }
}