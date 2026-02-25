import React, { useEffect, useState, useCallback } from "react";
import API from "../../api/api";
import { Button, Form, Container, Row, Col, Card, Badge } from "react-bootstrap";
import useAuth from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import { FaTrashAlt, FaMinus, FaPlus, FaShoppingBag, FaArrowRight, FaStore, FaArrowLeft, FaTicketAlt, FaShieldAlt } from "react-icons/fa";
import { confirmSwal } from "../../utils/swal";

/* =========================================================
   1. PREMIUM CSS STYLES (GLASSMORPHISM & ANIMATIONS)
========================================================= */
const styles = `
    /* Transitions & Animations */
    @keyframes fadeInSlideUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes itemExit {
        to { opacity: 0; transform: scale(0.9) translateX(-40px); filter: blur(10px); }
    }
    @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(255, 107, 107, 0.2); }
        50% { box-shadow: 0 0 40px rgba(255, 107, 107, 0.4); }
    }

    .premium-page {
        background: radial-gradient(circle at top left, #fff1eb 0%, #fad0c4 100%);
        min-height: 100vh;
        padding-bottom: 5rem;
    }

    .cart-card-premium {
        background: rgba(255, 255, 255, 0.7) !important;
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.4) !important;
        border-radius: 24px !important;
        transition: all 0.3s ease;
    }

    .cart-item-card {
        background: white !important;
        border-radius: 20px !important;
        border: none !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        animation: fadeInSlideUp 0.6s ease forwards;
    }
    .cart-item-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(0,0,0,0.05) !important;
    }

    .item-exiting {
        animation: itemExit 0.4s ease forwards !important;
    }

    .glass-summary {
        background: rgba(255, 255, 255, 0.8) !important;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.6) !important;
        border-radius: 28px !important;
        box-shadow: 0 20px 50px rgba(0,0,0,0.08) !important;
    }

    .qty-btn-premium {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #ddd;
        background: #f8f9fa;
        color: #333;
        cursor: pointer;
        transition: all 0.2s;
    }
    .qty-btn-premium svg {
        width: 14px;
        height: 14px;
        color: inherit;
    }
    .qty-btn-premium:hover:not(:disabled) {
        background: #333;
        color: white;
        border-color: #333;
        transform: scale(1.05);
    }
    .qty-btn-premium:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }


    .btn-checkout-glow {
        background: #333 !important;
        border: none !important;
        border-radius: 18px !important;
        padding: 1.2rem !important;
        font-weight: 700 !important;
        letter-spacing: 1px;
        transition: all 0.3s !important;
        animation: glow 3s infinite;
    }
    .btn-checkout-glow:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 20px 40px rgba(0,0,0,0.2) !important;
    }

    .empty-state-icon {
        background: linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%);
        box-shadow: 0 20px 40px rgba(0,0,0,0.05);
    }
`;

/* =========================================================
   2. SKELETON LOADER COMPONENT
========================================================= */
const CartSkeleton = () => (
    <Container className="py-5 premium-page">
        <div className="d-flex gap-3 align-items-center mb-5">
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }}></div>
            <div className="skeleton" style={{ width: 250, height: 45, borderRadius: 12 }}></div>
        </div>
        <Row className="g-4">
            <Col lg={8}>
                {[1, 2].map(i => (
                    <div key={i} className="card border-0 shadow-sm p-4 mb-3 d-flex flex-row gap-4 align-items-center" style={{borderRadius: 24}}>
                        <div className="skeleton" style={{ width: 120, height: 120, borderRadius: 20 }}></div>
                        <div className="flex-grow-1">
                            <div className="skeleton mb-3" style={{ width: '40%', height: 25 }}></div>
                            <div className="skeleton mb-3" style={{ width: '20%', height: 20 }}></div>
                            <div className="skeleton" style={{ width: '30%', height: 35 }}></div>
                        </div>
                    </div>
                ))}
            </Col>
            <Col lg={4}>
                <div className="card border-0 shadow-sm p-4 h-100" style={{borderRadius: 24}}>
                    <div className="skeleton mb-4" style={{ width: '60%', height: 30 }}></div>
                    <div className="skeleton mb-4" style={{ width: '100%', height: 200, borderRadius: 20 }}></div>
                    <div className="skeleton w-100" style={{ height: 60, borderRadius: 20 }}></div>
                </div>
            </Col>
        </Row>
    </Container>
);

/* =========================================================
   3. MAIN COMPONENT
========================================================= */
export default function CartPage() {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [exitingItems, setExitingItems] = useState([]);

    // Discount States
    const [discountCode, setDiscountCode] = useState("");
    const [discountLoading, setDiscountLoading] = useState(false);
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
    const money = (v) => Number(v || 0).toLocaleString("vi-VN") + " ₫";
    const calculateTotal = (items) => items.reduce((sum, i) => sum + Number(i.totalPrice || 0), 0);

    const freeShipThreshold = 200000; // Freeship cho đơn từ 200k
    const progress = Math.min((total / freeShipThreshold) * 100, 100);

    const fetchCart = useCallback(async () => {
        setLoading(true);
        try {
            const res = await API.get("/cart");
            setCartItems(res.data || []);
            setSelectedIds(res.data.map(i => i.id));
            setTotal(calculateTotal(res.data));
            // Reset discount if cart changes significantly? logic depends
        } catch (e) {
            setError("Không thể tải giỏ hàng");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) fetchCart();
        else setLoading(false);
    }, [user, fetchCart]);

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    useEffect(() => {
        const selectedItems = cartItems.filter(i => selectedIds.includes(i.id));
        const newTotal = calculateTotal(selectedItems);
        setTotal(newTotal);
        
        // Recalculate discount if code already applied
        if (appliedDiscount && newTotal > 0) {
            handleApplyDiscount(discountCode, newTotal);
        } else {
            setDiscountAmount(0);
        }
    }, [selectedIds, cartItems]);

    const handleQuantityChange = async (id, qty) => {
        if (qty < 1) return;
        try {
            setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
            await API.put(`/cart/${id}?quantity=${qty}`);
            const res = await API.get("/cart");
            setCartItems(res.data || []);
        } catch {
            fetchCart();
        }
    };

    const handleApplyDiscount = async (code = discountCode, currentTotal = total) => {
        if (!code) return;
        setDiscountLoading(true);
        try {
            const res = await API.post(`/discounts/calculate?code=${code}&orderTotal=${currentTotal}`);
            setAppliedDiscount(res.data.discount);
            setDiscountAmount(res.data.discountAmount);
            setError("");
        } catch (err) {
            setAppliedDiscount(null);
            setDiscountAmount(0);
            setError("Mã giảm giá không hợp lệ hoặc không đủ điều kiện");
        } finally {
            setDiscountLoading(false);
        }
    };

    const handleRemove = async (id) => {
        const result = await confirmSwal("Bạn có chắc chắn?", "Loại bỏ sản phẩm này khỏi giỏ hàng?");
        if (!result.isConfirmed) return;
        setExitingItems(prev => [...prev, id]);
        setTimeout(async () => {
            try {
                await API.delete(`/cart/${id}`);
                setCartItems(prev => prev.filter(i => i.id !== id));
                setSelectedIds(prev => prev.filter(x => x !== id));
                setExitingItems(prev => prev.filter(x => x !== id));
                window.dispatchEvent(new Event('cartUpdated'));
            } catch {
                setError("Lỗi khi xóa sản phẩm");
                setExitingItems(prev => prev.filter(x => x !== id));
            }
        }, 400);
    };

    const handleClearCart = async () => {
        const result = await confirmSwal("Dọn sạch giỏ hàng?", "Bạn có chắc chắn muốn làm trống giỏ hàng?");
        if (!result.isConfirmed) return;
        try {
            await API.delete("/cart/clear");
            setCartItems([]);
            setSelectedIds([]);
            window.dispatchEvent(new Event('cartUpdated'));
        } catch {
            setError("Không thể làm trống giỏ hàng");
        }
    };

    if (loading) return <> <style>{styles}</style> <CartSkeleton /> </>;

    if (!user || !cartItems.length) {
        return (
            <div className="premium-page d-flex flex-column align-items-center justify-content-center">
                <style>{styles}</style>
                <div className="bg-white p-5 rounded-5 border shadow-sm text-center animate-fade-up" style={{ maxWidth: 500 }}>
                    <div className="empty-state-icon mb-4 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: 120, height: 120 }}>
                        <FaShoppingBag size={50} className="text-primary opacity-75" />
                    </div>
                    <h2 className="fw-bolder mb-3 text-dark">Giỏ hàng trống trơn!</h2>
                    <p className="text-secondary mb-4 fs-5 px-4">Đừng để bụng đói, hãy chọn ngay cho mình một món kem thơm ngon nhé.</p>
                    <Link to="/menu" className="btn btn-dark rounded-pill px-5 py-3 fw-bold shadow-lg hover-scale">
                        🚀 Khám phá Menu ngay
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="premium-page">
            <style>{styles}</style>

            <Container className="py-5">
                {/* Header Section */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                    <div className="d-flex align-items-center gap-4">
                        <Link to="/menu" className="btn btn-white rounded-circle shadow-sm border d-flex align-items-center justify-content-center hover-scale" style={{ width: 52, height: 52, background: 'white' }}>
                            <FaArrowLeft size={20} color="#333" />
                        </Link>
                        <div>
                            <h1 className="fw-bolder mb-0 text-dark display-5">Giỏ hàng</h1>
                            <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill mt-1 fs-6 fw-medium">
                                {cartItems.length} sản phẩm đã chọn
                            </Badge>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <Button 
                            variant="outline-danger" 
                            className="rounded-pill px-4 py-2 fw-bold border-2 btn-sm hover-scale d-flex align-items-center"
                            onClick={handleClearCart}
                        >
                            <FaTrashAlt className="me-2" size={14} /> Dọn sạch giỏ
                        </Button>
                        {error && <Badge bg="danger" className="p-2 px-3 fw-medium animate-fade-up">{error}</Badge>}
                    </div>
                </div>

                <Row className="g-5">
                    {/* LEFT: CART ITEMS LIST */}
                    <Col lg={8}>
                        {/* Free Shipping Progress */}
                        <div className="bg-white p-4 rounded-4 mb-4 shadow-sm border border-white">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fw-bold text-dark">
                                    {total >= freeShipThreshold ? "🎉 Chúc mừng! Bạn đã được Miễn phí giao hàng" : `Mua thêm ${money(freeShipThreshold - total)} để được Miễn phí giao hàng`}
                                </span>
                                <span className="small text-muted">{Math.round(progress)}%</span>
                            </div>
                            <div className="progress rounded-pill" style={{ height: 8 }}>
                                <div 
                                    className={`progress-bar progress-bar-striped progress-bar-animated ${total >= freeShipThreshold ? 'bg-success' : 'bg-primary'}`}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="d-flex flex-column gap-4">
                            {cartItems.map((item, index) => {
                                const isExiting = exitingItems.includes(item.id);
                                return (
                                    <Card
                                        key={item.id}
                                        className={`cart-item-card shadow-sm ${isExiting ? 'item-exiting' : ''}`}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <Card.Body className="p-4">
                                            <Row className="align-items-center">
                                                <Col xs="auto">
                                                    <Form.Check
                                                        checked={selectedIds.includes(item.id)}
                                                        onChange={() => toggleSelect(item.id)}
                                                        className="custom-checkbox"
                                                        style={{ transform: "scale(1.3)", cursor: "pointer" }}
                                                    />
                                                </Col>
                                                <Col xs="auto">
                                                    <div className="rounded-4 overflow-hidden border bg-light" style={{ width: 120, height: 120 }}>
                                                        <img
                                                            src={item.imageUrl || "https://placehold.co/120?text=IMG"}
                                                            alt={item.productName}
                                                            className="w-100 h-100 object-fit-cover hover-zoom"
                                                        />
                                                    </div>
                                                </Col>
                                                <Col className="py-2">
                                                    <div className="d-flex justify-content-between align-items-start mb-2 text-wrap">
                                                        <h4 className="fw-bolder text-dark mb-0">{item.productName}</h4>
                                                        <button
                                                            onClick={() => handleRemove(item.id)}
                                                            className="btn btn-link text-danger p-0 ms-3 hover-scale d-flex align-items-center"
                                                            title="Xóa món này"
                                                        >
                                                            <FaTrashAlt size={18} color="#e74c3c" />
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="d-flex gap-2 mb-3">
                                                        {item.size && <Badge bg="light" text="secondary" className="border fw-medium px-3">Size: {item.size}</Badge>}
                                                        {item.color && <Badge bg="light" text="secondary" className="border fw-medium px-3">Màu: {item.color}</Badge>}
                                                    </div>

                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div className="fw-bolder text-primary fs-4">{money(item.unitPrice)}</div>
                                                        
                                                        {/* Quantity Selector */}
                                                        <div className="d-flex align-items-center bg-white border rounded-pill p-1 shadow-sm">
                                                            <button 
                                                                className="qty-btn-premium"
                                                                disabled={item.quantity <= 1}
                                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                            >
                                                                <span style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: 1 }}>−</span>
                                                            </button>
                                                            <span className="fw-bold mx-3 fs-5" style={{ minWidth: 30, textAlign: 'center', color: '#333' }}>{item.quantity}</span>
                                                            <button 
                                                                className="qty-btn-premium"
                                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                            >
                                                                <span style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: 1 }}>+</span>
                                                            </button>
                                                        </div>


                                                    </div>
                                                </Col>
                                            </Row>

                                            {/* Toppings Section */}
                                            {item.toppings?.length > 0 && (
                                                <div className="mt-4 pt-3 border-top border-light">
                                                    <div className="small fw-bold text-uppercase text-muted mb-3 d-flex align-items-center gap-2">
                                                        <FaStore /> Toppings đính kèm
                                                    </div>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {item.toppings.map(t => (
                                                            <div key={t.id} className="d-flex align-items-center gap-2 bg-white border rounded-pill px-3 py-1 shadow-sm">
                                                                <img
                                                                    src={t.imageUrl ? `${API_BASE_URL}/uploads/${t.imageUrl}` : "https://placehold.co/24"}
                                                                    alt="" className="rounded-circle" style={{ width: 24, height: 24 }}
                                                                />
                                                                <span className="fw-semibold small">{t.name}</span>
                                                                <span className="text-success fw-bold small">+{money(t.price)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                );
                            })}
                        </div>
                    </Col>

                    {/* RIGHT: ORDER SUMMARY */}
                    <Col lg={4}>
                        <div className="sticky-top" style={{ top: '120px' }}>
                            <Card className="glass-summary p-2">
                                <Card.Body className="p-4">
                                    <h3 className="fw-bolder mb-4 text-dark border-bottom pb-3">Chi tiết thanh toán</h3>
                                    
                                    <div className="d-flex justify-content-between mb-3 fs-5 text-secondary">
                                        <span>Tạm tính ({selectedIds.length} món)</span>
                                        <span className="fw-bold text-dark">{money(total)}</span>
                                    </div>

                                    {/* Voucher Input */}
                                    <div className="mb-4">
                                        <div className="d-flex gap-2">
                                            <div className="position-relative flex-grow-1">
                                                <FaTicketAlt className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                                                <Form.Control 
                                                    placeholder="Nhập mã voucher"
                                                    value={discountCode}
                                                    onChange={(e) => setDiscountCode(e.target.value)}
                                                    className="rounded-pill ps-5 py-2 border-2"
                                                    disabled={appliedDiscount}
                                                    style={{ fontSize: '0.9rem' }}
                                                />
                                            </div>
                                            {!appliedDiscount ? (
                                                <Button 
                                                    variant="dark" 
                                                    className="rounded-pill px-3 fw-bold d-flex align-items-center justify-content-center"
                                                    onClick={() => handleApplyDiscount()}
                                                    disabled={discountLoading || !discountCode}
                                                    style={{ whiteSpace: 'nowrap', minWidth: 'fit-content' }}
                                                >
                                                    {discountLoading ? "..." : "Áp dụng"}
                                                </Button>
                                            ) : (
                                                <Button 
                                                    variant="outline-danger" 
                                                    className="rounded-pill px-3 fw-bold"
                                                    onClick={() => {
                                                        setAppliedDiscount(null);
                                                        setDiscountAmount(0);
                                                        setDiscountCode("");
                                                    }}
                                                    style={{ whiteSpace: 'nowrap' }}
                                                >
                                                    Hủy
                                                </Button>
                                            )}
                                        </div>
                                        {appliedDiscount && (
                                            <div className="mt-2 text-success small fw-bold animate-fade-up">
                                                ✅ Đã áp dụng: {appliedDiscount.code} (-{appliedDiscount.discountType === 'PERCENT' ? appliedDiscount.discountValue + '%' : money(appliedDiscount.discountValue)})
                                            </div>
                                        )}
                                    </div>

                                    <div className="d-flex justify-content-between mb-4 fs-5 text-success">
                                        <span className="d-flex align-items-center gap-2">
                                            <FaTicketAlt /> Giảm giá voucher
                                        </span>
                                        <span className="fw-bold">- {money(discountAmount)}</span>
                                    </div>
                                    
                                    <div className="bg-light bg-opacity-50 p-4 rounded-4 mb-4 border border-white">
                                        <div className="d-flex justify-content-between align-items-end">
                                            <span className="fw-bold text-muted fs-6">TỔNG CỘNG</span>
                                            <div className="text-end">
                                                <div className="fw-black text-primary display-6 mb-0" style={{lineHeight: 1}}>{money(total - discountAmount)}</div>
                                                <small className="text-muted">(Đã bao gồm VAT 8%)</small>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        as={Link}
                                        to={selectedIds.length > 0 ? "/checkout" : "#"}
                                        state={{ appliedDiscount, discountAmount }} // Pass to checkout
                                        className={`btn-checkout-glow w-100 fs-4 mb-4 d-flex align-items-center justify-content-center gap-3 ${selectedIds.length === 0 ? 'disabled opacity-25' : ''}`}
                                    >
                                        THANH TOÁN NGAY <FaArrowRight />
                                    </Button>

                                    <div className="d-flex align-items-center justify-content-center gap-2 text-muted small">
                                        <FaShieldAlt className="text-success" />
                                        <span>Bảo mật thanh toán 100%</span>
                                    </div>
                                </Card.Body>
                            </Card>
                            
                            <div className="mt-4 text-center px-4">
                                <p className="text-muted small italic">
                                    Tiếp tục mua sắm? <Link to="/menu" className="fw-bold text-dark text-decoration-underline">Quay lại Menu</Link>
                                </p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
