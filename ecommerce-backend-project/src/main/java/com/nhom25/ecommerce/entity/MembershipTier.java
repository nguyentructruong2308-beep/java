package com.nhom25.ecommerce.entity;

/**
 * Enum đại diện các hạng thành viên dựa trên điểm tích lũy.
 * Quy tắc nâng hạng:
 * - NEW (0-499 điểm): Khách hàng mới
 * - MEMBER (500-699 điểm): Thành viên
 * - LOYAL (700-999 điểm): Khách hàng thân thiết
 * - SILVER (1000-1299 điểm): Hạng Bạc
 * - GOLD (1300-1999 điểm): Hạng Vàng
 * - VIP (2000+ điểm): Hạng VIP
 */
public enum MembershipTier {
    NEW(0, "Mới"),
    MEMBER(500, "Thành viên"),
    LOYAL(700, "Khách hàng thân thiết"),
    SILVER(1000, "Hạng Bạc"),
    GOLD(1300, "Hạng Vàng"),
    VIP(2000, "Hạng VIP");

    private final int minPoints;
    private final String displayName;

    MembershipTier(int minPoints, String displayName) {
        this.minPoints = minPoints;
        this.displayName = displayName;
    }

    public int getMinPoints() {
        return minPoints;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Tính hạng thành viên dựa trên tổng điểm tích lũy.
     * 
     * @param points Tổng điểm tích lũy của user
     * @return MembershipTier tương ứng
     */
    public static MembershipTier fromPoints(int points) {
        MembershipTier result = NEW;
        for (MembershipTier tier : values()) {
            if (points >= tier.minPoints) {
                result = tier;
            }
        }
        return result;
    }
}
