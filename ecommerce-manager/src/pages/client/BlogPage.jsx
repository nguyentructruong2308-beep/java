import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUser, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import API from '../../api/api';
import { Spinner } from 'react-bootstrap';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await API.get('/blogs');
        setBlogs(res.data.content);
      } catch (error) {
        console.error("Lỗi tải bài viết:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const getImg = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1549395156-e0c1fe6fc7a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
    if (url.startsWith("http")) return url;
    return `${API.defaults.baseURL}/files/download/${url}`;
  };


  return (
    <div className="blog-page" style={{ background: '#fcfcfc' }}>
      {/* Blog Intro */}
      <section style={{ padding: '80px 20px', textAlign: 'center', background: '#fff' }}>
        <div className="container">
          <h1 data-aos="fade-down" style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '20px', color: '#333' }}>Bài Viết & Tin Tức</h1>
          <p data-aos="fade-up" style={{ fontSize: '1.2rem', color: '#666', maxWidth: '700px', margin: '0 auto' }}>
            Nơi chia sẻ những câu chuyện về thế giới kem đầy màu sắc, kiến thức dinh dưỡng và các sự kiện mới nhất từ ICREAM.
          </p>
        </div>
      </section>

      {/* Blog Listing */}
      <section style={{ padding: '40px 20px 100px' }}>
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Đang tải câu chuyện của chúng tôi...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">Chưa có bài viết nào được đăng.</p>
            </div>
          ) : (
            <div className="blog-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: '40px' 
            }}>
              {blogs.map((post, idx) => (
                <article key={post.id} data-aos="fade-up" data-aos-delay={idx * 100} style={{
                  background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.06)', 
                  transition: '0.4s', border: '1px solid #f0f0f0'
                }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <Link to={`/blog/${post.id}`} style={{ display: 'block', height: '230px', overflow: 'hidden' }}>
                    <img src={getImg(post.imageUrl)} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.5s' }} onMouseEnter={e => e.target.style.transform = 'scale(1.1)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                    <span style={{ 
                      position: 'absolute', top: '20px', left: '20px', background: '#ff6b6b', color: '#fff', 
                      padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 2
                    }}>{post.category}</span>
                  </Link>
                  <div style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#888', marginBottom: '15px' }}>
                      <span><FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '5px' }} /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span><FontAwesomeIcon icon={faUser} style={{ marginRight: '5px' }} /> {post.author}</span>
                    </div>
                    <Link to={`/blog/${post.id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '15px', lineHeight: '1.4', color: '#333', transition: '0.3s' }} onMouseEnter={e => e.target.style.color = '#ff6b6b'} onMouseLeave={e => e.target.style.color = '#333'}>
                        {post.title}
                      </h3>
                    </Link>
                    <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>{post.excerpt}</p>
                    <Link to={`/blog/${post.id}`} style={{ 
                      textDecoration: 'none', color: '#ff6b6b', fontWeight: 'bold', cursor: 'pointer', 
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '0', fontSize: '1rem' 
                    }}>
                      Đọc thêm <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '0.8rem' }} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ padding: '80px 20px', background: '#333', color: '#fff', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: '15px' }}>Đừng Bỏ Lỡ Những Câu Chuyện Mới</h2>
          <p style={{ color: '#aaa', marginBottom: '30px' }}>Đăng ký nhận bản tin để cập nhật những hương vị mới nhất và ưu đãi đặc quyền.</p>
          <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', gap: '10px' }}>
            <input type="email" placeholder="Email của bạn..." style={{ flex: 1, padding: '15px 25px', borderRadius: '30px', border: 'none' }} />
            <button style={{ background: '#ff6b6b', color: '#fff', border: 'none', padding: '0 30px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}>Đăng ký</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
