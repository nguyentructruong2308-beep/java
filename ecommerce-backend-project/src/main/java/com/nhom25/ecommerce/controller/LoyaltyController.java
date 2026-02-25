package com.nhom25.ecommerce.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.nhom25.ecommerce.dto.DiscountDTO;
import com.nhom25.ecommerce.dto.UserDTO;
import com.nhom25.ecommerce.service.DiscountService;
import com.nhom25.ecommerce.service.LoyaltyService;
import com.nhom25.ecommerce.service.LoyaltyService.LoyaltyInfoDTO;
import com.nhom25.ecommerce.service.UserService;

import java.util.List;

/**
 * Controller cho các tính năng điểm tích lũy (loyalty points).
 * - Lấy thông tin loyalty (điểm, hạng thành viên)
 * - Đổi điểm lấy voucher
 */
@RestController
@RequestMapping("/api/loyalty")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LoyaltyController {

    private final LoyaltyService loyaltyService;
    private final UserService userService;
    private final DiscountService discountService;

    /**
     * Lấy thông tin loyalty của user hiện tại.
     * Bao gồm: điểm hiện tại, hạng thành viên, điểm đến hạng tiếp theo,
     * có thể đổi voucher không, etc.
     */
    @GetMapping("/info")
    public ResponseEntity<LoyaltyInfoDTO> getLoyaltyInfo(Authentication authentication) {
        UserDTO user = userService.getUserByEmail(authentication.getName());
        LoyaltyInfoDTO info = loyaltyService.getLoyaltyInfo(user.getId());
        return ResponseEntity.ok(info);
    }

    /**
     * Đổi 100 điểm lấy voucher giảm 20,000 VND.
     * Voucher có hiệu lực 30 ngày.
     */
    @PostMapping("/redeem")
    public ResponseEntity<DiscountDTO> redeemPointsForVoucher(Authentication authentication) {
        UserDTO user = userService.getUserByEmail(authentication.getName());
        DiscountDTO voucher = loyaltyService.redeemPointsForVoucher(user.getId());
        return ResponseEntity.ok(voucher);
    }

    /**
     * Lấy tất cả voucher khả dụng cho user dựa theo hạng thành viên.
     * Bao gồm voucher shop (public) và voucher đặc quyền theo hạng.
     */
    @GetMapping("/available-vouchers")
    public ResponseEntity<List<DiscountDTO>> getAvailableVouchers(Authentication authentication) {
        UserDTO user = userService.getUserByEmail(authentication.getName());
        com.nhom25.ecommerce.entity.MembershipTier userTier = user.getMembershipTier() != null
                ? com.nhom25.ecommerce.entity.MembershipTier.valueOf(user.getMembershipTier())
                : com.nhom25.ecommerce.entity.MembershipTier.NEW;
        List<DiscountDTO> vouchers = discountService.getAvailableVouchersForUser(userTier);
        return ResponseEntity.ok(vouchers);
    }
}
