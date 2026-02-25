import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Badge, Modal } from 'react-bootstrap';
import { FaTrash, FaEye, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../api/api';

const ContactManagementPage = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const res = await API.get('/contacts/admin/all');
            setMessages(res.data.content);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách liên hệ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await API.put(`/contacts/admin/${id}/read`);
            toast.success('Đã đánh dấu là đã đọc');
            fetchMessages();
        } catch (error) {
            toast.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thư liên hệ này?')) {
            try {
                await API.delete(`/contacts/admin/${id}`);
                toast.success('Đã xóa thư liên hệ');
                fetchMessages();
            } catch (error) {
                toast.error('Lỗi khi xóa thư');
            }
        }
    };

    const handleViewDetails = (message) => {
        setSelectedMessage(message);
        setShowModal(true);
        if (!message.isRead) {
            handleMarkAsRead(message.id);
        }
    };

    return (
        <div className="p-4 bg-white rounded shadow-sm">
            <h2 className="mb-4 fw-bold">Quản lý Liên hệ</h2>
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <Table responsive hover className="align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Khách hàng</th>
                            <th>Liên hệ</th>
                            <th>Chủ đề</th>
                            <th>Ngày gửi</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {messages.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-muted">Chưa có lời nhắn nào.</td>
                            </tr>
                        ) : (
                            messages.map((m) => (
                                <tr key={m.id} style={{ fontWeight: m.isRead ? 'normal' : 'bold' }}>
                                    <td>{m.name}</td>
                                    <td>
                                        <div className="small">{m.email}</div>
                                        <div className="text-muted small">{m.phone}</div>
                                    </td>
                                    <td>{m.subject}</td>
                                    <td>{new Date(m.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        {m.isRead ? (
                                            <Badge bg="success">Đã xem</Badge>
                                        ) : (
                                            <Badge bg="danger">Tin mới</Badge>
                                        )}
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <Button variant="outline-primary" size="sm" onClick={() => handleViewDetails(m)}>
                                                <FaEye />
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(m.id)}>
                                                <FaTrash />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}

            {/* View Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Chi tiết Lời nhắn</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedMessage && (
                        <div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="text-muted small text-uppercase fw-bold">Từ</label>
                                    <p className="mb-0">{selectedMessage.name}</p>
                                    <p className="mb-0">{selectedMessage.email}</p>
                                    <p className="mb-0">{selectedMessage.phone}</p>
                                </div>
                                <div className="col-md-6 text-md-end">
                                    <label className="text-muted small text-uppercase fw-bold">Ngày nhận</label>
                                    <p>{new Date(selectedMessage.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="text-muted small text-uppercase fw-bold">Chủ đề</label>
                                <p className="fw-bold">{selectedMessage.subject}</p>
                            </div>
                            <div className="p-3 bg-light rounded border">
                                <label className="text-muted small text-uppercase fw-bold d-block mb-2">Lời nhắn</label>
                                <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{selectedMessage.message}</p>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ContactManagementPage;
