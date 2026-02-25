import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export default function OrderSuccessPage() {
  const { orderId } = useParams(); // Lấy ID đơn hàng từ URL

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="text-center shadow-sm">
            <Card.Body className="p-5">
              <FontAwesomeIcon icon={faCheckCircle} className="text-success mb-3" style={{ fontSize: '5rem' }} />
              <h1 className="mb-3">Đặt hàng thành công!</h1>
              <p className="text-muted">
                Cảm ơn bạn đã mua sắm. Đơn hàng của bạn với mã <strong>#{orderId}</strong> đã được ghi nhận.
                Chúng tôi sẽ liên hệ với bạn để xác nhận trong thời gian sớm nhất.
              </p>
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