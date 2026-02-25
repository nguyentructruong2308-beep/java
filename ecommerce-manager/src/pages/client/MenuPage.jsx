import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { FaFilter, FaTimes, FaSpinner, FaSortAmountDown, FaThLarge, FaList, FaSearch, FaArrowRight, FaStar, FaPlus, FaShoppingCart, FaBan } from 'react-icons/fa';
import API from '../../api/api';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export default function MenuPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid | list

  // Filters from URL
  const currentPage = parseInt(searchParams.get('page') || '0', 10);
  const categoryId = searchParams.get('categoryId') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortDir = searchParams.get('sortDir') || 'desc';

  // Local filter state for inputs
  const [localFilters, setLocalFilters] = useState({
    categoryId,
    minPrice,
    maxPrice,
    minRating,
  });


  // Styles
  const styles = {
    pageWrapper: {
      background: 'radial-gradient(circle at top right, #fff5f5 0%, #fff 50%, #f0fff4 100%)',
      minHeight: '100vh',
      paddingTop: '2rem',
      paddingBottom: '4rem'
    },
    glassCard: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(15px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '24px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
      padding: '1.5rem',
      position: 'sticky',
      top: '100px'
    },
    productCard: {
      background: '#fff',
      borderRadius: '20px',
      border: 'none',
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      boxShadow: '0 10px 20px rgba(0,0,0,0.03)',
      cursor: 'pointer'
    },
    imageContainer: {
      position: 'relative',
      paddingTop: '100%',
      backgroundColor: '#fafafa',
      overflow: 'hidden'
    },
    badge: {
      position: 'absolute',
      top: '15px',
      right: '15px',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(5px)',
      padding: '4px 12px',
      borderRadius: '50px',
      fontSize: '0.75rem',
      fontWeight: '700',
      zIndex: 2,
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
    },
    priceTag: {
      color: '#ff4757',
      fontWeight: '800',
      fontSize: '1.1rem'
    }
  };

  // Load categories
  useEffect(() => {
    API.get('/categories').then(res => setCategories(res.data)).catch(console.error);
  }, []);

  // Update local filters when URL changes
  useEffect(() => {
    setLocalFilters({
      categoryId: searchParams.get('categoryId') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      minRating: searchParams.get('minRating') || '',
    });

  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage,
          size: 15,
          sortBy,
          sortDir,
        });
        if (categoryId) params.set('categoryId', categoryId);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (minRating) params.set('minRating', minRating);

        const res = await API.get(`/search?${params.toString()}`);

        setProducts(res.data.products || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage, categoryId, minPrice, maxPrice, minRating, sortBy, sortDir]);


  const applyFilters = () => {
    const params = new URLSearchParams();
    if (localFilters.categoryId) params.set('categoryId', localFilters.categoryId);
    if (localFilters.minPrice) params.set('minPrice', localFilters.minPrice);
    if (localFilters.maxPrice) params.set('maxPrice', localFilters.maxPrice);
    if (localFilters.minRating) params.set('minRating', localFilters.minRating);
    params.set('sortBy', sortBy);
    params.set('sortDir', sortDir);
    params.set('page', '0');
    setSearchParams(params);

    setShowMobileFilter(false);
  };

  const clearFilters = () => {
    setLocalFilters({ categoryId: '', minPrice: '', maxPrice: '', minRating: '' });
    setSearchParams({ sortBy: 'createdAt', sortDir: 'desc', page: '0' });
  };


  const handleSortChange = (e) => {
    const [newSortBy, newSortDir] = e.target.value.split('_');
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', newSortBy);
    params.set('sortDir', newSortDir);
    params.set('page', '0');
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (product, e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    // 🚀 HIỆU ỨNG BAY (Dispatch sang Global Animator)
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
      toast.success(`Đã thêm "${product.name}" vào giỏ`);
      
      // 🔄 CẬP NHẬT HEADER & GIỎ HÀNG CHAT
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      toast.error(err.response?.data?.message || "Thêm giỏ thất bại");
    }
  };

  const selectedCategory = categories.find(c => c.id.toString() === categoryId);

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        .product-card-hover:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
        }
        .product-card-hover:hover img {
          transform: scale(1.1);
        }
        .glass-btn {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }
        .glass-btn:hover {
          background: rgba(255, 255, 255, 0.8);
          transform: scale(1.05);
        }
        .premium-input {
          border-radius: 12px !important;
          border: 2px solid #eee !important;
          transition: all 0.3s ease;
          padding: 0.6rem 1rem;
        }
        .premium-input:focus {
          border-color: #ff9f43 !important;
          box-shadow: 0 0 0 4px rgba(255, 159, 67, 0.1) !important;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stagger-item {
          animation: fadeUp 0.6s ease forwards;
          opacity: 0;
        }
      `}</style>

      <div className="container-fluid px-lg-5">
        {/* Header Section */}
        <div className="row mb-5 align-items-end">
          <div className="col-md-6">
            <h1 className="fw-bold display-5 mb-2" style={{ letterSpacing: '-1px' }}>
              {selectedCategory ? selectedCategory.name : 'Khám phá Menu'}
            </h1>
            <p className="text-muted fs-5 mb-0">
              <span className="badge bg-soft-primary text-primary rounded-pill px-3 py-2" style={{ backgroundColor: 'rgba(52, 152, 219, 0.1)' }}>
                {totalElements} sản phẩm tuyệt hảo
              </span>
            </p>
          </div>
          
          <div className="col-md-6 d-flex justify-content-md-end gap-3 mt-4 mt-md-0">
             <div className="d-flex align-items-center bg-white rounded-pill px-3 py-1 shadow-sm border">
                <FaSortAmountDown className="text-muted me-2" />
                <select 
                  className="form-select border-0 shadow-none bg-transparent fw-bold"
                  style={{ width: 'auto', cursor: 'pointer' }}
                  value={`${sortBy}_${sortDir}`} 
                  onChange={handleSortChange}
                >
                  <option value="createdAt_desc">Mới nhất</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                  <option value="averageRating_desc">Đánh giá tốt nhất</option>
                  <option value="viewCount_desc">Xem nhiều nhất</option>
                  <option value="name_asc">Tên A-Z</option>

                </select>
             </div>

             <div className="btn-group p-1 bg-white rounded-pill shadow-sm border">
               <button 
                 className={`btn rounded-pill px-3 py-2 border-0 ${viewMode === 'grid' ? 'btn-dark' : 'btn-light text-muted'}`}
                 onClick={() => setViewMode('grid')}
               >
                 <FaThLarge />
               </button>
               <button 
                 className={`btn rounded-pill px-3 py-2 border-0 ${viewMode === 'list' ? 'btn-dark' : 'btn-light text-muted'}`}
                 onClick={() => setViewMode('list')}
               >
                 <FaList />
               </button>
             </div>

             <button 
                className="btn btn-dark rounded-pill px-4 d-lg-none"
                onClick={() => setShowMobileFilter(true)}
              >
                <FaFilter className="me-2" /> Lọc
              </button>
          </div>
        </div>

        <div className="row g-4">
          {/* Sidebar Filter */}
          <div className="col-lg-3 d-none d-lg-block">
            <div style={styles.glassCard}>
              <div className="d-flex align-items-center mb-4">
                <FaFilter className="text-primary me-2" />
                <h5 className="fw-bold mb-0">Bộ lọc thông minh</h5>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="fw-bold small text-uppercase mb-2 d-block opacity-50">Danh mục</label>
                <div className="d-flex flex-column gap-2">
                  <button 
                    className={`btn text-start rounded-pill px-3 py-2 border-0 ${!categoryId ? 'btn-primary text-white shadow' : 'btn-light'}`}
                    onClick={() => {
                        setLocalFilters(prev => ({ ...prev, categoryId: '' }));
                        const params = new URLSearchParams(searchParams);
                        params.delete('categoryId');
                        params.set('page', '0');
                        setSearchParams(params);
                    }}
                  >
                    Tất cả sản phẩm
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat.id}
                      className={`btn text-start rounded-pill px-3 py-2 border-0 ${categoryId === cat.id.toString() ? 'btn-primary text-white shadow' : 'btn-light'}`}
                      onClick={() => {
                        setLocalFilters(prev => ({ ...prev, categoryId: cat.id.toString() }));
                        const params = new URLSearchParams(searchParams);
                        params.set('categoryId', cat.id);
                        params.set('page', '0');
                        setSearchParams(params);
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="fw-bold small text-uppercase mb-2 d-block opacity-50">Khoảng giá (VNĐ)</label>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <input 
                      type="number" 
                      className="form-control premium-input text-center" 
                      placeholder="Từ"
                      value={localFilters.minPrice}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    />
                  </div>
                  <div className="col-6">
                    <input 
                      type="number" 
                      className="form-control premium-input text-center" 
                      placeholder="Đến"
                      value={localFilters.maxPrice}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="d-flex flex-wrap gap-2">
                  {[
                    { label: '< 50K', min: '', max: '50000' },
                    { label: '50K - 150K', min: '50000', max: '150000' },
                    { label: '> 150K', min: '150000', max: '' },
                  ].map((range, idx) => (
                    <span
                      key={idx}
                      className="badge rounded-pill px-3 py-2 glass-btn text-dark fw-medium pointer"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setLocalFilters(prev => ({ ...prev, minPrice: range.min, maxPrice: range.max }));
                        const params = new URLSearchParams(searchParams);
                        if (range.min) params.set('minPrice', range.min); else params.delete('minPrice');
                        if (range.max) params.set('maxPrice', range.max); else params.delete('maxPrice');
                        params.set('page', '0');
                        setSearchParams(params);
                      }}
                    >
                      {range.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-top d-grid gap-2">
                <button className="btn btn-dark rounded-pill py-2 fw-bold" onClick={applyFilters}>
                  Áp dụng lọc
                </button>
                <button className="btn btn-link link-secondary text-decoration-none btn-sm" onClick={clearFilters}>
                  Làm mới bộ lọc
                </button>
              </div>

              {/* Rating */}
              <div className="mb-4 mt-4">
                <label className="fw-bold small text-uppercase mb-2 d-block opacity-50">Đánh giá tối thiểu</label>
                <div className="d-flex flex-column gap-1">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div 
                      key={star}
                      className={`d-flex align-items-center px-3 py-2 rounded-pill pointer transition-all ${localFilters.minRating === star.toString() ? 'bg-primary text-white shadow-sm' : 'hover-bg-light'}`}
                      style={{ cursor: 'pointer', transition: '0.2s' }}
                      onClick={() => setLocalFilters(prev => ({ ...prev, minRating: star.toString() }))}
                    >
                      <div className="d-flex gap-1 me-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} size={12} color={i < star ? (localFilters.minRating === star.toString() ? '#fff' : '#ffc107') : '#e4e5e9'} />
                        ))}
                      </div>
                      <span className="small fw-bold">từ {star} sao</span>
                    </div>
                  ))}
                  {localFilters.minRating && (
                    <button className="btn btn-link link-danger btn-sm text-start ps-3" onClick={() => setLocalFilters(p => ({...p, minRating: ''}))}>
                      Xóa lọc sao
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Product Grid */}
          <div className="col-lg-9">
            {loading ? (
              <div className="d-flex flex-column align-items-center justify-content-center py-5">
                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                <h5 className="text-muted fw-bold">Đang lấy menu tốt nhất cho bạn...</h5>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-5 rounded-4 shadow-sm bg-white stagger-item">
                <div className="mb-4 display-1">🍦</div>
                <h3 className="fw-bold">Hôm nay chưa có món này rồi</h3>
                <p className="text-muted">Thử tìm kiếm với danh mục hoặc khoảng giá khác nhé!</p>
                <button className="btn btn-primary rounded-pill px-4 mt-3 py-2 fw-bold" onClick={clearFilters}>
                  Xem toàn bộ menu
                </button>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="row g-4">
                    {products.map((product, index) => (
                      <div key={product.id} className="col-6 col-md-4 col-xl-3 stagger-item" style={{ animationDelay: `${index * 0.1}s`, opacity: (product.stockQuantity || 0) <= 0 || product.isActive === false ? 0.8 : 1 }}>
                        <div style={styles.productCard} className="product-card-hover h-100 d-flex flex-column">
                          <Link to={`/product/${product.id}`} className="text-decoration-none">
                            <div style={styles.imageContainer}>
                              <div style={styles.badge} className="text-dark">
                                <FaStar className="text-warning me-1 mb-1" /> 4.9
                              </div>
                              {((product.stockQuantity || 0) <= 0 || product.isActive === false) && (
                                <div className="position-absolute top-0 start-0 m-2 bg-dark text-white px-2 py-1 rounded-pill small fw-bold d-flex align-items-center gap-1 shadow-sm" style={{ zIndex: 3, fontSize: '0.65rem' }}>
                                  <FaBan size={10} /> HẾT HÀNG
                                </div>
                              )}
                              <img
                                src={product.imageUrl || '/no-image.jpg'}
                                alt={product.name}
                                className="position-absolute top-0 start-0 w-100 h-100 p-3"
                                style={{ 
                                  objectFit: 'contain', 
                                  transition: 'all 0.5s ease',
                                  filter: (product.stockQuantity || 0) <= 0 || product.isActive === false ? 'grayscale(100%) brightness(0.9)' : 'none'
                                }}
                              />
                              {((product.stockQuantity || 0) <= 0 || product.isActive === false) && (
                                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.1)', zIndex: 2 }}>
                                  <span className="bg-dark text-white px-3 py-1 rounded-pill fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                                    HẾT HÀNG
                                  </span>
                                </div>
                              )}
                            </div>
                          </Link>
                          <div className="card-body p-3 d-flex flex-column flex-grow-1">
                            <Link to={`/product/${product.id}`} className="text-decoration-none mb-2">
                              <h6 
                                className="fw-bold text-dark mb-0" 
                                style={{ 
                                  display: '-webkit-box', 
                                  WebkitLineClamp: 2, 
                                  WebkitBoxOrient: 'vertical', 
                                  overflow: 'hidden',
                                  minHeight: '2.4rem'
                                }}
                              >
                                {product.name}
                              </h6>
                            </Link>
                            <div className="d-flex justify-content-between align-items-center mt-auto">
                              <span style={styles.priceTag}>{money(product.price)}</span>
                              <button 
                                className={`btn rounded-circle p-0 ${(product.stockQuantity || 0) <= 0 || product.isActive === false ? 'btn-light text-muted border-0' : 'btn-dark'}`}
                                style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (product.stockQuantity || 0) <= 0 || product.isActive === false ? 'not-allowed' : 'pointer' }}
                                onClick={(e) => (product.stockQuantity || 0) > 0 && product.isActive !== false && handleAddToCart(product, e)}
                                disabled={(product.stockQuantity || 0) <= 0 || product.isActive === false}
                              >
                                  {(product.stockQuantity || 0) <= 0 || product.isActive === false ? <FaBan size={12} /> : <FaPlus size={12} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-4">
                    {products.map((product, index) => (
                      <div key={product.id} className="stagger-item" style={{ animationDelay: `${index * 0.1}s` }}>
                          <div style={styles.productCard} className="product-card-hover border p-3">
                            <div className="row align-items-center">
                              <div className="col-4 col-md-2">
                                <Link to={`/product/${product.id}`}>
                                  <div className="bg-light rounded-3 overflow-hidden" style={{ aspectRatio: '1/1' }}>
                                     <img 
                                        src={product.imageUrl || '/no-image.jpg'} 
                                        alt={product.name}
                                        className="w-100 h-100 p-2"
                                        style={{ 
                                          objectFit: 'contain',
                                          filter: (product.stockQuantity || 0) <= 0 || product.isActive === false ? 'grayscale(100%) brightness(0.9)' : 'none'
                                        }}
                                      />
                                      {((product.stockQuantity || 0) <= 0 || product.isActive === false) && (
                                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.05)', zIndex: 2 }}>
                                          <span className="bg-dark text-white px-2 py-0 rounded-pill fw-bold shadow-sm" style={{ fontSize: '0.55rem', letterSpacing: '0.5px' }}>
                                            HẾT HÀNG
                                          </span>
                                        </div>
                                      )}
                                      {((product.stockQuantity || 0) <= 0 || product.isActive === false) && (
                                        <div className="position-absolute top-0 start-0 m-1 bg-dark text-white px-2 py-0 rounded-pill small fw-bold shadow-sm" style={{ zIndex: 3, fontSize: '0.6rem' }}>
                                          HẾT HÀNG
                                        </div>
                                      )}
                                  </div>
                                </Link>
                              </div>
                              <div className="col-8 col-md-6">
                                  <Link to={`/product/${product.id}`} className="text-decoration-none">
                                    <h5 className="fw-bold text-dark mb-2">{product.name}</h5>
                                  </Link>
                                  <p className="text-muted small mb-0 d-none d-md-block">
                                    {product.description || 'Hương vị tuyệt hảo làm từ nguyên liệu tự nhiên nhất...'}
                                  </p>
                              </div>
                              <div className="col-md-4 text-md-end mt-3 mt-md-0">
                                  <div style={styles.priceTag} className="fs-4 mb-2">{money(product.price)}</div>
                                  <div className="d-flex gap-2 justify-content-md-end">
                                    <Link to={`/product/${product.id}`} className="btn btn-outline-dark rounded-pill px-3 btn-sm fw-bold">Chi tiết</Link>
                                    <button 
                                      className={`btn rounded-pill px-3 btn-sm fw-bold d-flex align-items-center gap-2 ${(product.stockQuantity || 0) <= 0 || product.isActive === false ? 'btn-light text-muted border-0' : 'btn-dark'}`}
                                      disabled={(product.stockQuantity || 0) <= 0 || product.isActive === false}
                                      onClick={(e) => (product.stockQuantity || 0) > 0 && product.isActive !== false && handleAddToCart(product, e)}
                                      style={{ cursor: (product.stockQuantity || 0) <= 0 || product.isActive === false ? 'not-allowed' : 'pointer' }}
                                    >
                                      {(product.stockQuantity || 0) <= 0 || product.isActive === false ? <><FaBan size={14} /> Hết hàng</> : <><FaShoppingCart size={14} /> Thêm vào giỏ</>}
                                    </button>
                                  </div>
                              </div>
                            </div>
                          </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="mt-5">
                    <ul className="pagination justify-content-center gap-2 border-0">
                      <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                        <button className="page-link rounded-circle border-0 shadow-sm" style={{ width: '40px', height: '40px' }} onClick={() => handlePageChange(currentPage - 1)}>
                          ‹
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                          <button 
                            className={`page-link rounded-circle border-0 shadow-sm fw-bold ${currentPage === i ? 'bg-dark text-white' : 'text-dark'}`} 
                            style={{ width: '40px', height: '40px' }}
                            onClick={() => handlePageChange(i)}
                          >
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                        <button className="page-link rounded-circle border-0 shadow-sm" style={{ width: '40px', height: '40px' }} onClick={() => handlePageChange(currentPage + 1)}>
                          ›
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter panel */}
      <div className={`offcanvas offcanvas-start ${showMobileFilter ? 'show' : ''}`} style={{ visibility: showMobileFilter ? 'visible' : 'hidden', background: styles.pageWrapper.background }}>
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title fw-bold">Bộ lọc tùy chọn</h5>
          <button type="button" className="btn-close" onClick={() => setShowMobileFilter(false)}></button>
        </div>
        <div className="offcanvas-body">
            {/* Same filter content as sidebar */}
            <div className="mb-4">
                <label className="fw-bold small text-uppercase mb-2 d-block opacity-50">Danh mục</label>
                <div className="d-flex flex-wrap gap-2">
                  <button className={`btn rounded-pill px-3 btn-sm ${!categoryId ? 'btn-primary' : 'btn-light'}`} onClick={() => clearFilters()}>Tất cả</button>
                  {categories.map(cat => (
                    <button 
                      key={cat.id} 
                      className={`btn rounded-pill px-3 btn-sm ${categoryId === cat.id.toString() ? 'btn-primary' : 'btn-light'}`}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('categoryId', cat.id);
                        setSearchParams(params);
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
            </div>
            
            <div className="mb-4">
                <label className="fw-bold small text-uppercase mb-2 d-block opacity-50">Khoảng giá</label>
                <div className="d-flex gap-2">
                    <input type="number" className="form-control premium-input" placeholder="Từ" value={localFilters.minPrice} onChange={e => setLocalFilters(p => ({...p, minPrice: e.target.value}))} />
                    <input type="number" className="form-control premium-input" placeholder="Đến" value={localFilters.maxPrice} onChange={e => setLocalFilters(p => ({...p, maxPrice: e.target.value}))} />
                </div>
            </div>

            <div className="d-grid mt-5">
                <button className="btn btn-dark rounded-pill py-3 fw-bold shadow" onClick={applyFilters}>XEM KẾT QUẢ</button>
            </div>
        </div>
      </div>
      {showMobileFilter && <div className="offcanvas-backdrop fade show" onClick={() => setShowMobileFilter(false)}></div>}
    </div>
  );
}
