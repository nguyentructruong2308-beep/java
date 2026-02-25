// src/pages/client/WishlistPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faShoppingCart, faHeartBroken, faHeart, faBan } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import API from '../../api/api';

// Hàm định dạng tiền tệ
const money = (value) => {
  if (value === null || value === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

export default function WishlistPage() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const res = await API.get('/wishlist');
        setWishlist(res.data.products || []);
      } catch (error) {
        console.error(error);
        toast.error('Không thể tải danh sách yêu thích');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user]);

  const removeFromWishlist = async (productId) => {
    try {
      await API.delete(`/wishlist/${productId}`);
      setWishlist(prev => prev.filter(p => p.id !== productId));
      toast.success('Đã xóa khỏi yêu thích');
    } catch (error) {
      toast.error('Xóa thất bại');
    }
  };

  const addToCart = async (product, e) => {
    // Check if product is out of stock
    if ((product.stockQuantity || 0) <= 0 || product.isActive === false) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }

    if (e) {
      window.dispatchEvent(new CustomEvent('cartAnimate', {
        detail: {
          image: product.imageUrl,
          startX: e.clientX,
          startY: e.clientY
        }
      }));
    }

    try {
      await API.post(`/cart/add?productId=${product.id}&quantity=1`);
      toast.success('Đã thêm vào giỏ hàng');
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Thêm vào giỏ thất bại');
    }
  };

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <div className="p-5 bg-white rounded-3 shadow-sm d-inline-block">
            <h5 className="text-muted">Vui lòng đăng nhập để xem danh sách yêu thích</h5>
            <Link to="/login" className="btn btn-primary mt-3 btn-sm px-4 fw-bold rounded-pill">Đăng nhập</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary spinner-border-sm" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="py-5">
            <FontAwesomeIcon icon={faHeartBroken} className="text-secondary mb-3 opacity-25" size="4x" />
            <h5 className="text-secondary">Danh sách yêu thích trống</h5>
            <Link to="/" className="btn btn-outline-primary mt-3 btn-sm rounded-pill px-4">Tiếp tục mua sắm</Link>
        </div>
      </div>
    );
  }

  // Style card: Thêm overflow hidden để ảnh không bị tràn khi zoom
  const cardStyle = {
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    fontSize: '0.85rem',
    overflow: 'hidden', // Quan trọng cho hiệu ứng zoom ảnh
    backgroundColor: '#fff',
  };

  // Hiệu ứng hover nhẹ nhàng, bóng đổ mềm mại hơn
  const cardHoverStyle = {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.08)', // Bóng đổ xịn hơn
    zIndex: 2
  };

  return (
    <div className="container py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white"> 
        
        <div className="card-header bg-white border-bottom-0 py-3 d-flex align-items-center px-4">
          <div className="bg-danger bg-opacity-10 p-2 rounded-circle me-3">
             <FontAwesomeIcon icon={faHeart} className="text-danger fs-5" />
          </div>
          <div>
            <h5 className="mb-0 fw-bold text-dark">Sản phẩm yêu thích</h5>
            <small className="text-muted">{wishlist.length} sản phẩm</small>
          </div>
        </div>

        <div className="card-body p-4 bg-light bg-opacity-25">
          {/* Grid Compact */}
          <div className="row g-3"> 
            {wishlist.map(product => (
              <div key={product.id} className="col-6 col-md-4 col-lg-3 col-xl-2">
                <div
                  className="card h-100 border-0 rounded-3 shadow-sm" // Bỏ border cứng, dùng shadow-sm mặc định
                  style={{
                    ...cardStyle,
                    ...(hoveredCard === product.id ? cardHoverStyle : {}),
                  }}
                  onMouseEnter={() => setHoveredCard(product.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <Link to={`/product/${product.id}`} className="text-decoration-none overflow-hidden position-relative d-block rounded-top-3">
                    {/* Out of Stock Badge */}
                    {((product.stockQuantity || 0) <= 0 || product.isActive === false) && (
                      <div className="position-absolute top-0 start-0 m-2 bg-dark text-white px-2 py-1 rounded-pill small fw-bold d-flex align-items-center gap-1 shadow-sm" style={{ zIndex: 3, fontSize: '0.65rem' }}>
                        <FontAwesomeIcon icon={faBan} size="xs" /> HẾT HÀNG
                      </div>
                    )}
                    <img
                      src={product.imageUrl || '/placeholder.jpg'}
                      className="card-img-top"
                      alt={product.name}
                      style={{ 
                          height: '160px', 
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease, filter 0.3s ease',
                          transform: hoveredCard === product.id ? 'scale(1.08)' : 'scale(1)',
                          filter: (product.stockQuantity || 0) <= 0 || product.isActive === false ? 'grayscale(100%) brightness(0.9)' : 'none'
                      }} 
                    />
                    {/* Overlay for out of stock */}
                    {((product.stockQuantity || 0) <= 0 || product.isActive === false) && (
                      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.1)', zIndex: 2 }}>
                        <span className="bg-dark text-white px-3 py-1 rounded-pill fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                          HẾT HÀNG
                        </span>
                      </div>
                    )}
                    {/* Overlay mờ nhẹ khi hover */}
                    <div 
                        className="position-absolute w-100 h-100 top-0 start-0"
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.03)',
                            opacity: hoveredCard === product.id ? 1 : 0,
                            transition: 'opacity 0.3s'
                        }}
                    ></div>
                  </Link>
                  
                  {/* Padding p-2 giữ nguyên độ gọn */}
                  <div className="card-body p-2 d-flex flex-column">
                    <div className="mb-1">
                        <Link to={`/product/${product.id}`} className="text-decoration-none">
                        <h6 
                            className="card-title fw-bold mb-1 text-dark" 
                            style={{
                                fontSize: '0.85rem',
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                height: '2.4em', lineHeight: '1.2em',
                                transition: 'color 0.2s',
                                color: hoveredCard === product.id ? '#0d6efd' : '#212529'
                            }}
                        >
                            {product.name}
                        </h6>
                        </Link>
                    </div>
                    
                    <div className="text-primary fw-bolder mb-2" style={{ fontSize: '0.9rem' }}>
                        {money(product.price)}
                    </div>

                    <div className="mt-auto d-flex flex-column gap-2">
                      <button
                        className={`btn btn-sm w-100 py-1 border-0 shadow-sm ${(product.stockQuantity || 0) <= 0 || product.isActive === false ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: '600',
                            backgroundColor: (product.stockQuantity || 0) <= 0 || product.isActive === false ? '#6c757d' : (hoveredCard === product.id ? '#0b5ed7' : '#0d6efd'),
                            transition: 'background 0.2s',
                            cursor: (product.stockQuantity || 0) <= 0 || product.isActive === false ? 'not-allowed' : 'pointer'
                        }}
                        onClick={(e) => addToCart(product, e)}
                        disabled={(product.stockQuantity || 0) <= 0 || product.isActive === false}
                      >
                        {(product.stockQuantity || 0) <= 0 || product.isActive === false ? (
                          <><FontAwesomeIcon icon={faBan} className="me-1" /> Hết hàng</>
                        ) : (
                          <><FontAwesomeIcon icon={faShoppingCart} className="me-1" /> Thêm</>
                        )}
                      </button>
                      
                      <button
                        className="btn btn-light btn-sm w-100 py-1 text-danger fw-medium"
                        style={{ 
                            fontSize: '0.75rem',
                            backgroundColor: hoveredCard === product.id ? '#fee2e2' : '#f8f9fa',
                            transition: 'all 0.2s'
                        }}
                        onClick={() => removeFromWishlist(product.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} className="me-1" /> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}