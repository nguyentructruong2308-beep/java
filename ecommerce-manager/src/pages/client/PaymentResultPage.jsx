import React, { useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

import API from '../../api/api';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toastShownRef = useRef(false); // Dùng ref để đảm bảo toast chỉ hiện 1 lần

  const status = searchParams.get('status');
  const message = searchParams.get('message');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Chỉ hiển thị toast nếu có message và chưa được hiển thị trước đó
    if (message && !toastShownRef.current) {
      if (status === 'success') {
        toast.success(message);
      } else {
        toast.error(message);
      }
      toastShownRef.current = true; // Đánh dấu là đã hiển thị
    }


    // Nếu không có thông tin gì, chuyển về trang chủ sau 3 giây
    if (!status || !message) {
      setTimeout(() => navigate('/'), 3000);
    }

  }, [status, message, navigate]);

  if (!status || !message) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Đang xử lý, vui lòng chờ...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="text-center shadow-sm">
            <Card.Body className="p-5">
              {status === 'success' ? (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="text-success mb-3" style={{ fontSize: '5rem' }} />
                  <h1 className="mb-3">Thanh toán thành công!</h1>
                  <p className="text-muted">
                    Cảm ơn bạn đã mua sắm. Đơn hàng <strong>#{orderId}</strong> của bạn đã được thanh toán.
                  </p>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTimesCircle} className="text-danger mb-3" style={{ fontSize: '5rem' }} />
                  <h1 className="mb-3">Thanh toán thất bại</h1>
                  <p className="text-muted">
                    {message} Vui lòng thử lại hoặc liên hệ bộ phận hỗ trợ.
                  </p>
                </>
              )}
              <div className="mt-4">
                <Link to="/" className="btn btn-primary me-2">
                  Tiếp tục mua sắm
                </Link>
                <Link to="/profile" className="btn btn-outline-secondary">
                  Xem lịch sử đơn hàng
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}