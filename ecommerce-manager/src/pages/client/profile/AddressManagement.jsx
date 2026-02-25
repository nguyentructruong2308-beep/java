import { useState, useEffect } from 'react';
import { Card, Button, ListGroup, Modal, Form, Spinner, Alert, Badge, Row, Col } from 'react-bootstrap';
import API from '../../../api/api';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { confirmSwal, successSwal, errorSwal } from '../../../utils/swal';

export default function AddressManagement() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '', phone: '', street: '', ward: '', district: '', city: '', isDefault: false
  });

  const fetchAddresses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/addresses');
      setAddresses(res.data);
    } catch (err) {
      setError('Không thể tải sổ địa chỉ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleShowModal = (address = null) => {
    if (address) {
      setIsEditing(true);
      setSelectedAddressId(address.id);
      setFormData(address);
    } else {
      setIsEditing(false);
      setSelectedAddressId(null);
      setFormData({ fullName: '', phone: '', street: '', ward: '', district: '', city: '', isDefault: false });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.put(`/addresses/${selectedAddressId}`, formData);
      } else {
        await API.post('/addresses', formData);
      }
      handleCloseModal();
      fetchAddresses();
      successSwal("Thành công!", isEditing ? "Địa chỉ đã được cập nhật." : "Địa chỉ mới đã được thêm vào sổ.");
    } catch (err) {
      errorSwal("Lỗi!", err.response?.data?.message || 'Không thể lưu địa chỉ vào lúc này.');
    }
  };

  const handleDelete = async (addressId) => {
    const result = await confirmSwal("Xóa địa chỉ?", "Bạn có chắc chắn muốn gỡ bỏ địa chỉ này khỏi sổ địa chỉ?");
    if (result.isConfirmed) {
      try {
        await API.delete(`/addresses/${addressId}`);
        fetchAddresses();
        successSwal("Đã xóa!", "Địa chỉ đã được loại bỏ.");
      } catch (err) {
         errorSwal("Lỗi!", err.response?.data?.message || 'Không thể xoá địa chỉ.');
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
        await API.put(`/addresses/${addressId}/default`);
        fetchAddresses();
        successSwal("Cập nhật!", "Địa chỉ này đã được đặt làm mặc định.");
    } catch (err) {
        errorSwal("Lỗi!", 'Không thể đặt địa chỉ này làm mặc định.');
    }
  };

  return (
    <>
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title className="mb-0">Sổ địa chỉ</Card.Title>
            <Button variant="primary" size="sm" onClick={() => handleShowModal()}>
              <FaPlus className="me-2" /> Thêm địa chỉ mới
            </Button>
          </div>
          <hr />
          {loading && <div className="text-center"><Spinner animation="border" /></div>}
          {error && <Alert variant="danger">{error}</Alert>}
          {!loading && addresses.length === 0 && <Alert variant="info">Bạn chưa có địa chỉ nào.</Alert>}
          
          <ListGroup variant="flush">
            {addresses.map(addr => (
              <ListGroup.Item key={addr.id} className="p-3">
                <div className="d-flex justify-content-between">
                  <div>
                    <strong className="d-block">{addr.fullName} {addr.isDefault && <Badge bg="success" className="ms-2">Mặc định</Badge>}</strong>
                    <span className="d-block text-muted">{addr.phone}</span>
                    <span className="d-block text-muted">{`${addr.street}, ${addr.ward}, ${addr.district}, ${addr.city}`}</span>
                  </div>
                  <div className="flex-shrink-0">
                    <Button variant="light" size="sm" className="me-2" onClick={() => handleShowModal(addr)}><FaEdit /></Button>
                    {!addr.isDefault && <Button variant="light" size="sm" onClick={() => handleDelete(addr.id)}><FaTrash /></Button>}
                  </div>
                </div>
                {!addr.isDefault && (
                    <Button variant="link" size="sm" className="p-0 mt-2" onClick={() => handleSetDefault(addr.id)}>
                        Đặt làm mặc định
                    </Button>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Họ và tên</Form.Label>
              <Form.Control type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ (số nhà, tên đường)</Form.Label>
              <Form.Control type="text" name="street" value={formData.street} onChange={handleChange} required />
            </Form.Group>
            <Row>
              <Col><Form.Group className="mb-3"><Form.Label>Phường/Xã</Form.Label><Form.Control type="text" name="ward" value={formData.ward} onChange={handleChange} required /></Form.Group></Col>
              <Col><Form.Group className="mb-3"><Form.Label>Quận/Huyện</Form.Label><Form.Control type="text" name="district" value={formData.district} onChange={handleChange} required /></Form.Group></Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Tỉnh/Thành phố</Form.Label>
              <Form.Control type="text" name="city" value={formData.city} onChange={handleChange} required />
            </Form.Group>
            <Form.Check type="switch" name="isDefault" label="Đặt làm địa chỉ mặc định" checked={formData.isDefault} onChange={handleChange} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Huỷ</Button>
            <Button variant="primary" type="submit">Lưu</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}