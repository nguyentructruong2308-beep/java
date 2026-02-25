import apiClient from "./api";

const loyaltyService = {
  // Lấy thông tin loyalty (điểm, hạng, v.v.)
  getLoyaltyInfo: () => {
    return apiClient.get("/loyalty/info");
  },

  // Đổi điểm lấy voucher
  redeemVoucher: () => {
    return apiClient.post("/loyalty/redeem");
  },

  // Lấy danh sách voucher khả dụng
  getAvailableVouchers: () => {
    return apiClient.get("/loyalty/available-vouchers");
  }
};

export default loyaltyService;
