package com.nhom25.ecommerce.entity;

/**
 * Phân loại nguồn gốc của voucher.
 */
public enum VoucherSource {
    SHOP, // Voucher từ shop (ai cũng dùng được)
    TIER, // Voucher đặc quyền theo hạng thành viên
    LOYALTY // Voucher đổi từ điểm tích lũy
}
