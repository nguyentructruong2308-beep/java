package com.nhom25.ecommerce.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nhom25.ecommerce.dto.CreateDiscountRequest;
import com.nhom25.ecommerce.dto.DiscountDTO;
import com.nhom25.ecommerce.entity.Discount;
import com.nhom25.ecommerce.entity.MembershipTier;
import com.nhom25.ecommerce.entity.VoucherSource;
import com.nhom25.ecommerce.exception.BadRequestException;
import com.nhom25.ecommerce.exception.ResourceNotFoundException;
import com.nhom25.ecommerce.entity.Product;
import com.nhom25.ecommerce.repository.DiscountRepository;
import com.nhom25.ecommerce.repository.ProductRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class DiscountService {

    private final DiscountRepository discountRepository;
    private final ProductRepository productRepository;

    /**
     * Lấy tất cả mã giảm giá
     */
    @Transactional(readOnly = true)
    public List<DiscountDTO> getAllDiscounts() {
        return discountRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy mã giảm giá theo ID
     */
    @Transactional(readOnly = true)
    public DiscountDTO getDiscountById(Long id) {
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá với id: " + id));
        return convertToDTO(discount);
    }

    /**
     * Tạo mã giảm giá mới
     */
    public DiscountDTO createDiscount(CreateDiscountRequest request) {
        // Kiểm tra code đã tồn tại chưa
        if (discountRepository.existsByCode(request.getCode().toUpperCase())) {
            throw new BadRequestException("Mã giảm giá '" + request.getCode() + "' đã tồn tại!");
        }

        // Validate ngày
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("Ngày kết thúc phải sau ngày bắt đầu!");
        }

        Discount discount = new Discount();
        discount.setCode(request.getCode().toUpperCase());
        discount.setName(request.getName());
        discount.setDescription(request.getDescription());
        discount.setDiscountType(request.getDiscountType());
        discount.setDiscountValue(request.getDiscountValue());
        discount.setMinOrderValue(request.getMinOrderValue());
        discount.setMaxDiscountAmount(request.getMaxDiscountAmount());
        discount.setStartDate(request.getStartDate());
        discount.setEndDate(request.getEndDate());
        discount.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        // Tier-based voucher settings
        if (request.getVoucherSource() != null) {
            discount.setVoucherSource(VoucherSource.valueOf(request.getVoucherSource()));
        }
        if (request.getRequiredTier() != null && !request.getRequiredTier().isEmpty()) {
            discount.setRequiredTier(MembershipTier.valueOf(request.getRequiredTier()));
        }

        // Buy X Get Y fields
        if (request.getBuyQuantity() != null)
            discount.setBuyQuantity(request.getBuyQuantity());
        if (request.getGetQuantity() != null)
            discount.setGetQuantity(request.getGetQuantity());

        // Gift product for "Buy A Get B"
        if (request.getGiftProductId() != null) {
            Product giftProduct = productRepository.findById(request.getGiftProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy sản phẩm tặng với id: " + request.getGiftProductId()));
            discount.setGiftProduct(giftProduct);
        }

        Discount savedDiscount = discountRepository.save(discount);

        // Link products if IDs provided
        if (request.getProductIds() != null && !request.getProductIds().isEmpty()) {
            List<Product> products = productRepository.findAllById(request.getProductIds());
            for (Product product : products) {
                if (product.getDiscounts() == null) {
                    product.setDiscounts(new ArrayList<>());
                }
                product.getDiscounts().add(savedDiscount);
                productRepository.save(product);
            }
        }

        log.info("Created new discount: {}", savedDiscount.getCode());
        return convertToDTO(savedDiscount);
    }

    /**
     * Cập nhật mã giảm giá
     */
    public DiscountDTO updateDiscount(Long id, CreateDiscountRequest request) {
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá với id: " + id));

        // Kiểm tra nếu đổi code và code mới đã tồn tại
        if (!discount.getCode().equalsIgnoreCase(request.getCode())
                && discountRepository.existsByCode(request.getCode().toUpperCase())) {
            throw new BadRequestException("Mã giảm giá '" + request.getCode() + "' đã tồn tại!");
        }

        // Validate ngày
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("Ngày kết thúc phải sau ngày bắt đầu!");
        }

        discount.setCode(request.getCode().toUpperCase());
        discount.setName(request.getName());
        discount.setDescription(request.getDescription());
        discount.setDiscountType(request.getDiscountType());
        discount.setDiscountValue(request.getDiscountValue());
        discount.setMinOrderValue(request.getMinOrderValue());
        discount.setMaxDiscountAmount(request.getMaxDiscountAmount());
        discount.setStartDate(request.getStartDate());
        discount.setEndDate(request.getEndDate());
        if (request.getIsActive() != null) {
            discount.setIsActive(request.getIsActive());
        }

        // Tier-based voucher settings
        if (request.getVoucherSource() != null) {
            discount.setVoucherSource(VoucherSource.valueOf(request.getVoucherSource()));
        }
        if (request.getRequiredTier() != null && !request.getRequiredTier().isEmpty()) {
            discount.setRequiredTier(MembershipTier.valueOf(request.getRequiredTier()));
        } else {
            discount.setRequiredTier(null);
        }

        // Buy X Get Y fields
        if (request.getBuyQuantity() != null)
            discount.setBuyQuantity(request.getBuyQuantity());
        if (request.getGetQuantity() != null)
            discount.setGetQuantity(request.getGetQuantity());

        // Gift product for "Buy A Get B"
        if (request.getGiftProductId() != null) {
            Product giftProduct = productRepository.findById(request.getGiftProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy sản phẩm tặng với id: " + request.getGiftProductId()));
            discount.setGiftProduct(giftProduct);
        } else {
            discount.setGiftProduct(null);
        }

        Discount updatedDiscount = discountRepository.save(discount);
        log.info("Updated discount: {}", updatedDiscount.getCode());
        return convertToDTO(updatedDiscount);
    }

    /**
     * Xóa mã giảm giá
     */
    public void deleteDiscount(Long id) {
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá với id: " + id));
        discountRepository.delete(discount);
        log.info("Deleted discount: {}", discount.getCode());
    }

    /**
     * Validate và lấy thông tin mã giảm giá (cho client)
     */
    @Transactional(readOnly = true)
    public DiscountDTO validateDiscountCode(String code, BigDecimal orderTotal) {
        Discount discount = discountRepository.findByCodeAndIsActiveTrue(code.toUpperCase())
                .orElseThrow(() -> new BadRequestException("Mã giảm giá không hợp lệ hoặc đã hết hạn!"));

        LocalDateTime now = LocalDateTime.now();

        // Kiểm tra thời gian hiệu lực
        if (now.isBefore(discount.getStartDate())) {
            throw new BadRequestException("Mã giảm giá chưa được kích hoạt!");
        }
        if (now.isAfter(discount.getEndDate())) {
            throw new BadRequestException("Mã giảm giá đã hết hạn!");
        }

        // Kiểm tra giá trị đơn hàng tối thiểu
        if (discount.getMinOrderValue() != null && orderTotal.compareTo(discount.getMinOrderValue()) < 0) {
            throw new BadRequestException("Đơn hàng phải có giá trị tối thiểu "
                    + discount.getMinOrderValue() + "đ để sử dụng mã này!");
        }

        return convertToDTO(discount);
    }

    /**
     * Validate mã giảm giá với kiểm tra hạng thành viên.
     * 
     * @param code       Mã voucher
     * @param orderTotal Tổng đơn hàng
     * @param userTier   Hạng thành viên của user (có thể null)
     */
    @Transactional(readOnly = true)
    public DiscountDTO validateDiscountCodeWithTier(String code, BigDecimal orderTotal, MembershipTier userTier) {
        Discount discount = discountRepository.findByCodeAndIsActiveTrue(code.toUpperCase())
                .orElseThrow(() -> new BadRequestException("Mã giảm giá không hợp lệ hoặc đã hết hạn!"));

        LocalDateTime now = LocalDateTime.now();

        // Kiểm tra thời gian hiệu lực
        if (now.isBefore(discount.getStartDate())) {
            throw new BadRequestException("Mã giảm giá chưa được kích hoạt!");
        }
        if (now.isAfter(discount.getEndDate())) {
            throw new BadRequestException("Mã giảm giá đã hết hạn!");
        }

        // Kiểm tra giá trị đơn hàng tối thiểu
        if (discount.getMinOrderValue() != null && orderTotal.compareTo(discount.getMinOrderValue()) < 0) {
            throw new BadRequestException("Đơn hàng phải có giá trị tối thiểu "
                    + discount.getMinOrderValue() + "đ để sử dụng mã này!");
        }

        // Kiểm tra yêu cầu hạng thành viên
        if (discount.getRequiredTier() != null) {
            if (userTier == null || userTier.ordinal() < discount.getRequiredTier().ordinal()) {
                throw new BadRequestException(
                        "Voucher này yêu cầu hạng " + discount.getRequiredTier().getDisplayName() + " trở lên!");
            }
        }

        return convertToDTO(discount);
    }

    /**
     * Lấy tất cả voucher khả dụng (active, còn hạn) để hiển thị.
     * Logic lọc theo hạng sẽ được xử lý ở frontend hoặc hiển thị dạng disable.
     */
    @Transactional(readOnly = true)
    public List<DiscountDTO> getAvailableVouchersForUser(MembershipTier userTier) {
        LocalDateTime now = LocalDateTime.now();
        List<Discount> activeDiscounts = discountRepository.findByIsActiveTrue();

        return activeDiscounts.stream()
                .filter(d -> d.getStartDate().isBefore(now) && d.getEndDate().isAfter(now))
                .filter(d -> d.getBuyQuantity() == null || d.getBuyQuantity() == 0) // Filter out Buy-X-Get-Y for
                                                                                    // voucher list
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách các ưu đãi (Deal) đang hoạt động để hiển thị ở trang chủ.
     * Tập trung vào các deal Mua X Tặng Y hoặc các chương trình đặc biệt.
     */
    @Transactional(readOnly = true)
    public List<DiscountDTO> getActivePublicDeals() {
        LocalDateTime now = LocalDateTime.now();
        return discountRepository.findByIsActiveTrue().stream()
                .filter(d -> d.getStartDate().isBefore(now) && d.getEndDate().isAfter(now))
                .filter(d -> (d.getBuyQuantity() != null && d.getBuyQuantity() > 0) || d.getGiftProduct() != null)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Tính số tiền được giảm
     */
    public BigDecimal calculateDiscountAmount(String code, BigDecimal orderTotal) {
        DiscountDTO discount = validateDiscountCode(code, orderTotal);

        BigDecimal discountAmount;

        switch (discount.getDiscountType()) {
            case PERCENTAGE:
                // Tính phần trăm
                discountAmount = orderTotal.multiply(discount.getDiscountValue())
                        .divide(BigDecimal.valueOf(100));
                // Áp dụng giới hạn max nếu có
                if (discount.getMaxDiscountAmount() != null
                        && discountAmount.compareTo(discount.getMaxDiscountAmount()) > 0) {
                    discountAmount = discount.getMaxDiscountAmount();
                }
                break;
            case FIXED_AMOUNT:
                discountAmount = discount.getDiscountValue();
                // Không giảm quá giá trị đơn hàng
                if (discountAmount.compareTo(orderTotal) > 0) {
                    discountAmount = orderTotal;
                }
                break;
            default:
                discountAmount = BigDecimal.ZERO;
        }

        return discountAmount;
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

        // Tier-based voucher fields
        dto.setVoucherSource(discount.getVoucherSource() != null ? discount.getVoucherSource().name() : "SHOP");
        if (discount.getRequiredTier() != null) {
            dto.setRequiredTier(discount.getRequiredTier().name());
            dto.setRequiredTierName(discount.getRequiredTier().getDisplayName());
        }

        dto.setBuyQuantity(discount.getBuyQuantity());
        dto.setGetQuantity(discount.getGetQuantity());

        // Products (Product A) fields
        if (discount.getProducts() != null && !discount.getProducts().isEmpty()) {
            dto.setProductIds(discount.getProducts().stream().map(Product::getId).collect(Collectors.toList()));
            dto.setProductNames(discount.getProducts().stream().map(Product::getName).collect(Collectors.toList()));
            dto.setProductImages(
                    discount.getProducts().stream().map(Product::getImageUrl).collect(Collectors.toList()));
        }

        // Gift product for "Buy A Get B"
        if (discount.getGiftProduct() != null) {
            dto.setGiftProductId(discount.getGiftProduct().getId());
            dto.setGiftProductName(discount.getGiftProduct().getName());
            dto.setGiftProductImage(discount.getGiftProduct().getImageUrl());
        }

        return dto;
    }
}
