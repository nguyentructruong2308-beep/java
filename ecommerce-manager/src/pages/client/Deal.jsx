import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/api";
import { FaFireAlt, FaGift, FaShoppingCart } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";

const Deal = () => {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const res = await API.get("/discounts/public/active");
                setDeals(res.data);
            } catch (err) {
                console.error("Fetch deals error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDeals();
    }, []);

    const handleAddToCart = async (deal, e) => {
        if (!isAuthenticated) {
            toast.warn("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
            return;
        }

        try {
            // Hiệu ứng bay (tùy chọn)
            if (e) {
                window.dispatchEvent(new CustomEvent('cartAnimate', {
                    detail: {
                        image: deal.productImages?.[0] || "https://placehold.co/100",
                        startX: e.clientX,
                        startY: e.clientY
                    }
                }));
            }

            const mainProdId = deal.productIds?.[0];
            const giftProdId = deal.giftProductId;

            if (!mainProdId) return;

            // Thêm sản phẩm chính
            const mainPromise = API.post(`/cart/add?productId=${mainProdId}&quantity=${deal.buyQuantity || 5}&isGift=false`);

            // Thêm sản phẩm tặng (nếu có)
            let giftPromise = Promise.resolve();
            if (giftProdId) {
                giftPromise = API.post(`/cart/add?productId=${giftProdId}&quantity=${deal.getQuantity || 1}&isGift=true`);
            }

            await Promise.all([mainPromise, giftPromise]);

            toast.success(`Đã thêm ${deal.name} vào giỏ hàng!`);
            window.dispatchEvent(new Event('cartUpdated'));

        } catch (err) {
            console.error("Deal AddToCart Error:", err);
            toast.error(err.response?.data?.message || "Lỗi khi thêm deal vào giỏ hàng");
        }
    };

    if (loading) return null;
    if (deals.length === 0) return null;

    return (
        <section className="py-5" style={{ backgroundColor: "#fff5f5" }}>
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center">
                        <div className="bg-danger text-white p-2 rounded-circle me-3 shadow-sm d-flex align-items-center justify-content-center" style={{ width: "45px", height: "45px" }}>
                            <FaFireAlt size={24} />
                        </div>
                        <div>
                            <h2 className="fw-bold mb-0 text-danger" style={{ letterSpacing: "-0.5px" }}>DEAL XẢ KHO - QUÀ CỰC KHỦNG!</h2>
                            <p className="text-muted mb-0 small">Sản phẩm chất lượng với ưu đãi Mua X Tặng Y cực sốc</p>
                        </div>
                    </div>
                </div>

                <div className="row g-4 justify-content-center">
                    {deals.map((deal) => (
                        <div key={deal.id} className="col-12 col-xl-10">
                            <div className="card border-0 shadow-sm h-100 overflow-hidden hover-lift" style={{ borderRadius: "20px" }}>
                                <div className="card-body p-0 d-flex flex-column h-100">
                                    <div className="bg-gradient-danger-orange p-3 text-white text-center fw-bold small">
                                        {deal.name}
                                    </div>
                                    <div className="p-4 flex-grow-1">
                                        <div className="d-flex align-items-center justify-content-center mb-4 gap-3">
                                            {/* Product A Container */}
                                            <div className="text-center position-relative">
                                                <div className="badge bg-danger position-absolute top-0 start-50 translate-middle rounded-pill px-3 shadow-sm" style={{ zIndex: 2, fontSize: '0.75rem' }}>
                                                    MUA {deal.buyQuantity || 5}
                                                </div>
                                                <div className="rounded-circle overflow-hidden border border-4 border-white shadow-sm" style={{ width: "100px", height: "100px" }}>
                                                    <img
                                                        src={deal.productImages?.[0] || "https://placehold.co/100"}
                                                        alt={deal.productNames?.[0]}
                                                        className="w-100 h-100 object-fit-cover"
                                                    />
                                                </div>
                                                <div className="text-truncate small fw-bold mt-2 mx-auto" style={{ maxWidth: "100px" }}>
                                                    {deal.productNames?.[0]}
                                                </div>
                                            </div>

                                            <div className="text-danger fw-bold fs-3 mt-n4">+</div>

                                            {/* Gift Product B Container */}
                                            <div className="text-center position-relative">
                                                <div className="badge bg-success position-absolute top-0 start-50 translate-middle rounded-pill px-3 shadow-sm" style={{ zIndex: 2, fontSize: '0.75rem' }}>
                                                    TẶNG {deal.getQuantity || 1}
                                                </div>
                                                <div className="rounded-circle overflow-hidden border border-4 border-white shadow-sm" style={{ width: "100px", height: "100px" }}>
                                                    <img
                                                        src={deal.giftProductImage || deal.productImages?.[0] || "https://placehold.co/100"}
                                                        alt={deal.giftProductName}
                                                        className="w-100 h-100 object-fit-cover"
                                                    />
                                                </div>
                                                <div className="text-truncate small fw-bold mt-2 mx-auto" style={{ maxWidth: "100px" }}>
                                                    {deal.giftProductName || "Quà tặng"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-light rounded-4 p-3 mb-3 border border-dashed text-center">
                                            <div className="text-muted small mb-1">Mã ưu đãi (Tự động áp dụng):</div>
                                            <div className="text-primary fw-bold letter-spacing-1">{deal.code}</div>
                                        </div>

                                        <p className="small text-muted mb-0 text-center italic">
                                            {deal.description || "Ưu đãi giới hạn, nhanh tay sở hữu ngay!"}
                                        </p>
                                    </div>
                                    <div className="p-4 pt-0 mt-auto">
                                        <button
                                            onClick={(e) => handleAddToCart(deal, e)}
                                            className="btn btn-danger w-100 rounded-pill fw-bold py-2 shadow-sm d-flex align-items-center justify-content-center"
                                        >
                                            THÊM VÀO GIỎ <FaShoppingCart className="ms-2" size={16} />
                                        </button>
                                        <div className="text-center mt-2">
                                            <Link to={`/product/${deal.productIds?.[0]}`} className="text-muted small text-decoration-none">
                                                Xem chi tiết sản phẩm
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .bg-gradient-danger-orange {
                    background: linear-gradient(135deg, #f05053 0%, #e1eec3 100%);
                    background: linear-gradient(to right, #ff416c, #ff4b2b);
                }
                .hover-lift {
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                }
                .hover-lift:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 1rem 3rem rgba(0,0,0,.175)!important;
                }
                .letter-spacing-1 {
                    letter-spacing: 1px;
                }
            `}</style>
        </section>
    );
};

export default Deal;
