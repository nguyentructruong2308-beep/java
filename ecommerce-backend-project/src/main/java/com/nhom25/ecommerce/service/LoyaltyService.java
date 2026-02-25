package com.nhom25.ecommerce.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nhom25.ecommerce.dto.DiscountDTO;
import com.nhom25.ecommerce.entity.Discount;
import com.nhom25.ecommerce.entity.DiscountType;
import com.nhom25.ecommerce.entity.MembershipTier;
import com.nhom25.ecommerce.entity.User;
import com.nhom25.ecommerce.exception.BadRequestException;
import com.nhom25.ecommerce.exception.ResourceNotFoundException;
import com.nhom25.ecommerce.repository.DiscountRepository;
import com.nhom25.ecommerce.repository.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service xử lý các tính năng liên quan đến điểm tích lũy (loyalty points).
 * - Đổi điểm lấy voucher: 100 điểm = voucher 20,000 VND
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class LoyaltyService {

    private final UserRepository userRepository;
    private final DiscountRepository discountRepository;

    // Hằng số quy đổi
    private static final int POINTS_REQUIRED_FOR_VOUCHER = 100;
    private static final BigDecimal VOUCHER_VALUE = new BigDecimal("20000");
    private static final int VOUCHER_VALIDITY_DAYS = 30;

    /**
     * Đổi 100 điểm lấy voucher giảm 20,000 VND.
     * 
     * @param userId ID của user
     * @return DiscountDTO chứa thông tin voucher vừa tạo
     */
    public DiscountDTO redeemPointsForVoucher(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + userId));

        int currentPoints = user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0;

        // Kiểm tra đủ điểm không
        if (currentPoints < POINTS_REQUIRED_FOR_VOUCHER) {
            throw new BadRequestException(
                    String.format("Bạn cần có ít nhất %d điểm để đổi voucher. Số điểm hiện tại: %d",
                            POINTS_REQUIRED_FOR_VOUCHER, currentPoints));
        }

        // Trừ điểm
        int newPoints = currentPoints - POINTS_REQUIRED_FOR_VOUCHER;
        user.setLoyaltyPoints(newPoints);

        // Cập nhật tier nếu cần (trường hợp trừ điểm làm xuống hạng - optional)
        // Lưu ý: Thông thường hạng không bị giảm, nhưng nếu muốn có thể bật logic này
        // user.setMembershipTier(MembershipTier.fromPoints(newPoints));

        userRepository.save(user);

        // Tạo voucher mới
        Discount voucher = new Discount();
        voucher.setCode(generateVoucherCode());
        voucher.setName("Voucher đổi điểm - " + VOUCHER_VALUE.intValue() + "đ");
        voucher.setDescription("Voucher đổi từ " + POINTS_REQUIRED_FOR_VOUCHER + " điểm tích lũy");
        voucher.setDiscountType(DiscountType.FIXED_AMOUNT);
        voucher.setDiscountValue(VOUCHER_VALUE);
        voucher.setMinOrderValue(BigDecimal.ZERO); // Không yêu cầu đơn hàng tối thiểu
        voucher.setMaxDiscountAmount(VOUCHER_VALUE);
        voucher.setStartDate(LocalDateTime.now());
        voucher.setEndDate(LocalDateTime.now().plusDays(VOUCHER_VALIDITY_DAYS));
        voucher.setIsActive(true);

        Discount savedVoucher = discountRepository.save(voucher);

        log.info("User {} redeemed {} points for voucher {}. Remaining points: {}",
                userId, POINTS_REQUIRED_FOR_VOUCHER, savedVoucher.getCode(), newPoints);

        return convertToDTO(savedVoucher);
    }

    /**
     * Lấy thông tin loyalty của user.
     */
    @Transactional(readOnly = true)
    public LoyaltyInfoDTO getLoyaltyInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + userId));

        int currentPoints = user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0;
        MembershipTier currentTier = user.getMembershipTier() != null ? user.getMembershipTier() : MembershipTier.NEW;
        MembershipTier nextTier = getNextTier(currentTier);
        int pointsToNextTier = nextTier != null ? nextTier.getMinPoints() - currentPoints : 0;

        LoyaltyInfoDTO info = new LoyaltyInfoDTO();
        info.setUserId(userId);
        info.setCurrentPoints(currentPoints);
        info.setMembershipTier(currentTier.name());
        info.setMembershipTierName(currentTier.getDisplayName());
        info.setPointsRequiredForVoucher(POINTS_REQUIRED_FOR_VOUCHER);
        info.setVoucherValue(VOUCHER_VALUE.intValue());
        info.setCanRedeemVoucher(currentPoints >= POINTS_REQUIRED_FOR_VOUCHER);

        if (nextTier != null) {
            info.setNextTier(nextTier.name());
            info.setNextTierName(nextTier.getDisplayName());
            info.setPointsToNextTier(Math.max(0, pointsToNextTier));
        }

        return info;
    }

    /**
     * Lấy hạng tiếp theo.
     */
    private MembershipTier getNextTier(MembershipTier current) {
        MembershipTier[] tiers = MembershipTier.values();
        for (int i = 0; i < tiers.length - 1; i++) {
            if (tiers[i] == current) {
                return tiers[i + 1];
            }
        }
        return null; // Đã ở hạng cao nhất (VIP)
    }

    /**
     * Tạo mã voucher ngẫu nhiên.
     */
    private String generateVoucherCode() {
        return "LOYALTY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private DiscountDTO convertToDTO(Discount discount) {
        DiscountDTO dto = new DiscountDTO();
        dto.setId(discount.getId());
        dto.setCode(discount.getCode());
        dto.setName(discount.getName());
        dto.setDescription(discount.getDescription());
        dto.setDiscountType(discount.getDiscountType());
        dto.setDiscountValue(discount.getDiscountValue());
        dto.setMinOrderValue(discount.getMinOrderValue());
        dto.setMaxDiscountAmount(discount.getMaxDiscountAmount());
        dto.setStartDate(discount.getStartDate());
        dto.setEndDate(discount.getEndDate());
        dto.setIsActive(discount.getIsActive());
        dto.setCreatedAt(discount.getCreatedAt());
        dto.setUpdatedAt(discount.getUpdatedAt());
        return dto;
    }

    /**
     * Inner DTO class cho thông tin loyalty.
     */
    @lombok.Data
    public static class LoyaltyInfoDTO {
        private Long userId;
        private Integer currentPoints;
        private String membershipTier;
        private String membershipTierName;
        private String nextTier;
        private String nextTierName;
        private Integer pointsToNextTier;
        private Integer pointsRequiredForVoucher;
        private Integer voucherValue;
        private Boolean canRedeemVoucher;
    }
}
