import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faShoppingCart,
  faUser,
  faSearch,
  faSignOutAlt,
  faClipboardList,
  faSpinner,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import useAuth from '../../hooks/useAuth';
import API from '../../api/api';

import logoIceCream from '../../assets/images/logotn.jpg';
import bannerIceCream from '../../assets/images/haha.jpg';
import '../../assets/css/Header.css';
import BannerCarousel from '../BannerCarousel';

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export default function Header() {
  // --- GIỮ NGUYÊN TOÀN BỘ LOGIC CỦA BẠN ---
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const searchWrapperRef = useRef(null);

  const isHomePage = location.pathname === '/';

  const [categories, setCategories] = useState([]);
  const [showProductMenu, setShowProductMenu] = useState(false);

  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const searchTimeoutRef = useRef(null);

  const [cartCount, setCartCount] = useState(0);
  const [isCartBumping, setIsCartBumping] = useState(false);
  const cartIconRef = useRef(null);

  const fetchCartCount = async () => {
    try {
      const res = await API.get('/cart');
      if (res.data) {
        setCartCount(res.data.reduce((total, item) => total + item.quantity, 0));
      }
    } catch (e) { console.error('Lỗi fetch cart:', e); }
  };

  useEffect(() => {
    API.get('/categories').then(res => setCategories(res.data));
    fetchCartCount();

    const handleCartUpdate = () => {
      fetchCartCount();
      setIsCartBumping(true);
      setTimeout(() => setIsCartBumping(false), 500);
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    navigate('/login');
  };

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const res = await API.get(`/search?q=${value}&size=5`);
        setSuggestions(res.data.products || []);
        setShowSuggestions(true);
      } catch (error) { console.error(error); }
      finally { setIsSuggesting(false); }
    }, 300);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${searchQuery}`);
    }
  };

  const handleSelectSuggestion = (productId) => {
    setShowSuggestions(false);
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchWrapperRef]);

  // --- BẮT ĐẦU PHẦN GIAO DIỆN (ĐÃ THÊM HIỆU ỨNG) ---
  return (
    <>
      <header className="top-header">
        <div className="header-inner container">
          <Link
            to="/"
            className="logo"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              const img = e.currentTarget.querySelector('img');
              const text = e.currentTarget.querySelector('span');

              img.style.transform = 'rotate(-8deg) scale(1.15)';
              text.style.letterSpacing = '3px';
              text.style.textShadow = '0 0 12px rgba(255,107,107,0.8)';
            }}
            onMouseLeave={(e) => {
              const img = e.currentTarget.querySelector('img');
              const text = e.currentTarget.querySelector('span');

              img.style.transform = 'rotate(0deg) scale(1)';
              text.style.letterSpacing = '1px';
              text.style.textShadow = '0 2px 6px rgba(0,0,0,0.25)';
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={logoIceCream}
                alt="ICREAM"
                style={{
                  width: '135%',
                  height: '115%',
                  objectFit: 'cover',
                  transform: 'translate(-8%, -6%)',
                  transition: '0.4s ease'
                }}
              />
            </div>

            <span
              style={{
                fontSize: '26px',
                fontWeight: '800',
                letterSpacing: '1px',
                color: '#ff6b6b',
                transition: '0.4s ease',
                textShadow: '0 2px 6px rgba(0,0,0,0.25)'
              }}
            >
              ICREAM
            </span>
          </Link>

          {/* SEARCH BOX */}
          <div className="header-search" ref={searchWrapperRef} style={{ position: 'relative' }}>
            <input
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={handleSearchInput}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            />
            {isSuggesting ? (
              <button style={{ background: 'none', border: 'none', color: '#999' }}><FontAwesomeIcon icon={faSpinner} spin /></button>
            ) : searchQuery ? (
              <button style={{ background: 'none', border: 'none', color: '#999' }} onClick={() => { setSearchQuery(''); setShowSuggestions(false) }}><FontAwesomeIcon icon={faTimes} /></button>
            ) : null}

            <button onClick={handleSearchSubmit}><FontAwesomeIcon icon={faSearch} /></button>

            {/* Dropdown Gợi ý */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                backgroundColor: '#fff', borderRadius: '8px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)', marginTop: '5px',
                zIndex: 9999, overflow: 'hidden', textAlign: 'left', border: '1px solid #eee'
              }}>
                {suggestions.map((prod) => (
                  <div key={prod.id} onClick={() => handleSelectSuggestion(prod.id)}
                    style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <img src={prod.imageUrl || '/no-image.jpg'} alt="" style={{ width: '35px', height: '35px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px' }} />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#333', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{prod.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#ff6b6b' }}>{money(prod.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="header-actions">
            {!user ? (
              <>
                <Link to="/login" className="login-link">Đăng nhập</Link>
                <Link to="/register" className="register-btn">Đăng ký</Link>
              </>
            ) : (
              // USER DROPDOWN
              <div
                className="user-dropdown"
                style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%', marginLeft: '15px', cursor: 'pointer' }}
                onMouseEnter={() => setShowUserDropdown(true)}
                onMouseLeave={() => setShowUserDropdown(false)}
              >
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#333' }}>
                  <div style={{ width: '35px', height: '35px', backgroundColor: '#f0f0f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <span style={{ fontWeight: '600', fontSize: '14px', maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.username || user.lastName || "Tài khoản"}
                  </span>
                </Link>

                {showUserDropdown && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, backgroundColor: 'white',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.15)', borderRadius: '12px', width: '220px',
                    zIndex: 10000, padding: '0', overflow: 'hidden', border: '1px solid #f0f0f0', marginTop: '10px'
                  }}>
                    <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                      <div style={{ fontWeight: 'bold', color: '#333' }}>{user.lastName} {user.firstName}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
                    </div>
                    <ul style={{ listStyle: 'none', padding: '5px 0', margin: 0 }}>
                      <li>
                        <Link to="/profile" style={{ display: 'block', padding: '10px 15px', color: '#333', textDecoration: 'none', fontSize: '14px' }}
                          onMouseEnter={e => e.target.style.background = '#f5f5f5'} onMouseLeave={e => e.target.style.background = 'white'}>
                          <FontAwesomeIcon icon={faUser} style={{ width: '20px', color: '#888' }} /> Hồ sơ cá nhân
                        </Link>
                      </li>
                      <li>
                        <Link to="/orders" style={{ display: 'block', padding: '10px 15px', color: '#333', textDecoration: 'none', fontSize: '14px' }}
                          onMouseEnter={e => e.target.style.background = '#f5f5f5'} onMouseLeave={e => e.target.style.background = 'white'}>
                          <FontAwesomeIcon icon={faClipboardList} style={{ width: '20px', color: '#888' }} /> Đơn mua
                        </Link>
                      </li>
                      <div style={{ height: '1px', backgroundColor: '#eee', margin: '5px 0' }}></div>
                      <li onClick={handleLogout}
                        style={{ padding: '10px 15px', color: '#dc3545', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} style={{ width: '20px' }} /> Đăng xuất
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <Link to="/wishlist" className="icon-btn"><FontAwesomeIcon icon={faHeart} /></Link>
            <Link
              to="/cart"
              className={`icon-btn header-cart-icon ${isCartBumping ? 'bump-animation' : ''}`}
              ref={cartIconRef}
              id="main-header-cart"
            >
              <div style={{ position: 'relative' }}>
                <FontAwesomeIcon icon={faShoppingCart} />
                {cartCount > 0 && (
                  <span className="cart-badge">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="cart-text">Giỏ hàng</span>
            </Link>
          </div>
        </div>
      </header>

      {/* --- CẬP NHẬT 1: THÊM CLASS GLASS-HEADER ĐỂ MENU TRONG SUỐT --- */}
      <nav className="main-nav glass-header">
        <ul>
          <li><NavLink to="/">Trang chủ</NavLink></li>
          <li><NavLink to="/menu">Sản phẩm</NavLink></li>
          <li ref={dropdownRef} onMouseEnter={() => setShowProductMenu(true)} onMouseLeave={() => setShowProductMenu(false)} className="nav-product">
            <span>Danh mục</span>
            {showProductMenu && (
              <div className="product-dropdown">
                {categories.map(cat => <Link key={cat.id} to={`/category/${cat.id}`}>{cat.name}</Link>)}
              </div>
            )}
          </li>
          <li><NavLink to="/about">Giới thiệu</NavLink></li>
          <li><NavLink to="/contact">Liên hệ</NavLink></li>
          <li><NavLink to="/blog">Bài viết</NavLink></li>
          <li><NavLink to="/vouchers">Giảm giá</NavLink></li>
        </ul>
      </nav>

      {isHomePage && (
        <>
          <BannerCarousel />

          <section className="info-bar">
            <div className="container info-grid">
              {/* --- CẬP NHẬT 3: THÊM HIỆU ỨNG ZOOM (AOS) CHO ICON --- */}
              <div data-aos="zoom-in" data-aos-delay="0"><h6>🚚 Vận chuyển miễn phí</h6><p>Cho đơn hàng &gt; 500.000đ</p></div>
              <div data-aos="zoom-in" data-aos-delay="200"><h6>🎁 Mua 2 được giảm giá</h6><p>Lên đến 10% cho đơn tiếp</p></div>
              <div data-aos="zoom-in" data-aos-delay="400"><h6>✅ Chứng nhận chất lượng</h6><p>Sản phẩm an toàn</p></div>
              <div data-aos="zoom-in" data-aos-delay="600"><h6>☎ Hotline</h6><p>1900 2812</p></div>
            </div>
          </section>
        </>
      )}
    </>
  );
}