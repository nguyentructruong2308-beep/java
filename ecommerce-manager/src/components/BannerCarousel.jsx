import React, { useEffect, useState } from 'react';
import { Carousel, Spinner, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import API from '../api/api';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function BannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveBanners = async () => {
      try {
        const res = await API.get('/promotions/active');
        console.log('--- DEBUG BANNER DATA ---', res.data);
        
        // Vì /promotions/active đã được backend lọc sẵn isActive=true
        // Ta chỉ cần set thẳng vào state
        const rawData = Array.isArray(res.data) ? res.data : (res.data.content || []);
        setBanners(rawData);
      } catch (err) {
        console.error('Lỗi tải banner:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveBanners();
  }, []);

  useEffect(() => {
    // Refresh AOS để các phần tử mới render nhận được hiệu ứng
    AOS.refresh();
  }, [banners]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '520px', background: '#f8f9fa' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Nếu không có banner nào hoạt động, không hiển thị gì cả hoặc hiển thị banner mặc định
  if (banners.length === 0) {
    return null; 
  }

  return (
    <Carousel fade controls={banners.length > 1} indicators={banners.length > 1} interval={5000} pause="hover">
      {banners.map((banner) => (
        <Carousel.Item key={banner.id}>
          <div
            className="home-banner"
            style={{
              backgroundImage: `url(${banner.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: '100%',
              height: '520px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <div
              className="banner-overlay"
              style={{
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                color: '#fff',
                padding: '0 20px'
              }}
            >
              <h1 
                data-aos="fade-down" 
                data-aos-duration="1000"
                style={{ textShadow: '0 4px 12px rgba(0,0,0,0.3)', fontWeight: '800' }}
              >
                {banner.title}
              </h1>
              {banner.targetUrl && (
                <div data-aos="fade-up" data-aos-delay="300" className="mt-4">
                  <Link 
                    to={banner.targetUrl} 
                    className="btn btn-lg px-5 py-3 rounded-pill fw-bold shadow-lg"
                    style={{ 
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ff9a9e 100%)',
                        border: 'none',
                        color: 'white',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    KHÁM PHÁ NGAY
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}
