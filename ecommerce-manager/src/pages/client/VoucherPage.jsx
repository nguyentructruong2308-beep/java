import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import loyaltyService from "../../api/loyaltyService";
import { toast } from "react-toastify";
import { FaTicketAlt, FaCrown, FaGift, FaCopy, FaInfoCircle } from "react-icons/fa";

export default function VoucherPage() {
    const [loyaltyInfo, setLoyaltyInfo] = useState(null);
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [infoRes, vouchersRes] = await Promise.all([
                loyaltyService.getLoyaltyInfo(),
                loyaltyService.getAvailableVouchers(),
            ]);
            setLoyaltyInfo(infoRes.data);
            setVouchers(vouchersRes.data);
        } catch (error) {
            console.error("Error fetching voucher data:", error);
            toast.error("Không thể tải thông tin voucher. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success(`Đã sao chép mã: ${code}`);
    };

    const getTierColor = (tier) => {
        switch (tier) {
            case "VIP": return "text-warning";
            case "GOLD": return "text-warning";
            case "SILVER": return "text-secondary";
            case "LOYAL": return "text-info";
            default: return "text-success";
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Không thời hạn";
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    if (loading) {
        return (
            <div className="container py-5 text-center" style={{ minHeight: "60vh" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Đang tải kho voucher...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            {/* Loyalty Header Card */}
            <div className="card shadow-sm border-0 rounded-4 mb-5 overflow-hidden bg-white">
                <div className="card-body p-0">
                    <div className="row g-0">
                        <div className="col-md-4 bg-primary bg-gradient text-white p-4 d-flex flex-column justify-content-center align-items-center text-center">
                            <div className="mb-3">
                                <div className="rounded-circle bg-white p-3 d-inline-block shadow-sm">
                                    <FaCrown className={`display-4 ${getTierColor(loyaltyInfo?.membershipTier)}`} />
                                </div>
                            </div>
                            <h2 className="fw-bold mb-1">{loyaltyInfo?.membershipTierName}</h2>
                            <p className="mb-0 opacity-75">Hạng thành viên hiện tại</p>
                        </div>
                        <div className="col-md-8 p-4">
                            <div className="row h-100 align-items-center">
                                <div className="col-sm-6 mb-3 mb-sm-0 text-center text-sm-start border-end-sm">
                                    <p className="text-muted mb-1">Điểm tích lũy</p>
                                    <h3 className="fw-bold text-primary mb-0 display-6">
                                        {loyaltyInfo?.currentPoints?.toLocaleString()} <small className="fs-6 text-muted">điểm</small>
                                    </h3>
                                </div>
                                <div className="col-sm-6">
                                    {loyaltyInfo?.nextTier ? (
                                        <div className="alert alert-light border mb-0">
                                            <div className="d-flex justify-content-between align-items-end mb-2">
                                                <div className="d-flex align-items-center">
                                                    <FaInfoCircle className="text-info me-2" />
                                                    <small className="fw-bold">Hạng tiếp theo: {loyaltyInfo.nextTierName}</small>
                                                </div>
                                                <small className="fw-bold text-primary">
                                                    {loyaltyInfo.currentPoints}/{loyaltyInfo.currentPoints + loyaltyInfo.pointsToNextTier}
                                                </small>
                                            </div>
                                            <div className="progress" style={{ height: "8px" }}>
                                                <div
                                                    className="progress-bar bg-success"
                                                    role="progressbar"
                                                    style={{
                                                        width: `${Math.min(100, Math.max(5, (loyaltyInfo.currentPoints / (loyaltyInfo.currentPoints + loyaltyInfo.pointsToNextTier)) * 100))}%`
                                                    }}
                                                    aria-valuenow={loyaltyInfo.currentPoints}
                                                    aria-valuemin="0"
                                                    aria-valuemax={loyaltyInfo.currentPoints + loyaltyInfo.pointsToNextTier}
                                                ></div>
                                            </div>
                                            <div className="d-flex justify-content-between mt-2">
                                                <small className="text-muted" style={{ fontSize: "0.8rem" }}>
                                                    Cần thêm <strong>{loyaltyInfo.pointsToNextTier?.toLocaleString()}</strong> điểm
                                                </small>
                                                <small className="text-muted" style={{ fontSize: "0.8rem" }}>
                                                    Mục tiêu: <strong>{(loyaltyInfo.currentPoints + loyaltyInfo.pointsToNextTier)?.toLocaleString()}</strong> điểm
                                                </small>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="alert alert-success mb-0 border-0 bg-success bg-opacity-10">
                                            <FaCrown className="me-2" />
                                            Bạn đã đạt hạng cao nhất!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Voucher List */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h3 className="fw-bold m-0"><FaTicketAlt className="text-primary me-2" />Kho Voucher Của Bạn</h3>
            </div>

            {vouchers.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-4">
                    <FaGift className="display-1 text-muted opacity-25 mb-3" />
                    <h5>Chưa có voucher nào khả dụng</h5>
                    <p className="text-muted">Hãy tích cực mua sắm để nhận thêm nhiều ưu đãi nhé!</p>
                    <Link to="/" className="btn btn-primary mt-2">Mua sắm ngay</Link>
                </div>
            ) : (
                <div className="row g-4">
                    {vouchers.map((voucher) => {
                        // Check eligibility locally
                        const tierOrder = ['NEW', 'MEMBER', 'LOYAL', 'SILVER', 'GOLD', 'VIP'];
                        const userRank = tierOrder.indexOf(loyaltyInfo?.membershipTier || 'NEW');
                        const voucherRank = voucher.requiredTier ? tierOrder.indexOf(voucher.requiredTier) : -1;
                        const isEligible = voucherRank === -1 || userRank >= voucherRank;

                        return (
                            <div key={voucher.id} className="col-md-6 col-lg-4">
                                <div className={`card h-100 shadow-sm border-0 rounded-4 voucher-card ${!isEligible ? 'opacity-50 grayscale' : ''}`}>
                                    <div className="card-body d-flex flex-column p-0">
                                        <div className="p-4 flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <span className={`badge ${voucher.voucherSource === 'TIER' ? 'bg-warning text-dark' : voucher.voucherSource === 'LOYALTY' ? 'bg-success' : 'bg-primary'} rounded-pill px-3 py-2`}>
                                                    {voucher.voucherSource === 'TIER' ? 'Hạng thành viên' : voucher.voucherSource === 'LOYALTY' ? 'Đổi điểm' : 'Shop Voucher'}
                                                </span>
                                                {voucher.voucherSource === 'TIER' && (
                                                    <small className="text-warning fw-bold"><FaCrown className="me-1" />{voucher.requiredTierName}</small>
                                                )}
                                            </div>
                                            <h5 className="card-title fw-bold mb-2">{voucher.name}</h5>
                                            <p className="card-text text-muted small mb-3">{voucher.description}</p>

                                            {!isEligible && voucher.requiredTier && (
                                                <div className="alert alert-secondary py-1 px-2 mb-3 fs-6 rounded-pill d-inline-block">
                                                    <small>🔒 Cần hạng {voucher.requiredTierName}</small>
                                                </div>
                                            )}

                                            <div className="bg-light p-3 rounded-3 mb-3">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <small className="text-muted">Đơn tối thiểu:</small>
                                                    <small className="fw-bold">{voucher.minOrderValue > 0 ? voucher.minOrderValue.toLocaleString() + 'đ' : '0đ'}</small>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <small className="text-muted">Hết hạn:</small>
                                                    <small className="fw-bold">{formatDate(voucher.endDate)}</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-footer bg-white border-top-0 p-4 pt-0">
                                            <div className="d-flex gap-2">
                                                <div className="position-relative flex-grow-1">
                                                    <input
                                                        type="text"
                                                        className="form-control bg-light border-0 text-center fw-bold text-primary"
                                                        value={isEligible ? voucher.code : '*****'}
                                                        readOnly
                                                        disabled={!isEligible}
                                                    />
                                                </div>
                                                <button
                                                    className="btn btn-outline-primary"
                                                    onClick={() => isEligible && handleCopyCode(voucher.code)}
                                                    title={isEligible ? "Sao chép mã" : "Không đủ điều kiện"}
                                                    disabled={!isEligible}
                                                >
                                                    <FaCopy />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Visual decoration */}
                                    <div className="voucher-edge-left"></div>
                                    <div className="voucher-edge-right"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
}


