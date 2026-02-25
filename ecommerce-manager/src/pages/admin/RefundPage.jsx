import React, { useEffect, useState } from 'react';
import API from '../../api/api';
import { confirmSwal, successSwal, errorSwal } from "../../utils/swal";
import { Table, Badge, Button, Modal, Form, Spinner, Alert, Card, Container, Row, Col } from 'react-bootstrap';
import { FaUndo, FaUser, FaBox, FaSyncAlt, FaClipboardList, FaCheckCircle } from 'react-icons/fa';

export default function RefundPage() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const statusOptions = ['PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED'];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'PROCESSING': return 'primary';
      case 'COMPLETED': return 'success';
      case 'REJECTED': return 'danger';
      default: return 'secondary';
    }
  };

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const res = await API.get('/refunds');
      setRefunds(res.data.content || []);
    } catch (err) {
      setError('Không thể tải danh sách yêu cầu hoàn tiền.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const openManageModal = (refund) => {
    setSelectedRefund(refund);
    setNewStatus(refund.status);
    setAdminNotes(refund.adminNotes || '');
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRefund) return;
    try {
      await API.put(`/refunds/${selectedRefund.id}/status?status=${newStatus}`, { adminNotes });
      setShowModal(false);
      fetchRefunds();
      successSwal("Đã cập nhật!", `Yêu cầu hoàn tiền #${selectedRefund.id} đã được chuyển trạng thái sang ${newStatus}.`);
    } catch (err) {
      errorSwal("Thất bại!", 'Cập nhật trạng thái thất bại: ' + (err.response?.data?.message || 'Lỗi server'));
    }
  };
  
  const money = (v) => Number(v)?.toLocaleString('vi-VN') || '0';

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }} className="pb-5 text-dark">
      <Container fluid="lg" className="py-4">
        
        {/* HEADER SECTION */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <h4 className="fw-bolder text-dark mb-1">Quản lý Hoàn tiền</h4>
            <p className="text-muted mb-0 small">Xử lý các yêu cầu trả hàng và hoàn tiền từ khách hàng</p>
          </div>
          <div className="mt-3 mt-md-0">
            <Button variant="white" className="shadow-sm bg-white border-0 text-primary fw-bold" onClick={fetchRefunds}>
              <FaSyncAlt className={`me-2 ${loading ? 'fa-spin' : ''}`} /> Làm mới dữ liệu
            </Button>
          </div>
        </div>

        {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}

        {/* MAIN TABLE CARD */}
        <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Card.Body className="p-0">
            <Table hover responsive className="align-middle mb-0">
              <thead className="bg-light text-muted uppercase small fw-bold">
                <tr>
                  <th className="px-4 py-3 border-0">Yêu cầu</th>
                  <th className="border-0">Đơn hàng</th>
                  <th className="border-0">Khách hàng</th>
                  <th className="border-0">Số tiền</th>
                  <th className="border-0">Trạng thái</th>
                  <th className="border-0">Ngày tạo</th>
                  <th className="border-0 text-end px-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                      Đang tải danh sách...
                    </td>
                  </tr>
                ) : refunds.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">Chưa có yêu cầu hoàn tiền nào</td>
                  </tr>
                ) : (
                  refunds.map((refund) => (
                    <tr key={refund.id}>
                      <td className="px-4 fw-bold text-primary">#{refund.id}</td>
                      <td className="fw-bold">#{refund.orderId}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-light p-2 me-2 text-secondary">
                            <FaUser size={12} />
                          </div>
                          <span className="fw-bold">{refund.userName}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-danger fw-bold">{money(refund.totalRefundAmount)} ₫</span>
                      </td>
                      <td>
                        <Badge bg={getStatusVariant(refund.status)} className="fw-normal px-2 py-1 bg-opacity-10 text-dark border">
                           {refund.status}
                        </Badge>
                      </td>
                      <td className="text-muted small">
                        {new Date(refund.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="text-end px-4">
                        <Button variant="light" size="sm" className="text-primary shadow-sm fw-bold border" onClick={() => openManageModal(refund)}>
                          Quản lý
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      {/* Modal Quản lý */}
      {selectedRefund && (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static">
          <Modal.Header closeButton className="border-0 px-4 pt-4">
            <Modal.Title className="fw-bold d-flex align-items-center gap-2">
              <FaUndo className="text-primary" /> Xử lý Hoàn tiền #{selectedRefund.id}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4">
            <Row className="mb-4 p-3 bg-light rounded-3 mx-0">
                <Col xs={6} className="mb-2">
                    <small className="text-muted d-block">Đơn hàng</small>
                    <span className="fw-bold">#{selectedRefund.orderId}</span>
                </Col>
                <Col xs={6} className="mb-2 text-end">
                    <small className="text-muted d-block">Khách hàng</small>
                    <span className="fw-bold">{selectedRefund.userName}</span>
                </Col>
                <Col xs={12}>
                    <small className="text-muted d-block">Lý do hoàn tiền</small>
                    <p className="mb-0 italic">"{selectedRefund.reason}"</p>
                </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Cập nhật trạng thái</Form.Label>
              <Form.Select 
                className="bg-white border-1 shadow-none py-2"
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label className="small fw-bold">Ghi chú của Admin</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                className="bg-white border-1 shadow-none"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Nhập lý do chấp nhận hoặc từ chối..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 px-4 pb-4">
            <Button variant="light" className="fw-bold px-4" onClick={() => setShowModal(false)}>Huỷ</Button>
            <Button variant="primary" className="fw-bold px-4 shadow-sm" onClick={handleUpdateStatus}>
              <FaCheckCircle className="me-2" /> Lưu thay đổi
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}