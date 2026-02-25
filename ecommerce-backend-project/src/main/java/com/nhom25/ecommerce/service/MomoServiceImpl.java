package com.nhom25.ecommerce.service;

import com.nhom25.ecommerce.config.MomoConfig;
import com.nhom25.ecommerce.dto.CreatePaymentResponseDTO;
import com.nhom25.ecommerce.entity.Order;
import com.nhom25.ecommerce.entity.PaymentStatus;
import com.nhom25.ecommerce.entity.PaymentTransaction;
import com.nhom25.ecommerce.exception.BadRequestException;
import com.nhom25.ecommerce.repository.CartItemRepository;
import com.nhom25.ecommerce.repository.OrderRepository;
import com.nhom25.ecommerce.repository.PaymentTransactionRepository;
import com.nhom25.ecommerce.util.MomoUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MomoServiceImpl implements PaymentGatewayService {

    private final MomoConfig momoConfig;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    @Transactional
    public CreatePaymentResponseDTO createPaymentUrl(Order order, HttpServletRequest request) {
        String requestId = UUID.randomUUID().toString();
        String orderId = order.getId().toString() + "_" + System.currentTimeMillis();
        long amount = order.getTotalAmount().longValue();
        String orderInfo = "Thanh toan don hang #" + order.getId();
        String extraData = ""; // Có thể encode Base64 dữ liệu thêm nếu cần
        String requestType = "captureWallet";

        // Tạo chuỗi signature - ĐÚNG FORMAT MOMO:
        // accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
        String rawHash = "accessKey=" + momoConfig.getAccessKey() +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&ipnUrl=" + momoConfig.getNotifyUrl() +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + momoConfig.getPartnerCode() +
                "&redirectUrl=" + momoConfig.getReturnUrl() +
                "&requestId=" + requestId +
                "&requestType=" + requestType;

        log.info("MoMo Raw Hash: {}", rawHash);
        String signature = MomoUtil.hmacSha256(momoConfig.getSecretKey(), rawHash);

        Map<String, Object> body = new HashMap<>();
        body.put("partnerCode", momoConfig.getPartnerCode());
        body.put("partnerName", "Ecommerce Store");
        body.put("storeId", "MomoTestStore");
        body.put("requestId", requestId);
        body.put("amount", amount);
        body.put("orderId", orderId);
        body.put("orderInfo", orderInfo);
        body.put("redirectUrl", momoConfig.getReturnUrl());
        body.put("ipnUrl", momoConfig.getNotifyUrl());
        body.put("lang", "vi");
        body.put("extraData", extraData);
        body.put("requestType", requestType);
        body.put("signature", signature);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    momoConfig.getApiUrl(),
                    HttpMethod.POST,
                    entity,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });
            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.get("payUrl") != null) {
                String payUrl = (String) responseBody.get("payUrl");

                // Lưu transaction
                PaymentTransaction transaction = new PaymentTransaction();
                transaction.setCreatedAt(LocalDateTime.now());
                transaction.setUpdatedAt(LocalDateTime.now());
                transaction.setOrder(order);
                transaction.setAmount(order.getTotalAmount());
                transaction.setPaymentMethod("MOMO");
                transaction.setTransactionId(orderId);
                transaction.setStatus(PaymentStatus.PENDING);

                // Chuyển response sang Map<String, String> cho JpaMapConverter
                Map<String, String> payloadMap = new HashMap<>();
                responseBody.forEach((k, v) -> payloadMap.put(String.valueOf(k), String.valueOf(v)));
                transaction.setPayload(payloadMap);

                paymentTransactionRepository.save(transaction);

                return new CreatePaymentResponseDTO(payUrl, order.getId().toString());
            } else {
                log.error("MoMo Error Response: {}", responseBody);
                throw new BadRequestException("Lỗi khi tạo liên kết thanh toán MoMo");
            }
        } catch (Exception e) {
            log.error("Error creating MoMo payment URL: {}", e.getMessage(), e);
            throw new BadRequestException("Lỗi hệ thống khi kết nối MoMo: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public PaymentTransaction handlePaymentCallback(Map<String, String> params) {

        log.info("MoMo Callback Params: {}", params);

        String orderIdWithTimestamp = params.get("orderId");
        String resultCode = params.get("resultCode");

        if (orderIdWithTimestamp == null || orderIdWithTimestamp.isEmpty()) {
            log.error("MoMo callback missing orderId");
            throw new BadRequestException("Missing orderId in MoMo callback");
        }

        log.info("MoMo callback: orderId={}, resultCode={}", orderIdWithTimestamp, resultCode);

        // Tìm transaction theo transactionId
        PaymentTransaction transaction = null;
        try {
            transaction = paymentTransactionRepository.findByTransactionId(orderIdWithTimestamp).orElse(null);

            // Nếu không tìm thấy, thử tìm theo order ID (phần trước dấu _)
            if (transaction == null) {
                String orderId = orderIdWithTimestamp.split("_")[0];
                log.warn("Transaction not found by full ID, trying to find by order ID: {}", orderId);
                transaction = paymentTransactionRepository
                        .findByOrderIdAndStatus(Long.parseLong(orderId), PaymentStatus.PENDING)
                        .orElse(null);
            }
        } catch (Exception e) {
            log.error("Error finding transaction: {}", e.getMessage(), e);
            throw new BadRequestException("Error finding transaction: " + e.getMessage());
        }

        if (transaction == null) {
            log.error("Transaction not found for orderId: {}", orderIdWithTimestamp);
            throw new BadRequestException("Transaction not found for: " + orderIdWithTimestamp);
        }

        // IDEMPOTENT: Nếu đã xử lý rồi thì trả về kết quả cũ
        if (transaction.getStatus() == PaymentStatus.SUCCESSFUL || transaction.getStatus() == PaymentStatus.FAILED) {
            log.info("MoMo callback already processed for transaction: {}, status: {}", orderIdWithTimestamp,
                    transaction.getStatus());
            return transaction;
        }

        try {
            Order order = transaction.getOrder();

            if ("0".equals(resultCode)) {
                log.info("MoMo payment SUCCESSFUL for order: {}", order.getId());
                transaction.setStatus(PaymentStatus.SUCCESSFUL);
                order.setPaymentStatus("PAID");
                order.setStatus(com.nhom25.ecommerce.entity.OrderStatus.PROCESSING);
            } else {
                log.info("MoMo payment FAILED for order: {}, resultCode: {}", order.getId(), resultCode);
                transaction.setStatus(PaymentStatus.FAILED);
                order.setPaymentStatus("FAILED");
            }

            orderRepository.save(order);
            PaymentTransaction savedTx = paymentTransactionRepository.save(transaction);
            log.info("Transaction saved successfully: {}", savedTx.getId());
            return savedTx;
        } catch (Exception e) {
            log.error("Error saving transaction: {}", e.getMessage(), e);
            throw new BadRequestException("Error saving transaction: " + e.getMessage());
        }
    }

    @Override
    public String getGatewayName() {
        return "MOMO";
    }
}
