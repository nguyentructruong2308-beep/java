import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaFilter, FaSearch, FaTimes, FaSpinner } from 'react-icons/fa';
import API from '../../api/api';

// Hàm format tiền
const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export default function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // --- STATES CHO GỢI Ý TÌM KIẾM (NEW) ---
  const [suggestions, setSuggestions] = useState([]); // Danh sách gợi ý
  const [showSuggestions, setShowSuggestions] = useState(false); // Ẩn/hiện dropdown
  const [isSuggesting, setIsSuggesting] = useState(false); // Loading của gợi ý
  const searchTimeoutRef = useRef(null); // Ref để quản lý debounce
  const wrapperRef = useRef(null); // Ref để click outside thì đóng

  // State bộ lọc
  const [filters, setFilters] = useState({
    q: '',
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  // Lấy params từ URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setFilters({
      q: params.get('q') || '',
      categoryId: params.get('categoryId') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      sortBy: params.get('sortBy') || 'createdAt',
      sortDir: params.get('sortDir') || 'desc',
    });
    setCurrentPage(parseInt(params.get('page') || '0', 10));
  }, [location.search]);

  // Gọi API lấy kết quả chính (Grid sản phẩm)
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          ...filters,
          page: currentPage,
          size: 15,
        });
        Object.keys(filters).forEach(key => !filters[key] && params.delete(key));

        const res = await API.get(`/search?${params.toString()}`);
        setResults(res.data.products || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [filters, currentPage]);

  // --- LOGIC XỬ LÝ CLICK OUTSIDE (Đóng gợi ý khi click ra ngoài) ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // --- LOGIC GỌI API GỢI Ý (Debounce) ---
  const handleSearchInput = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, q: value }));

    // Reset timeout cũ
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    // Nếu ô tìm kiếm trống, tắt gợi ý
    if (!value.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
    }

    // Set timeout mới (Debounce 400ms)
    searchTimeoutRef.current = setTimeout(async () => {
        setIsSuggesting(true);
        setShowSuggestions(true);
        try {
            // Gọi API lấy 5 sản phẩm gợi ý
            const res = await API.get(`/search?q=${value}&size=5`);
            setSuggestions(res.data.products || []);
        } catch (error) {
            console.error("Lỗi gợi ý:", error);
        } finally {
            setIsSuggesting(false);
        }
    }, 400);
  };

  // Khi chọn một gợi ý
  const handleSelectSuggestion = (productName) => {
    setFilters(prev => ({ ...prev, q: productName })); // Điền tên vào ô input
    setShowSuggestions(false); // Đóng dropdown
    
    // Trigger tìm kiếm chính
    const params = new URLSearchParams(location.search);
    params.set('q', productName);
    params.set('page', '0');
    navigate(`/search?${params.toString()}`);
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('page', '0');
    navigate(`/search?${params.toString()}`);
    setShowMobileFilter(false);
    setShowSuggestions(false);
  };

  // ... (Giữ nguyên các hàm handleSortChange, handlePageChange)
  const handleSortChange = (e) => {
    const [sortBy, sortDir] = e.target.value.split('_');
    setFilters(prev => ({ ...prev, sortBy, sortDir }));
    const params = new URLSearchParams(location.search);
    params.set('sortBy', sortBy);
    params.set('sortDir', sortDir);
    navigate(`/search?${params.toString()}`);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(location.search);
    params.set('page', page);
    navigate(`/search?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }} className="py-3">
      <div className="container-fluid px-lg-5">
        
        {/* Header Mobile Toolbar */}
        <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h5 className="fw-bold mb-0 text-dark">Kết quả tìm kiếm</h5>
                <span className="text-muted" style={{fontSize: '0.85rem'}}>
                    {filters.q ? `"${filters.q}"` : 'Tất cả'} • {results.length} kết quả
                </span>
            </div>
            
            <button 
                className="btn btn-white border shadow-sm d-lg-none btn-sm fw-bold"
                onClick={() => setShowMobileFilter(true)}
            >
                <FaFilter className="me-2 text-primary"/> Bộ lọc
            </button>
        </div>

        <div className="row g-3">
          {/* --- SIDEBAR BỘ LỌC (Có thanh tìm kiếm thông minh) --- */}
          <div className={`col-lg-2 ${showMobileFilter ? 'fixed-top h-100 bg-white p-3 shadow z-3' : 'd-none d-lg-block'}`}>
             
             <div className="d-flex justify-content-between align-items-center d-lg-none mb-3 pb-2 border-bottom">
                <h6 className="fw-bold mb-0">Bộ lọc</h6>
                <button className="btn btn-close btn-sm" onClick={() => setShowMobileFilter(false)}></button>
             </div>

             <div className="bg-white p-3 rounded-3 shadow-sm border-0 h-100">
                
                {/* --- Ô TÌM KIẾM THÔNG MINH --- */}
                <div className="mb-3 position-relative" ref={wrapperRef}>
                    <label className="form-label fw-bold small text-muted text-uppercase" style={{fontSize: '0.7rem'}}>Từ khóa</label>
                    <div className="input-group input-group-sm">
                        <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted small"/></span>
                        <input 
                            type="text" 
                            className="form-control bg-light border-start-0" 
                            placeholder="Tìm kiếm..."
                            value={filters.q}
                            onChange={handleSearchInput} // Thay đổi hàm xử lý
                            onFocus={() => filters.q && setShowSuggestions(true)} // Hiện lại khi focus
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            style={{fontSize: '0.85rem'}}
                        />
                        {/* Loading spinner nhỏ trong ô input */}
                        {isSuggesting && (
                            <span className="input-group-text bg-light border-start-0 px-2">
                                <FaSpinner className="spinner-border spinner-border-sm text-muted" />
                            </span>
                        )}
                    </div>

                    {/* --- DROPDOWN GỢI Ý --- */}
                    {showSuggestions && (
                        <div className="position-absolute start-0 end-0 bg-white shadow rounded-3 border mt-1 overflow-hidden" style={{zIndex: 1000, top: '100%'}}>
                            {suggestions.length > 0 ? (
                                <ul className="list-group list-group-flush mb-0">
                                    {suggestions.map((prod) => (
                                        <li 
                                            key={prod.id} 
                                            className="list-group-item list-group-item-action d-flex align-items-center p-2 cursor-pointer border-0"
                                            onClick={() => handleSelectSuggestion(prod.name)}
                                            style={{cursor: 'pointer', fontSize: '0.8rem'}}
                                        >
                                            <img 
                                                src={prod.imageUrl || '/no-image.jpg'} 
                                                alt="" 
                                                className="rounded me-2 border" 
                                                style={{width: '30px', height: '30px', objectFit: 'cover'}}
                                            />
                                            <div className="text-truncate">
                                                <span className="fw-bold text-dark d-block text-truncate">{prod.name}</span>
                                                <small className="text-muted">{money(prod.price)}</small>
                                            </div>
                                        </li>
                                    ))}
                                    {/* Nút xem tất cả */}
                                    <li 
                                        className="list-group-item list-group-item-action text-center text-primary p-2 small fw-bold border-top"
                                        style={{cursor: 'pointer', backgroundColor: '#f8f9fa'}}
                                        onClick={applyFilters}
                                    >
                                        Xem tất cả kết quả cho "{filters.q}"
                                    </li>
                                </ul>
                            ) : (
                                !isSuggesting && filters.q && (
                                    <div className="p-3 text-center text-muted small">
                                        Không tìm thấy gợi ý nào
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Các bộ lọc khác (Giữ nguyên) */}
                <div className="mb-3">
                    <label className="form-label fw-bold small text-muted text-uppercase" style={{fontSize: '0.7rem'}}>Khoảng giá</label>
                    <div className="d-flex align-items-center gap-1 mb-2">
                        <input type="number" name="minPrice" className="form-control form-control-sm bg-light" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters(prev => ({...prev, minPrice: e.target.value}))} style={{fontSize: '0.85rem'}} />
                        <span className="text-muted small">-</span>
                        <input type="number" name="maxPrice" className="form-control form-control-sm bg-light" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters(prev => ({...prev, maxPrice: e.target.value}))} style={{fontSize: '0.85rem'}} />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold small text-muted text-uppercase" style={{fontSize: '0.7rem'}}>Sắp xếp</label>
                    <select className="form-select form-select-sm bg-light" value={`${filters.sortBy}_${filters.sortDir}`} onChange={handleSortChange} style={{fontSize: '0.85rem'}}>
                        <option value="createdAt_desc">Mới nhất</option>
                        <option value="price_asc">Giá tăng dần</option>
                        <option value="price_desc">Giá giảm dần</option>
                        <option value="name_asc">Tên A-Z</option>
                    </select>
                </div>

                <button className="btn btn-primary btn-sm w-100 fw-bold shadow-sm" onClick={applyFilters}>Áp dụng</button>
             </div>
          </div>

          {/* --- DANH SÁCH KẾT QUẢ (Giữ nguyên phần này) --- */}
          <div className="col-lg-10">
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
                </div>
            ) : results.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-3 shadow-sm">
                    <FaSearch className="text-muted opacity-25 mb-3" size="3x"/>
                    <h6 className="text-muted">Không tìm thấy sản phẩm</h6>
                    <button onClick={() => {
                        setFilters({ q: '', minPrice: '', maxPrice: '', categoryId: '', sortBy: 'createdAt', sortDir: 'desc' });
                        navigate('/search');
                    }} className="btn btn-outline-primary btn-sm mt-2 rounded-pill px-4">
                        Xóa bộ lọc
                    </button>
                </div>
            ) : (
                <>
                    <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-2 g-md-3">
                        {results.map(product => (
                            <div key={product.id} className="col">
                                <div 
                                    className="card h-100 border-0 shadow-sm bg-white position-relative rounded-3 overflow-hidden"
                                    style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.08)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)';
                                    }}
                                >
                                    <div className="position-relative bg-white border-bottom" style={{ paddingTop: '100%' }}>
                                        <Link to={`/product/${product.id}`}>
                                            <img
                                                src={product.imageUrl || '/no-image.jpg'}
                                                alt={product.name}
                                                className="position-absolute top-0 start-0 w-100 h-100 p-2"
                                                style={{ objectFit: 'contain' }} 
                                            />
                                        </Link>
                                    </div>
                                    <div className="card-body p-2 d-flex flex-column">
                                        <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                                            <h6 className="card-title fw-normal mb-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.4em', lineHeight: '1.2em', fontSize: '0.85rem' }}>{product.name}</h6>
                                        </Link>
                                        <div className="mt-auto">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="text-primary fw-bold" style={{ fontSize: '0.9rem' }}>{money(product.price)}</span>
                                            </div>
                                            <Link to={`/product/${product.id}`} className="btn btn-light w-100 mt-2 text-primary fw-bold btn-sm py-1" style={{ fontSize: '0.75rem', backgroundColor: '#f0f7ff' }}>Xem ngay</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Phân trang */}
                    {totalPages > 1 && (
                        <nav className="mt-4">
                            <ul className="pagination justify-content-center pagination-sm">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                                        <button className="page-link border-0 rounded mx-1 fw-bold text-dark" style={{ backgroundColor: currentPage === i ? '#e9ecef' : 'transparent' }} onClick={() => handlePageChange(i)}>{i + 1}</button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}