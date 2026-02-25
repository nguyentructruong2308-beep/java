import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faMapMarkerAlt, faClock, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';
import API from '../../api/api';
import { toast } from 'react-toastify';
import { Spinner } from 'react-bootstrap';

const ContactPage = () => {
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.post('/contacts', formData);
      toast.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
       toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="contact-page">
      {/* Header Banner */}
      <section className="contact-banner" style={{
        background: 'url("https://images.unsplash.com/photo-1516550893923-42d28e5677af?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '120px 20px',
        position: 'relative',
        color: '#fff',
        textAlign: 'center'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 data-aos="fade-down" style={{ fontSize: '3rem', fontWeight: 'bold' }}>Liên Hệ Với Chúng Tôi</h1>
          <p data-aos="fade-up" style={{ fontSize: '1.2rem' }}>Hãy để lại lời nhắn, chúng tôi luôn lắng nghe bạn!</p>
        </div>
      </section>

      {/* Contact Content */}
      <section style={{ padding: '80px 20px' }}>
        <div className="container">
          <div className="row" style={{ display: 'flex', flexWrap: 'wrap', gap: '50px' }}>
            {/* Contact Info */}
            <div className="col-md-5" data-aos="fade-right" style={{ flex: '1', minWidth: '300px' }}>
              <h2 style={{ color: '#ff6b6b', marginBottom: '30px' }}>Thông Tin Liên Hệ</h2>
              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                  <div style={{ width: '50px', height: '50px', background: '#fff0f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff6b6b' }}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </div>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: 'bold' }}>Địa Chỉ</h5>
                    <p style={{ color: '#666' }}>20 Tăng Nhơn Phú, Phước Long B, Thủ Đức, TP. Hồ Chí Minh</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                  <div style={{ width: '50px', height: '50px', background: '#fff0f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff6b6b' }}>
                    <FontAwesomeIcon icon={faPhone} />
                  </div>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: 'bold' }}>Điện Thoại</h5>
                    <p style={{ color: '#666' }}>1900 2812</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                  <div style={{ width: '50px', height: '50px', background: '#fff0f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff6b6b' }}>
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: 'bold' }}>Email</h5>
                    <p style={{ color: '#666' }}>tnicream@gmail.com</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                  <div style={{ width: '50px', height: '50px', background: '#fff0f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff6b6b' }}>
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: 'bold' }}>Giờ Mở Cửa</h5>
                    <p style={{ color: '#666' }}>8:00 AM - 10:00 PM (Hàng ngày)</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h5 style={{ fontWeight: 'bold', marginBottom: '20px' }}>Theo Dõi Chúng Tôi</h5>
                <div style={{ display: 'flex', gap: '15px' }}>
                  {[faFacebook, faInstagram, faTwitter].map((icon, idx) => (
                    <a key={idx} href="#" style={{ 
                      width: '40px', height: '40px', background: '#333', color: '#fff', borderRadius: '50%', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' 
                    }} onMouseEnter={e => e.currentTarget.style.background = '#ff6b6b'} onMouseLeave={e => e.currentTarget.style.background = '#333'}>
                      <FontAwesomeIcon icon={icon} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="col-md-7" data-aos="fade-left" style={{ flex: '1.5', minWidth: '300px', background: '#fff', padding: '40px', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '30px' }}>Gửi Lời Nhắn</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Họ Tên</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} placeholder="Nhập tên của bạn" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} placeholder="Nhập email" />
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Chủ Đề</label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} placeholder="Vấn đề bạn quan tâm" />
                </div>
                <div style={{ marginBottom: '30px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Nội Dung</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', height: '150px' }} placeholder="Nhập nội dung tin nhắn..."></textarea>
                </div>
                <button type="submit" disabled={loading} style={{ 
                  background: '#ff6b6b', color: '#fff', border: 'none', padding: '15px 40px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: '10px' 
                }} onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-3px)')} onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}>
                  {loading ? (
                    <><Spinner size="sm" animation="border" /> Đang gửi...</>
                  ) : (
                    <>Gửi Ngay <FontAwesomeIcon icon={faPaperPlane} /></>
                  )}
                </button>

              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section style={{ height: '450px', background: '#eee' }}>
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.6756976695273!2d106.776602375838!3d10.836109958088998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527063c93202d%3A0xc32242173167b5!2zMjAgVMSDbmcgTmjGoW4gUGjDuiwgUGjGsOG7m2MgTG9uZyBCLCBRdeG6rW4gOSwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5o!5e0!3m2!1svi!2s!4v1705816430314!5m2!1svi!2s" 
          width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"></iframe>
      </section>
    </div>
  );
};

export default ContactPage;
