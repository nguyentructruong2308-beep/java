import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../api/api";
import { Row, Col, Button, Spinner, Container, Card, Badge, ProgressBar, Breadcrumb } from "react-bootstrap";
import { FaHeart, FaStar, FaRegStar, FaShoppingCart, FaCheck, FaTruck, FaShieldAlt, FaUndo, FaMinus, FaPlus, FaFire, FaStore, FaBan } from "react-icons/fa";
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";
import RecentlyViewed from "../../components/RecentlyViewed";

/* =========================================================
   1. CSS STYLES & ANIMATIONS
   (Đặt ngay trong file hoặc chuyển sang file .css riêng)
========================================================= */
const styles = `
    /* Animation Keyframes */
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
    }

    /* Classes */
    .animate-fade-up {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    .sticky-gallery {
        position: sticky;
        top: 90px;
        z-index: 10;
    }

    /* Image Handling */
    .img-square-wrapper {
        position: relative;
        width: 100%;
        aspect-ratio: 1 / 1; /* Luôn vuông */
        overflow: hidden;
        border-radius: 16px;
        background-color: #f8f9fa;
    }
    
    .img-cover {
        width: 100%;
        height: 100%;
        object-fit: cover; /* Cắt ảnh cho vừa khung, không méo */
        transition: transform 0.5s ease;
    }

    .img-square-wrapper:hover .img-cover {
        transform: scale(1.08); /* Zoom nhẹ khi hover */
    }

    /* Interactive Elements */
    .option-pill {
        cursor: pointer;
        border: 1px solid #e9ecef;
        background: white;
        transition: all 0.2s;
        font-weight: 500;
    }
    .option-pill.active {
        border-color: #212529;
        background: #212529;
        color: white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
    
    .topping-card {
        transition: all 0.2s ease;
        border: 1px solid transparent;
    }
    .topping-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    }
    .topping-card.selected {
        border-color: #198754;
        background-color: #f0fff4;
    }

    /* Skeleton Loading */
    .skeleton {
        background: #f6f7f8;
        background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
        background-repeat: no-repeat;
        background-size: 800px 100%; 
        animation: shimmer 1.5s infinite linear;
        border-radius: 8px;
    }

    /* Product Description - Rich Text from Quill Editor */
    .product-description {
        word-wrap: break-word;
    }
    .product-description img {
        max-width: 100%;
        height: auto;
        border-radius: 12px;
        margin: 12px 0;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .product-description p {
        margin-bottom: 1rem;
    }
    .product-description h1, 
    .product-description h2, 
    .product-description h3 {
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        font-weight: 600;
        color: #212529;
    }
    .product-description ul, 
    .product-description ol {
        padding-left: 1.5rem;
        margin-bottom: 1rem;
    }
    .product-description a {
        color: #0d6efd;
        text-decoration: underline;
    }
    .product-description strong {
        font-weight: 600;
    }
    .product-description em {
        font-style: italic;
    }
`;

/* =========================================================
   2. HELPER COMPONENTS
========================================================= */
const StarRating = ({ rating, size = 16 }) => (
    <div className="d-flex text-warning">
        {[...Array(5)].map((_, i) => (
            i < Math.round(rating) ? <FaStar key={i} size={size} /> : <FaRegStar key={i} size={size} className="text-muted opacity-25" />
        ))}
    </div>
);

const SkeletonLoader = () => (
    <Container className="py-5">
        <Row>
            <Col md={6} className="pe-lg-5 mb-4">
                <div className="skeleton w-100" style={{ height: '500px', borderRadius: '16px' }}></div>
            </Col>
            <Col md={6}>
                <div className="skeleton w-25 h-4 mb-3"></div>
                <div className="skeleton w-75 h-2 mb-4" style={{ height: '40px' }}></div>
                <div className="skeleton w-50 h-2 mb-5" style={{ height: '30px' }}></div>
                <div className="d-flex gap-3 mb-4">
                    <div className="skeleton" style={{ width: 50, height: 50, borderRadius: '50%' }}></div>
                    <div className="skeleton" style={{ width: 50, height: 50, borderRadius: '50%' }}></div>
                </div>
                <div className="skeleton w-100" style={{ height: '100px' }}></div>
            </Col>
        </Row>
    </Container>
);

/* =========================================================
   3. REVIEW SECTION (REAL DATA)
========================================================= */
const ReviewSection = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    const [avg, setAvg] = useState(0);
    const [total, setTotal] = useState(0);
    const [filterRating, setFilterRating] = useState(null);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
    const IMAGE_BASE_URL = `${API_BASE_URL}/api/files/download/`;

    const fetchReviews = async () => {
        try {
            const url = filterRating
                ? `/reviews/product/${productId}?rating=${filterRating}&page=0&size=10&sort=createdAt,desc`
                : `/reviews/product/${productId}?page=0&size=10&sort=createdAt,desc`;

            const [listRes, statsRes, avgRes] = await Promise.all([
                API.get(url),
                API.get(`/reviews/product/${productId}/stats`),
                API.get(`/reviews/product/${productId}/average`)
            ]);

            setReviews(listRes.data.content);
            setStats(statsRes.data || {});
            setAvg(avgRes.data || 0);

            const totalCount = Object.values(statsRes.data || {}).reduce((a, b) => a + b, 0);
            setTotal(totalCount);
        } catch (error) {
            console.error("Lỗi tải đánh giá:", error);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId, filterRating]);

    if (total === 0) return (
        <div className="text-center py-5 bg-light rounded-4 border border-dashed">
            <FaRegStar className="text-muted mb-3" size={40} />
            <h6 className="text-muted">Chưa có đánh giá nào cho sản phẩm này.</h6>
        </div>
    );

    return (
        <div className="bg-white border rounded-4 p-4 shadow-sm animate-fade-up">
            <Row className="align-items-center mb-4">
                <Col md={4} className="text-center border-end mb-3 mb-md-0">
                    <div className="display-4 fw-bold text-dark">{avg.toFixed(1)}</div>
                    <div className="d-flex justify-content-center mb-2"><StarRating rating={avg} size={20} /></div>
                    <div className="text-muted small">{total} đánh giá khách quan</div>
                </Col>
                <Col md={8}>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                        <Button
                            variant={filterRating === null ? "dark" : "outline-secondary"}
                            size="sm"
                            className="rounded-pill px-3"
                            onClick={() => setFilterRating(null)}
                        >
                            Tất cả
                        </Button>
                        {[5, 4, 3, 2, 1].map(star => (
                            <Button
                                key={star}
                                variant={filterRating === star ? "dark" : "outline-secondary"}
                                size="sm"
                                className="rounded-pill px-3 d-flex align-items-center gap-1"
                                onClick={() => setFilterRating(star)}
                            >
                                {star} <FaStar size={10} className={filterRating === star ? "text-warning" : ""} />
                            </Button>
                        ))}
                    </div>
                    {[5, 4, 3, 2, 1].map(star => {
                        const count = stats[star] || 0;
                        const percent = total > 0 ? (count / total) * 100 : 0;
                        return (
                            <div className="d-flex align-items-center mb-1" key={star} style={{ cursor: 'pointer' }} onClick={() => setFilterRating(star)}>
                                <span className="small fw-bold me-2 text-muted" style={{ width: '20px' }}>{star}★</span>
                                <ProgressBar now={percent} variant="warning" style={{ height: '8px' }} className="flex-grow-1 rounded-pill" />
                                <span className="small text-muted ms-2" style={{ width: '40px', textAlign: 'right' }}>{count}</span>
                            </div>
                        )
                    })}
                </Col>
            </Row>

            <hr className="opacity-10 my-4" />

            <div className="review-list">
                {reviews.length === 0 ? (
                    <div className="text-center py-4 text-muted fst-italic">Không tìm thấy đánh giá {filterRating} sao nào.</div>
                ) : reviews.map(r => (
                    <div key={r.id} className="d-flex gap-3 mb-4 border-bottom pb-4 last-child-no-border">
                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: 48, height: 48, fontSize: '1.2rem' }}>
                            {r.userFullName ? r.userFullName.charAt(0).toUpperCase() : 'K'}
                        </div>
                        <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                                <div>
                                    <div className="fw-bold text-dark d-flex align-items-center gap-2 mb-1">
                                        {r.userFullName || "Khách hàng"}
                                        <Badge bg="success" className="rounded-pill p-1 d-flex align-items-center gap-1" style={{ fontSize: '9px' }}>
                                            <FaCheck size={8} /> Đã mua hàng
                                        </Badge>
                                    </div>
                                    <div className="mb-2"><StarRating rating={r.rating} size={12} /></div>
                                </div>
                                <small className="text-muted fw-light">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</small>
                            </div>

                            <p className="text-secondary mb-2" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{r.comment}</p>

                            <div className="d-flex flex-wrap gap-2 mt-2">
                                {r.imageUrls && r.imageUrls.length > 0 ? (
                                    r.imageUrls.map((url, idx) => (
                                        <div
                                            key={idx}
                                            className="overflow-hidden rounded-3 border bg-light d-flex align-items-center justify-content-center cursor-pointer hover-zoom"
                                            style={{ width: '80px', height: '80px' }}
                                            onClick={() => window.open(`${IMAGE_BASE_URL}${url}`, '_blank')}
                                        >
                                            <img src={`${IMAGE_BASE_URL}${url}`} alt={`Review ${idx}`} className="w-100 h-100 object-fit-cover" />
                                        </div>
                                    ))
                                ) : r.imageUrl ? (
                                    /* Fallback for old data if necessary */
                                    <div
                                        className="overflow-hidden rounded-3 border bg-light d-flex align-items-center justify-content-center cursor-pointer hover-zoom"
                                        style={{ width: '80px', height: '80px' }}
                                        onClick={() => window.open(`${IMAGE_BASE_URL}${r.imageUrl}`, '_blank')}
                                    >
                                        <img src={`${IMAGE_BASE_URL}${r.imageUrl}`} alt="Review" className="w-100 h-100 object-fit-cover" />
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {total > 10 && !filterRating && (
                <div className="text-center mt-3">
                    <Button variant="outline-dark" size="sm" className="rounded-pill px-5 py-2 fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>Xem thêm đánh giá</Button>
                </div>
            )}
        </div>
    );
};


/* =========================================================
   4. MAIN PRODUCT DETAIL PAGE
========================================================= */
export default function ProductDetailPage() {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

    // State
    const [product, setProduct] = useState(null);
    const [toppings, setToppings] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Selection State
    const [selectedToppings, setSelectedToppings] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [expandDescription, setExpandDescription] = useState(false);

    // Derived Logic
    const variants = product?.variants || [];
    const uniqueColors = [...new Set(variants.map(v => v.color))].filter(Boolean);
    const simpleSizes = product?.availableSizes ? product.availableSizes.split(',').map(s => s.trim()).filter(Boolean) : [];

    // Size logic: Nếu chọn màu rồi thì chỉ hiện size của màu đó, nếu chưa thì hiện hết
    const availableSizes = variants.length > 0
        ? [...new Set((selectedColor ? variants.filter(v => v.color === selectedColor) : variants).map(v => v.productSize))].filter(Boolean)
        : simpleSizes;

    const selectedVariant = variants.find(v => v.color === selectedColor && v.productSize === selectedSize);
    const isOutOfStock = selectedVariant
        ? selectedVariant.stockQuantity <= 0
        : ((product?.stockQuantity || 0) <= 0 || product?.isActive === false);

    // Fetch Data
    useEffect(() => {
        if (!id) return; // Guard: Don't fetch if id is null/undefined

        const fetchData = async () => {
            try {
                setLoading(true);
                const [pRes, tRes, rRes] = await Promise.all([
                    API.get(`/products/${id}`),
                    API.get(`/toppings/product/${id}`),
                    API.get(`/search/recommendations/${id}`)
                ]);
                setProduct(pRes.data);
                setToppings(tRes.data || []);
                setRecommendations(rRes.data || []);
            } catch {
                setError("Sản phẩm không tồn tại.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Record view history
        API.post(`/view-history/${id}`).catch(() => { });

        // Reset selections when ID changes
        setSelectedToppings([]);
        setQuantity(1);
        setSelectedColor(null);
        setSelectedSize(null);
    }, [id]);

    // Auto Select First Available Variant
    useEffect(() => {
        if (product) {
            if (variants.length > 0 && !selectedColor && !selectedSize) {
                // Ưu tiên chọn variant còn hàng trước
                const firstAvailable = variants.find(v => v.stockQuantity > 0) || variants[0];
                setSelectedColor(firstAvailable.color);
                setSelectedSize(firstAvailable.productSize);
            } else if (simpleSizes.length > 0 && !selectedSize) {
                setSelectedSize(simpleSizes[0]);
            }
        }
    }, [product, variants, simpleSizes]);

    const toggleTopping = (t) => {
        setSelectedToppings(prev => prev.find(x => x.id === t.id) ? prev.filter(x => x.id !== t.id) : [...prev, t]);
    };

    const handleAddToCart = async (e) => {
        if (!isAuthenticated) return toast.warn("Vui lòng đăng nhập để mua hàng");

        // 🚀 HIỆU ỨNG BAY (Dispatch sang Global Animator)
        if (e) {
            window.dispatchEvent(new CustomEvent('cartAnimate', {
                detail: {
                    image: mainDisplayImg,
                    startX: e.clientX,
                    startY: e.clientY
                }
            }));
        }

        try {
            const params = new URLSearchParams();
            if (selectedVariant) params.append('productVariantId', selectedVariant.id);
            else {
                params.append('productId', product.id);
                if (selectedSize) params.append('selectedSize', selectedSize);
            }
            params.append('quantity', quantity);
            selectedToppings.forEach(t => params.append('toppingIds', t.id));

            await API.post(`/cart/add?${params.toString()}`);
            toast.success("Đã thêm vào giỏ hàng thành công!");

            // 🔄 CẬP NHẬT HEADER & GIỎ HÀNG CHAT
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi thêm giỏ hàng");
        }
    };

    // Helper get Image
    const getImg = (url) => {
        if (!url) return "https://placehold.co/600x600/f5f5f5/dddddd?text=No+Image";
        return url.startsWith("http") ? url : `${API_BASE_URL}/uploads/${url}`;
    };

    if (loading) return <> <style>{styles}</style> <SkeletonLoader /> </>;
    if (error) return <Container className="py-5 text-center"><h3>{error}</h3><Button as={Link} to="/">Về trang chủ</Button></Container>;
    if (!product) return null;

    // Price Calculation
    let basePrice = product.price;
    if (selectedVariant) basePrice = selectedVariant.price;
    else if (selectedSize && product.sizePrices?.[selectedSize]) basePrice = product.sizePrices[selectedSize];
    const toppingPrice = selectedToppings.reduce((s, t) => s + t.price, 0);
    const finalPrice = basePrice + toppingPrice;

    // Main Image
    let mainDisplayImg = selectedVariant?.imageUrl || selectedVariant?.colorImageUrl || product.imageUrl;
    mainDisplayImg = getImg(mainDisplayImg);

    return (
        <div className="bg-white min-vh-100 pb-5" style={{ fontFamily: "'Inter', sans-serif" }}>
            <style>{styles}</style> {/* Inject CSS */}

            <Container className="py-4">
                {/* Breadcrumb */}
                <Breadcrumb className="mb-4 small text-uppercase fw-bold text-muted animate-fade-up">
                    <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Trang chủ</Breadcrumb.Item>
                    <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/menu" }}>Thực đơn</Breadcrumb.Item>
                    <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
                </Breadcrumb>

                <Row className="gx-lg-5">
                    {/* LEFT: IMAGE GALLERY (STICKY) */}
                    <Col lg={6} className="mb-5 mb-lg-0 animate-fade-up">
                        <div className="sticky-gallery">
                            <div className="img-square-wrapper shadow-sm mb-3">
                                <img
                                    src={mainDisplayImg}
                                    alt={product.name}
                                    className="img-cover"
                                    style={{ filter: isOutOfStock ? 'grayscale(100%) brightness(0.8)' : 'none' }}
                                />
                                {product.bestSeller && !isOutOfStock && (
                                    <Badge bg="warning" text="dark" className="position-absolute top-0 start-0 m-3 px-3 py-2 text-uppercase fw-bold shadow-sm z-2">
                                        Best Seller
                                    </Badge>
                                )}
                                {isOutOfStock && (
                                    <Badge bg="dark" className="position-absolute top-0 start-0 m-3 px-3 py-2 text-uppercase fw-bold shadow-sm z-2">
                                        <FaBan className="me-1 mb-1" /> Hết hàng
                                    </Badge>
                                )}
                            </div>

                            {/* Color Thumbnails (Real Data) */}
                            {uniqueColors.length > 0 && (
                                <div className="d-flex gap-2 overflow-auto pb-2 scrollbar-hide">
                                    {uniqueColors.map(c => {
                                        const v = variants.find(x => x.color === c);
                                        const imgUrl = getImg(v.colorImageUrl);
                                        return (
                                            <div
                                                key={c}
                                                className={`rounded-3 border overflow-hidden cursor-pointer flex-shrink-0 ${selectedColor === c ? 'border-dark ring-2' : 'border-light'}`}
                                                style={{ width: 70, height: 70, transition: 'all 0.2s' }}
                                                onClick={() => setSelectedColor(c)}
                                            >
                                                <img src={imgUrl} className="w-100 h-100 object-fit-cover" alt={c} title={c} />
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </Col>

                    {/* RIGHT: DETAILS */}
                    <Col lg={6} className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        {/* Header */}
                        <div className="border-bottom pb-4 mb-4">
                            <div className="text-uppercase text-primary fw-bold small mb-2 d-flex align-items-center gap-2">
                                <FaStore /> {product.category?.name || "Premium Quality"}
                            </div>
                            <h1 className="display-5 fw-bolder text-dark mb-3">{product.name}</h1>
                            <div className="d-flex align-items-end justify-content-between flex-wrap gap-2">
                                <h2 className="text-success fw-bold mb-0 display-6">
                                    {finalPrice.toLocaleString()} ₫
                                </h2>
                                {isOutOfStock && (
                                    <Badge bg="dark" className="ms-3 px-3 py-2 text-uppercase fw-bold shadow-sm">
                                        <FaBan className="me-1 mb-1" /> Hết hàng
                                    </Badge>
                                )}
                                {/* Placeholder star rating logic based on fetched reviews if needed, or link to reviews */}
                                <a href="#reviews" className="text-decoration-none text-muted d-flex align-items-center gap-1">
                                    <StarRating rating={4.5} size={14} />
                                    <span className="small ms-1 text-decoration-underline">Xem đánh giá</span>
                                </a>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div
                                className={`text-secondary product-description position-relative ${!expandDescription ? 'description-collapsed' : ''}`}
                                style={{
                                    fontSize: '1.05rem',
                                    lineHeight: '1.7',
                                    maxHeight: expandDescription ? 'none' : '200px',
                                    overflow: 'hidden',
                                    transition: 'max-height 0.3s ease'
                                }}
                            >
                                <div dangerouslySetInnerHTML={{ __html: product.description || '' }} />
                                {!expandDescription && product.description && product.description.length > 300 && (
                                    <div
                                        className="position-absolute bottom-0 start-0 end-0"
                                        style={{
                                            height: '80px',
                                            background: 'linear-gradient(transparent, white)'
                                        }}
                                    />
                                )}
                            </div>
                            {product.description && product.description.length > 300 && (
                                <Button
                                    variant="link"
                                    className="p-0 mt-2 text-primary fw-bold text-decoration-none"
                                    onClick={() => setExpandDescription(!expandDescription)}
                                >
                                    {expandDescription ? '▲ Thu gọn' : '▼ Xem thêm mô tả'}
                                </Button>
                            )}
                        </div>

                        {/* SELECTORS */}
                        <div className="bg-light p-4 rounded-4 mb-4">
                            {/* Size Selector */}
                            {availableSizes.length > 0 && (
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between mb-2">
                                        <label className="fw-bold small text-uppercase">Kích thước</label>
                                        <span className="text-muted small">{selectedSize}</span>
                                    </div>
                                    <div className="d-flex flex-wrap gap-2">
                                        {availableSizes.map(sz => (
                                            <div
                                                key={sz}
                                                className={`option-pill px-4 py-2 rounded-pill ${selectedSize === sz ? 'active' : ''}`}
                                                onClick={() => setSelectedSize(sz)}
                                            >
                                                {sz}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Toppings Grid */}
                            {toppings.length > 0 && (
                                <div>
                                    <label className="fw-bold small text-uppercase mb-3 d-block">Topping thêm ({selectedToppings.length})</label>
                                    <Row className="g-2">
                                        {toppings.map(t => {
                                            const isSelected = selectedToppings.some(x => x.id === t.id);
                                            return (
                                                <Col xs={6} md={4} key={t.id}>
                                                    <div
                                                        className={`topping-card d-flex align-items-center p-2 rounded-3 bg-white cursor-pointer ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => toggleTopping(t)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <img src={getImg(t.imageUrl)} className="rounded me-2 object-fit-cover" width="36" height="36" alt="" />
                                                        <div className="lh-1 flex-grow-1">
                                                            <div className="fw-bold small text-dark mb-1 text-truncate">{t.name}</div>
                                                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>+{t.price.toLocaleString()}</div>
                                                        </div>
                                                        {isSelected && <FaCheck className="text-success ms-1" size={10} />}
                                                    </div>
                                                </Col>
                                            )
                                        })}
                                    </Row>
                                </div>
                            )}
                        </div>

                        {/* ACTIONS */}
                        <div className="d-flex gap-3 align-items-stretch mb-5">
                            <div className={`d-flex align-items-center bg-white border rounded-pill px-2 shadow-sm ${isOutOfStock ? 'opacity-50' : ''}`} style={{ height: '56px' }}>
                                <Button variant="link" className="text-dark p-3 rounded-circle" onClick={() => !isOutOfStock && setQuantity(q => Math.max(1, q - 1))} disabled={isOutOfStock}><FaMinus size={12} /></Button>
                                <span className="fw-bold fs-5 mx-2 text-center" style={{ width: '24px' }}>{quantity}</span>
                                <Button variant="link" className="text-dark p-3 rounded-circle" onClick={() => !isOutOfStock && setQuantity(q => q + 1)} disabled={isOutOfStock}><FaPlus size={12} /></Button>
                            </div>

                            <Button
                                variant={isOutOfStock ? "secondary" : "dark"}
                                size="lg"
                                className="flex-grow-1 rounded-pill shadow fw-bold text-uppercase d-flex align-items-center justify-content-center gap-2"
                                style={{ transition: 'transform 0.1s', cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                                onMouseDown={(e) => !isOutOfStock && (e.target.style.transform = 'scale(0.98)')}
                                onMouseUp={(e) => !isOutOfStock && (e.target.style.transform = 'scale(1)')}
                                onClick={(e) => !isOutOfStock && handleAddToCart(e)}
                                disabled={isOutOfStock}
                            >
                                {isOutOfStock ? <><FaBan size={18} /> Tạm hết hàng</> : <><FaShoppingCart className="mb-1" /> Thêm vào giỏ - {finalPrice.toLocaleString()} ₫</>}
                            </Button>

                            <Button variant="outline-danger" className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '56px', height: '56px' }}>
                                <FaHeart size={20} />
                            </Button>
                        </div>

                        {/* TRUST BADGES */}
                        <Row className="text-center g-3 mb-5 border-top pt-4">
                            <Col xs={4}>
                                <FaTruck className="text-muted fs-4 mb-2" />
                                <div className="small fw-bold text-dark">Giao nhanh 2H</div>
                            </Col>
                            <Col xs={4}>
                                <FaShieldAlt className="text-muted fs-4 mb-2" />
                                <div className="small fw-bold text-dark">100% Chính hãng</div>
                            </Col>
                            <Col xs={4}>
                                <FaUndo className="text-muted fs-4 mb-2" />
                                <div className="small fw-bold text-dark">Đổi trả miễn phí</div>
                            </Col>
                        </Row>

                        {/* REVIEWS */}
                        <div id="reviews" className="pt-2">
                            <h4 className="fw-bold mb-4">Đánh giá sản phẩm</h4>
                            <ReviewSection productId={id} />
                        </div>
                    </Col>
                </Row>

                {/* RELATED PRODUCTS */}
                {recommendations.length > 0 && (
                    <div className="mt-5 pt-5 border-top animate-fade-up">
                        <h3 className="fw-bold mb-4 d-flex align-items-center gap-2"><FaFire className="text-danger" /> Có thể bạn sẽ thích</h3>
                        <Row className="g-4">
                            {recommendations.map(p => (
                                <Col xs={6} md={3} key={p.id}>
                                    <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden topping-card">
                                        <div className="img-square-wrapper">
                                            <Link to={`/product/${p.id}`}>
                                                <img src={getImg(p.imageUrl)} className="img-cover" alt={p.name} />
                                            </Link>
                                        </div>
                                        <Card.Body className="d-flex flex-column">
                                            <Card.Title className="fw-bold fs-6 mb-1 text-truncate">
                                                <Link to={`/product/${p.id}`} className="text-dark text-decoration-none">{p.name}</Link>
                                            </Card.Title>
                                            <div className="mt-auto fw-bold text-primary">
                                                {p.price.toLocaleString()} ₫
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}

                {/* RECENTLY VIEWED */}
                <RecentlyViewed limit={10} />
            </Container>
        </div>
    );
}