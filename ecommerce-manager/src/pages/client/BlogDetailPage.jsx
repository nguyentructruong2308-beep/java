import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUser, faArrowLeft, faChevronRight, faShareAlt } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import API from '../../api/api';
import { Spinner, Container, Badge, Row, Col } from 'react-bootstrap';

const BlogDetailPage = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentBlogs, setRecentBlogs] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        AOS.init({ duration: 1000, once: true });
        
        const fetchData = async () => {
            try {
                setLoading(true);
                const [blogRes, recentRes] = await Promise.all([
                    API.get(`/blogs/${id}`),
                    API.get('/blogs?size=3')
                ]);
                setBlog(blogRes.data);
                setRecentBlogs(recentRes.data.content.filter(b => b.id !== parseInt(id)));
            } catch (error) {
                console.error("Lỗi tải chi tiết bài viết:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const getImg = (url) => {
        if (!url) return "https://images.unsplash.com/photo-1549395156-e0c1fe6fc7a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
        if (url.startsWith("http")) return url;
        return `${API.defaults.baseURL}/files/download/${url}`;
    };

    if (loading) return (
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Đang mở trang sách mới...</p>
        </div>
    );

    if (!blog) return (
        <Container className="py-5 text-center">
            <h2>Bài viết không tồn tại</h2>
            <Link to="/blog" className="btn btn-primary rounded-pill px-4 mt-3">
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Quay lại danh sách
            </Link>
        </Container>
    );

    return (
        <div className="blog-detail-page" style={{ background: '#fff' }}>
            {/* Header / Hero */}
            <div style={{ position: 'relative', height: '500px', overflow: 'hidden' }}>
                <img 
                    src={getImg(blog.imageUrl)} 
                    alt={blog.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)' }} 
                />
                <div style={{ 
                    position: 'absolute', bottom: '0', left: '0', right: '0', padding: '100px 0 60px', 
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' 
                }}>
                    <Container>
                        <Badge bg="primary" className="mb-3 px-3 py-2 rounded-pill shadow-sm" style={{ fontSize: '0.9rem' }}>
                            {blog.category}
                        </Badge>
                        <h1 data-aos="fade-up" style={{ color: '#fff', fontSize: '3.5rem', fontWeight: '800', maxWidth: '900px', lineHeight: '1.2' }}>
                            {blog.title}
                        </h1>
                    </Container>
                </div>
            </div>

            <Container className="py-5">
                <Row>
                    {/* Main Content */}
                    <Col lg={8}>
                        <div className="d-flex align-items-center gap-4 py-3 border-bottom mb-4 text-muted small">
                            <div className="d-flex align-items-center gap-2">
                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                    <FontAwesomeIcon icon={faUser} className="text-primary" />
                                </div>
                                <span>Tác giả: <strong>{blog.author}</strong></span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-primary" />
                                <span>Ngày đăng: <strong>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</strong></span>
                            </div>
                        </div>

                        <div 
                            className="blog-content mb-5" 
                            data-aos="fade-up"
                            style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#444', textAlign: 'justify' }}
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />

                        {/* Social Share */}
                        <div className="d-flex align-items-center gap-3 p-4 bg-light rounded-4 mb-5 border">
                            <span className="fw-bold"><FontAwesomeIcon icon={faShareAlt} className="me-2" /> Chia sẻ bài viết:</span>
                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-primary rounded-circle" style={{ width: '40px', height: '40px', padding: '0' }}><FontAwesomeIcon icon={faFacebook} /></button>
                                <button className="btn btn-outline-info rounded-circle" style={{ width: '40px', height: '40px', padding: '0' }}><FontAwesomeIcon icon={faTwitter} /></button>
                                <button className="btn btn-outline-secondary rounded-circle" style={{ width: '40px', height: '40px', padding: '0' }}><FontAwesomeIcon icon={faLinkedin} /></button>
                            </div>
                        </div>
                        
                        <Link to="/blog" className="btn btn-outline-dark rounded-pill px-4 mb-5">
                            <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Quay lại danh sách bài viết
                        </Link>
                    </Col>

                    {/* Sidebar */}
                    <Col lg={4}>
                        <div className="ps-lg-4">
                            <div className="mb-5 p-4 rounded-4 bg-light border shadow-sm">
                                <h5 className="fw-bold mb-4 border-bottom pb-2">Bài viết mới nhất</h5>
                                <div className="d-flex flex-column gap-4">
                                    {recentBlogs.map(post => (
                                        <Link key={post.id} to={`/blog/${post.id}`} className="text-decoration-none group">
                                            <div className="d-flex gap-3">
                                                <img 
                                                    src={getImg(post.imageUrl)} 
                                                    alt={post.title} 
                                                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }} 
                                                />
                                                <div>
                                                    <h6 className="fw-bold text-dark mb-1 line-clamp-2" style={{ fontSize: '0.95rem' }}>{post.title}</h6>
                                                    <small className="text-muted">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</small>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 rounded-4 bg-primary text-white text-center shadow">
                                <h4 className="fw-bold mb-3">Tham gia cộng đồng</h4>
                                <p className="small mb-4">Nhận ngay thông báo về các ưu đãi mới nhất và hương vị kem độc quyền.</p>
                                <div className="d-grid">
                                    <button className="btn btn-light rounded-pill fw-bold">Đăng ký ngay</button>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default BlogDetailPage;
