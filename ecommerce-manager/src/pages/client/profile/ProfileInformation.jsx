import React, { useState, useEffect } from "react";
// Thêm Modal từ react-bootstrap
import { Form, Button, Row, Col, Card, Spinner, Alert, Modal } from "react-bootstrap";
import API from "../../../api/api";
import useAuth from "../../../hooks/useAuth";
import { successSwal } from "../../../utils/swal";

export default function ProfileInformation() {
  // Thêm 'logout' từ hook authentication của bạn
  const { user, login, logout } = useAuth(); 
  
  // State cho form thông tin cá nhân (giữ nguyên)
  const [formData, setFormData] = useState({ firstName: "", lastName: "", phone: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // === State MỚI cho chức năng đổi Email ===
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailFormData, setEmailFormData] = useState({ newEmail: "", currentPassword: "" });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  // ==========================================

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    // ... Logic này giữ nguyên, không thay đổi ...
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    // ... Logic này giữ nguyên, không thay đổi ...
    e.preventDefault();
    if (error) return; 
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Tên và họ là bắt buộc.");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await API.put("/users/me", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
      });
      login(res.data);
      setSuccess("Cập nhật thông tin thành công!");
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // === HÀM MỚI để xử lý việc thay đổi email trong modal ===
  const handleEmailFormChange = (e) => {
    const { name, value } = e.target;
    setEmailFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailError("");

    try {
      await API.put("/users/me/change-email", emailFormData);
      
      // Quan trọng: Sau khi đổi email thành công, thông báo và bắt người dùng đăng nhập lại
      await successSwal("Đổi email thành công!", "Bạn sẽ được đăng xuất để bảo mật. Vui lòng đăng nhập lại bằng email mới.");
      logout(); // Gọi hàm logout từ useAuth hook

    } catch (err) {
      setEmailError(err.response?.data?.message || "Đã xảy ra lỗi không xác định.");
    } finally {
      setEmailLoading(false);
    }
  };
  // ========================================================

  return (
    <>
      <Card>
        <Card.Body>
          <Card.Title>Thông tin cá nhân</Card.Title>
          <hr />
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          {/* Form cập nhật thông tin cá nhân (không thay đổi) */}
          <Form noValidate onSubmit={handleSubmit}>
            {/* ... Các Row và Col cho First Name, Last Name, Phone ... */}
            <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formFirstName">
                    <Form.Label>Tên <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formLastName">
                    <Form.Label>Họ <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                  </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="formEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" name="email" value={formData.email} readOnly disabled />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="formPhone">
                        <Form.Label>Số điện thoại</Form.Label>
                        <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                    </Form.Group>
                </Col>
            </Row>
            <div className="d-flex justify-content-between">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <><Spinner as="span" animation="border" size="sm" /> Đang lưu...</> : "Lưu thay đổi"}
              </Button>
              {/* [MỚI] Nút để mở modal đổi email */}
              <Button variant="outline-secondary" onClick={() => setShowEmailModal(true)}>
                Đổi Email
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* === [MỚI] Modal để người dùng nhập thông tin đổi email === */}
      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Thay đổi địa chỉ Email</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEmailSubmit}>
          <Modal.Body>
            {emailError && <Alert variant="danger">{emailError}</Alert>}
            <p className="text-muted">
              Email hiện tại của bạn là: <strong>{user?.email}</strong>
            </p>
            <Form.Group className="mb-3" controlId="formNewEmail">
              <Form.Label>Email mới</Form.Label>
              <Form.Control
                type="email"
                name="newEmail"
                value={emailFormData.newEmail}
                onChange={handleEmailFormChange}
                required
                placeholder="Nhập địa chỉ email mới"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formCurrentPassword">
              <Form.Label>Mật khẩu hiện tại</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={emailFormData.currentPassword}
                onChange={handleEmailFormChange}
                required
                placeholder="Nhập mật khẩu để xác nhận"
              />
              <Form.Text className="text-muted">
                Bạn cần nhập mật khẩu hiện tại để hoàn tất thay đổi.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={emailLoading}>
              {emailLoading ? <><Spinner as="span" animation="border" size="sm" /> Đang xử lý...</> : "Xác nhận đổi Email"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}