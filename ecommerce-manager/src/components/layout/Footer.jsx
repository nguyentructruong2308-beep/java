import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faTwitter, faYoutube, faTiktok } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faMapMarkerAlt, faPhone, faIceCream, faPaperPlane, faArrowUp, faStar } from '@fortawesome/free-solid-svg-icons';
import { Button, Form } from 'react-bootstrap';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ marginTop: 'auto', position: 'relative', overflow: 'hidden' }}>
      
      {/* --- PHẦN STYLE CSS NỘI BỘ --- */}
      <style>
        {`
          /* CẤU HÌNH MÀU SẮC CHỦ ĐẠO: HỒNG DÂU */
          :root {
            --pink-primary: #ff758c;
            --pink-secondary: #ff7eb3;
            --bg-gradient: linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%);
            --glass-bg: rgba(255, 255, 255, 0.15);
            --glass-border: rgba(255, 255, 255, 0.3);
            --text-white: #ffffff;
            --text-soft: #ffe3e3;
          }

          .footer-wrapper {
            background: var(--bg-gradient);
            color: var(--text-white);
            position: relative;
            z-index: 10;
            padding-top: 100px; /* Chừa chỗ cho sóng */
          }

          /* 1. HIỆU ỨNG SÓNG KEM TRẮNG (CREAMY WAVES) */
          .wave-box {
            position: absolute;
            top: -1px; /* Đẩy sát lên trên */
            left: 0;
            width: 100%;
            overflow: hidden;
            line-height: 0;
            z-index: 20;
          }
          .wave-svg {
            position: relative;
            display: block;
            width: calc(150% + 1.3px);
            height: 120px;
            animation: waveMove 20s linear infinite;
          }
          .wave-path {
            fill: #ffffff; /* Màu trắng của nền web phía trên */
          }
          .wave-opacity {
            fill: rgba(255, 255, 255, 0.4); /* Lớp sóng mờ phía sau */
            animation: waveMove 15s linear infinite reverse;
          }
          @keyframes waveMove {
            0% { transform: translateX(0); }
            50% { transform: translateX(-25%); }
            100% { transform: translateX(0); }
          }

          /* 2. HIỆU ỨNG HẠT CỐM MÀU (SPRINKLES) */
          .sprinkles-container {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            overflow: hidden;
            pointer-events: none;
            z-index: 1;
          }
          .sprinkle {
            position: absolute;
            width: 8px; height: 8px;
            border-radius: 50%;
            animation: floatUp linear infinite;
            opacity: 0.6;
          }
          /* Màu sắc ngẫu nhiên cho hạt cốm */
          .sp-1 { background: #ffeaa7; left: 10%; animation-duration: 15s; }
          .sp-2 { background: #55efc4; left: 20%; animation-duration: 20s; width: 12px; height: 12px; }
          .sp-3 { background: #fff; left: 35%; animation-duration: 18s; }
          .sp-4 { background: #74b9ff; left: 50%; animation-duration: 25s; width: 10px; height: 10px; }
          .sp-5 { background: #ffeaa7; left: 65%; animation-duration: 14s; }
          .sp-6 { background: #fff; left: 80%; animation-duration: 22s; }
          .sp-7 { background: #55efc4; left: 90%; animation-duration: 16s; }
          
          @keyframes floatUp {
            0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
            20% { opacity: 0.8; }
            80% { opacity: 0.8; }
            100% { transform: translateY(-20px) rotate(360deg); opacity: 0; }
          }

          /* 3. CARD PHA LÊ (GLASSMORPHISM) */
          .glass-card {
            background: var(--glass-bg);
            backdrop-filter: blur(10px);
            border: 1px solid var(--glass-border);
            border-radius: 24px;
            padding: 30px;
            box-shadow: 0 8px 32px 0 rgba(255, 118, 118, 0.25);
            transition: transform 0.3s;
          }
          .glass-card:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.25);
          }

          /* 4. TEXT STYLES */
          .brand-title {
            font-size: 2.2rem;
            font-weight: 800;
            letter-spacing: 2px;
            text-shadow: 2px 2px 0px rgba(0,0,0,0.1);
          }
          .footer-heading {
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1.5rem;
            display: inline-block;
            border-bottom: 2px solid rgba(255,255,255,0.5);
            padding-bottom: 5px;
          }
          
          /* Links */
          .sweet-link {
            color: var(--text-soft);
            text-decoration: none;
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            transition: 0.3s;
            font-weight: 500;
          }
          .sweet-link:hover {
            color: #fff;
            transform: translateX(8px);
            text-shadow: 0 0 10px rgba(255,255,255,0.8);
          }
          .sweet-link svg { transition: 0.3s; width: 15px; }
          .sweet-link:hover svg { transform: rotate(90deg); color: #ffeaa7 !important; }

          /* Social Buttons Trắng */
          .social-white {
            width: 45px; height: 45px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            color: #fff;
            font-size: 1.2rem;
            transition: 0.4s;
            border: 2px solid transparent;
          }
          .social-white:hover {
            background: #fff;
            color: var(--pink-primary);
            transform: translateY(-5px) rotate(15deg);
            box-shadow: 0 10px 20px rgba(0,0,0,0.15);
          }

          /* Input Field */
          .sweet-input {
            background: rgba(255,255,255,0.8) !important;
            border: none;
            border-radius: 50px !important;
            padding: 12px 20px;
            color: var(--pink-primary) !important;
            font-weight: 600;
          }
          .sweet-input::placeholder { color: #ffadbc; }
          .sweet-btn {
            background: #fff !important;
            color: var(--pink-primary) !important;
            border-radius: 50% !important;
            width: 45px; height: 45px;
            border: none;
            position: absolute;
            right: 5px; top: 2px;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            transition: 0.3s;
          }
          .sweet-btn:hover {
            transform: scale(1.1);
            color: #ff9f43 !important;
          }

          /* Back To Top */
          .back-top-btn {
            position: absolute;
            top: -2px;
            left: 50%;
            transform: translateX(-50%);
            background: #fff;
            color: var(--pink-primary);
            width: 50px; height: 50px;
            border-radius: 50%;
            border: none;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            display: flex; align-items: center; justify-content: center;
            z-index: 30;
            transition: 0.4s;
            cursor: pointer;
          }
          .back-top-btn:hover {
            background: #ffeaa7;
            color: #fff;
            top: -35px;
          }
        `}
      </style>

      {/* --- PHẦN CONTENT FOOTER --- */}
      <footer className="footer-wrapper">
        
        {/* WAVE SVG (Sóng kem trắng phía trên) */}
        <div className="wave-box">
            <svg className="wave-svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="wave-path"></path>
                <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="wave-path"></path>
                <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="wave-path"></path>
            </svg>
        </div>

        {/* Nút Back To Top nằm giữa sóng */}
        <button className="back-top-btn" onClick={scrollToTop} title="Lên đầu trang">
            <FontAwesomeIcon icon={faArrowUp} />
        </button>

        {/* Sprinkles (Hạt cốm bay) */}
        <div className="sprinkles-container">
            <div className="sprinkle sp-1"></div>
            <div className="sprinkle sp-2"></div>
            <div className="sprinkle sp-3"></div>
            <div className="sprinkle sp-4"></div>
            <div className="sprinkle sp-5"></div>
            <div className="sprinkle sp-6"></div>
            <div className="sprinkle sp-7"></div>
        </div>

        <div className="container position-relative">
          <div className="row g-5">
            
            {/* CỘT 1: LOGO & GIỚI THIỆU */}
            <div className="col-lg-4 col-md-6">
                <div className="mb-4 d-flex align-items-center">
                     <span className="p-3 bg-white rounded-circle shadow-sm me-3 text-center" style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesomeIcon icon={faIceCream} style={{ color: '#ff758c', fontSize: '1.8rem' }} />
                     </span>
                     <h2 className="brand-title m-0">ICREAM</h2>
                </div>
                <p style={{ lineHeight: '1.8', color: '#ffe3e3', fontSize: '0.95rem' }}>
                    Thế giới kem tươi mát lạnh, ngọt ngào như tình yêu đầu. 
                    <br/>Được làm từ 100% trái cây tự nhiên và sữa tươi nguyên chất.
                </p>
                <div className="d-flex gap-3 mt-4">
                    <a href="#!" className="social-white"><FontAwesomeIcon icon={faFacebookF} /></a>
                    <a href="#!" className="social-white"><FontAwesomeIcon icon={faInstagram} /></a>
                    <a href="#!" className="social-white"><FontAwesomeIcon icon={faTiktok} /></a>
                    <a href="#!" className="social-white"><FontAwesomeIcon icon={faYoutube} /></a>
                </div>
            </div>

            {/* CỘT 2: MENU NGỌT NGÀO */}
            <div className="col-lg-2 col-md-6">
                <h6 className="footer-heading">Thực đơn</h6>
                <div className="d-flex flex-column">
                    <Link to="/category/1" className="sweet-link"><FontAwesomeIcon icon={faStar} className="me-2 text-warning opacity-50"/> Kem Ốc Quế</Link>
                    <Link to="/category/2" className="sweet-link"><FontAwesomeIcon icon={faStar} className="me-2 text-warning opacity-50"/> Kem Ly</Link>
                    <Link to="/category/3" className="sweet-link"><FontAwesomeIcon icon={faStar} className="me-2 text-warning opacity-50"/> Bánh Kem</Link>
                    <Link to="/category/4" className="sweet-link"><FontAwesomeIcon icon={faStar} className="me-2 text-warning opacity-50"/> Smoothie</Link>
                </div>
            </div>

            {/* CỘT 3: HỖ TRỢ */}
            <div className="col-lg-3 col-md-6">
                <h6 className="footer-heading">Liên hệ</h6>
                <ul className="list-unstyled d-flex flex-column gap-3">
                    <li className="d-flex text-soft">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-1 me-3" />
                        <span>20 Tăng Nhơn Phú,<br/>Phước Long B, Thủ Đức, TP.HCM</span>
                    </li>
                    <li className="d-flex align-items-center text-soft">
                        <FontAwesomeIcon icon={faEnvelope} className="me-3" />
                        <span>tnicream@gmail.com</span>
                    </li>
                    <li className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faPhone} className="me-3" />
                        <span className="fw-bold fs-5">1900 2812</span>
                    </li>
                </ul>
            </div>

            {/* CỘT 4: NEWSLETTER GLASS */}
            <div className="col-lg-3 col-md-6">
                <div className="glass-card">
                    <h5 className="fw-bold mb-2">💌 Nhận Voucher</h5>
                    <p className="small mb-4" style={{ color: '#fff' }}>Giảm ngay 20% cho đơn hàng đầu tiên!</p>
                    <Form onSubmit={(e) => e.preventDefault()}>
                        <div className="position-relative">
                            <Form.Control className="sweet-input" placeholder="Email..." />
                            <button className="sweet-btn" type="submit">
                                <FontAwesomeIcon icon={faPaperPlane} />
                            </button>
                        </div>
                    </Form>
                </div>
            </div>

          </div>

          <hr style={{ borderColor: 'rgba(255,255,255,0.3)', marginTop: '3rem' }} />

          <div className="text-center pb-4 small">
             <span style={{ opacity: 0.8 }}>© 2024 <b>ICream Vietnam</b>. All Rights Reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}