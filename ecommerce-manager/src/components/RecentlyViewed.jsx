import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaEye } from 'react-icons/fa';
import API from '../api/api';

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export default function RecentlyViewed({ limit = 10 }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        const res = await API.get(`/view-history?limit=${limit}`);
        setProducts(res.data || []);
      } catch (err) {
        console.error('Error fetching recently viewed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentlyViewed();
  }, [limit]);

  const scrollContainer = (direction) => {
    const container = document.getElementById('recently-viewed-container');
    if (container) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setScrollPosition(container.scrollLeft + scrollAmount);
    }
  };

  if (loading) {
    return null;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">
            <FaEye className="me-2 text-primary" />
            Sản phẩm đã xem gần đây
          </h5>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-primary btn-sm rounded-circle"
              style={{ width: '35px', height: '35px' }}
              onClick={() => scrollContainer('left')}
            >
              <FaChevronLeft />
            </button>
            <button 
              className="btn btn-outline-primary btn-sm rounded-circle"
              style={{ width: '35px', height: '35px' }}
              onClick={() => scrollContainer('right')}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div 
          id="recently-viewed-container"
          className="d-flex gap-3 overflow-auto pb-2"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {products.map((product) => (
            <div 
              key={product.id} 
              className="flex-shrink-0"
              style={{ width: '180px' }}
            >
              <div 
                className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden"
                style={{ transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Link to={`/product/${product.id}`}>
                  <div 
                    className="bg-white d-flex align-items-center justify-content-center"
                    style={{ height: '150px', overflow: 'hidden' }}
                  >
                    <img
                      src={product.imageUrl || '/no-image.jpg'}
                      alt={product.name}
                      className="img-fluid p-2"
                      style={{ maxHeight: '130px', objectFit: 'contain' }}
                    />
                  </div>
                </Link>
                <div className="card-body p-2">
                  <Link to={`/product/${product.id}`} className="text-decoration-none">
                    <h6 
                      className="card-title mb-1 text-dark"
                      style={{ 
                        fontSize: '0.8rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.3'
                      }}
                    >
                      {product.name}
                    </h6>
                  </Link>
                  <div className="text-primary fw-bold" style={{ fontSize: '0.85rem' }}>
                    {money(product.price)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        #recently-viewed-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
