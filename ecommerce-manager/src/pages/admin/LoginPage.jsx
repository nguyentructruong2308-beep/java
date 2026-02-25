import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import useAuth from "../../hooks/useAuth";
import { Spinner, Form, Button, Card, Container, Row, Col, Alert, InputGroup } from "react-bootstrap";
import { FaLock, FaEnvelope } from "react-icons/fa"; // Thêm icon cho đồng bộ

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); 
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); 

    try {
      const res = await API.post("/auth/login", form);
      const { token, user } = res.data;

      // === BƯỚC KIỂM TRA QUAN TRỌNG ===
      if (user && user.role !== 'ADMIN') {
        setError("Tài khoản của bạn không có quyền truy cập vào trang quản trị.");
        setLoading(false);
        return; 
      }

      if (!token || !user) {
        setError("Phản hồi đăng nhập không hợp lệ!");
        setLoading(false);
        return;
      }
      
      adminLogin(res.data); 
      navigate("/admin/dashboard");

    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setError("Sai email hoặc mật khẩu!");
      } else {
        setError("Lỗi hệ thống, vui lòng thử lại sau!");
      }
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }} className="d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={8} md={6} lg={4}>
            {/* Giữ nguyên cấu trúc, chỉnh style đồng bộ Dashboard */}
            <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
              <Card.Body className="p-4 p-sm-5">
                <div className="text-center mb-4">
                  <div className="bg-primary bg-opacity-10 d-inline-block p-3 rounded-circle mb-3">
                    <img
                      src="https://getbootstrap.com/docs/5.3/assets/brand/bootstrap-logo.svg"
                      alt="Logo"
                      style={{ width: "40px", height: "40px" }}
                    />
                  </div>
                  <h4 className="fw-bolder text-dark mb-1">Hệ thống Quản trị</h4>
                  <p className="text-muted small">Vui lòng đăng nhập để tiếp tục</p>
                </div>

                {error && (
                  <Alert variant="danger" className="py-2 border-0 small shadow-sm mb-4">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label className="small fw-bold text-muted">Địa chỉ Email</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-0 text-muted">
                        <FaEnvelope size={14} />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        placeholder="admin@example.com"
                        className="bg-light border-0 shadow-none"
                        style={{ padding: '0.6rem' }}
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        disabled={loading}
                        autoFocus
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formPassword">
                    <Form.Label className="small fw-bold text-muted">Mật khẩu</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-0 text-muted">
                        <FaLock size={14} />
                      </InputGroup.Text>
                      <Form.Control
                        type="password"
                        placeholder="••••••••"
                        className="bg-light border-0 shadow-none"
                        style={{ padding: '0.6rem' }}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </InputGroup>
                  </Form.Group>

                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading} 
                      size="lg"
                      className="fw-bold shadow-sm"
                      style={{ borderRadius: '10px', padding: '0.8rem' }}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Đang xác thực...
                        </>
                      ) : "Đăng nhập hệ thống"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
            
            <div className="text-center mt-4">
              <p className="text-muted small">
                &copy; {new Date().getFullYear()} Admin Dashboard. All rights reserved.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}