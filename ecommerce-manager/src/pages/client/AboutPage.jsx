import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIceCream, faHeart, faLeaf, faAward, faUsers, faStore } from '@fortawesome/free-solid-svg-icons';

const AboutPage = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero" style={{
        background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
        padding: '100px 20px',
        textAlign: 'center',
        color: '#fff'
      }}>
        <div className="container">
          <h1 data-aos="fade-down" style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px' }}>
            Về ICREAM
          </h1>
          <p data-aos="fade-up" style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
            Mang đến niềm vui ngọt ngào và những khoảnh khắc tuyệt vời từ những viên kem thủ công chất lượng nhất.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story" style={{ padding: '80px 20px', background: '#fff' }}>
        <div className="container">
          <div className="row align-items-center" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
            <div className="col-md-6" data-aos="fade-right" style={{ flex: '1', minWidth: '300px' }}>
              <h2 style={{ color: '#ff6b6b', marginBottom: '20px' }}>Câu Chuyện Của Chúng Tôi</h2>
              <p style={{ lineHeight: '1.8', color: '#555' }}>
                Bắt đầu từ một cửa hàng nhỏ ven đường vào năm 2010, ICREAM ra đời với niềm đam mê vô tận đối với hương vị kem truyền thống kết hợp cùng sự sáng tạo hiện đại. Chúng tôi tin rằng kem không chỉ là một món tráng miệng, mà là một ngôn ngữ của niềm vui.
              </p>
              <p style={{ lineHeight: '1.8', color: '#555' }}>
                Trải qua hơn 10 năm phát triển, ICREAM đã trở thành điểm đến quen thuộc của những tâm hồn yêu đồ ngọt, nơi mỗi viên kem đều mang trong mình hơi thở của thiên nhiên và tâm huyết của những nghệ nhân làm kem.
              </p>
            </div>
            <div className="col-md-6" data-aos="fade-left" style={{ flex: '1', minWidth: '300px' }}>
              <img 
                src="https://images.unsplash.com/photo-1576506295286-5cda18df43e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                alt="Ice Cream Creation" 
                style={{ width: '100%', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="about-values" style={{ padding: '80px 20px', background: '#f8f9fa' }}>
        <div className="container">
          <h2 className="text-center" data-aos="fade-up" style={{ textAlign: 'center', marginBottom: '50px', color: '#333' }}>Giá Trị Cốt Lõi</h2>
          <div className="values-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '30px' 
          }}>
            <div className="value-card" data-aos="zoom-in" data-aos-delay="100" style={{
              background: '#fff', padding: '30px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }}>
              <FontAwesomeIcon icon={faLeaf} style={{ fontSize: '3rem', color: '#ff6b6b', marginBottom: '20px' }} />
              <h3>Nguyên Liệu Tự Nhiên</h3>
              <p style={{ color: '#777' }}>Sử dụng 100% trái cây tươi và sữa nguyên chất, không chất bảo quản.</p>
            </div>
            <div className="value-card" data-aos="zoom-in" data-aos-delay="200" style={{
              background: '#fff', padding: '30px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }}>
              <FontAwesomeIcon icon={faHeart} style={{ fontSize: '3rem', color: '#ff6b6b', marginBottom: '20px' }} />
              <h3>Tận Tâm Phục Vụ</h3>
              <p style={{ color: '#777' }}>Hết lòng vì khách hàng, cam kết mang lại trải nghiệm tuyệt vời nhất.</p>
            </div>
            <div className="value-card" data-aos="zoom-in" data-aos-delay="300" style={{
              background: '#fff', padding: '30px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }}>
              <FontAwesomeIcon icon={faAward} style={{ fontSize: '3rem', color: '#ff6b6b', marginBottom: '20px' }} />
              <h3>Chất Lượng Vàng</h3>
              <p style={{ color: '#777' }}>Quy trình sản xuất nghiêm ngặt đạt tiêu chuẩn an toàn thực phẩm quốc tế.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers Section */}
      <section className="about-stats" style={{ padding: '80px 20px', background: '#ff6b6b', color: '#fff' }}>
        <div className="container">
          <div className="stats-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '30px',
            textAlign: 'center'
          }}>
            <div data-aos="fade-up" data-aos-delay="100">
              <h2 style={{ fontSize: '3rem', fontWeight: 'bold' }}>50+</h2>
              <p>Hương Vị Kem</p>
            </div>
            <div data-aos="fade-up" data-aos-delay="200">
              <h2 style={{ fontSize: '3rem', fontWeight: 'bold' }}>20+</h2>
              <p>Cửa Hàng Toàn Quốc</p>
            </div>
            <div data-aos="fade-up" data-aos-delay="300">
              <h2 style={{ fontSize: '3rem', fontWeight: 'bold' }}>1M+</h2>
              <p>Khách Hàng Hài Lòng</p>
            </div>
            <div data-aos="fade-up" data-aos-delay="400">
              <h2 style={{ fontSize: '3rem', fontWeight: 'bold' }}>10</h2>
              <p>Giải Thưởng Chất Lượng</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="about-vision" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="container">
          <h2 data-aos="fade-up" style={{ marginBottom: '30px', color: '#333' }}>Tầm Nhìn & Sứ Mệnh</h2>
          <div className="row" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center' }}>
            <div className="col-md-5" data-aos="fade-right" style={{ flex: '1', minWidth: '300px', background: '#fff9f9', padding: '40px', borderRadius: '20px' }}>
              <h3 style={{ color: '#ff6b6b' }}>Sứ Mệnh</h3>
              <p style={{ color: '#555' }}>Góp phần làm phong phú đời sống tinh thần của mọi người thông qua sự ngọt ngào và chỉn chu trong từng sản phẩm.</p>
            </div>
            <div className="col-md-5" data-aos="fade-left" style={{ flex: '1', minWidth: '300px', background: '#f9f9ff', padding: '40px', borderRadius: '20px' }}>
              <h3 style={{ color: '#6b6bff' }}>Tầm Nhìn</h3>
              <p style={{ color: '#555' }}>Trở thành thương hiệu kem thủ công hàng đầu Việt Nam và vươn tầm ra khu vực Đông Nam Á.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
