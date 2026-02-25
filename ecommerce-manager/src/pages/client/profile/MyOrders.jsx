import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faUser, faCalendarAlt, faCreditCard, faTruck } from '@fortawesome/free-solid-svg-icons';
import { Table, Spinner, Alert, Badge, Card, Button, Modal, Row, Col, Form, Nav, ListGroup } from 'react-bootstrap';
import API from '../../../api/api';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { confirmSwal } from '../../../utils/swal';

// ===================================================================
// MODAL 1: VIẾT ĐÁNH GIÁ SẢN PHẨM
// ===================================================================
const ReviewModal = ({ show, onHide, product, orderId, onReviewSuccess }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleImageChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            if (filesArray.length + images.length > 5) {
                setError("Bạn chỉ có thể tải lên tối đa 5 ảnh.");
                return;
            }
            setImages(prev => [...prev, ...filesArray]);

            const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
            setError('');
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (comment.trim() === "") { setError("Vui lòng nhập bình luận của bạn."); return; }
        setSubmitting(true); setError('');
        const formData = new FormData();
        formData.append('productId', product.productId);
        formData.append('orderId', orderId);
        formData.append('rating', rating);
        formData.append('comment', comment);

        images.forEach((image) => {
            formData.append('images', image);
        });

        try {
            await API.post('/reviews', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success(`Đánh giá sản phẩm "${product.productName}" thành công!`);
            onReviewSuccess();
            onHide();
        } catch (err) {
            setError(err.response?.data?.message || "Gửi đánh giá thất bại.");
        } finally { setSubmitting(false); }
    };

    useEffect(() => {
        if (!show) {
            setTimeout(() => {
                setRating(5);
                setComment('');
                setImages([]);
                setPreviewUrls([]);
                setError('');
            }, 200);
        }
    }, [show]);

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Đánh giá: {product?.productName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger" className="py-2">{error}</Alert>}
                    <Form.Group className="mb-3">
                        <Form.Label>Điểm của bạn</Form.Label>
                        <div>
                            {[...Array(5)].map((_, i) => (
                                <FaStar key={i} color={i < rating ? "#ffc107" : "#e4e5e9"}
                                    style={{ cursor: 'pointer', fontSize: '1.75rem', marginRight: '5px' }}
                                    onClick={() => setRating(i + 1)} />
                            ))}
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Bình luận của bạn</Form.Label>
                        <Form.Control as="textarea" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Ảnh đính kèm (tối đa 5 ảnh)</Form.Label>
                        <Form.Control type="file" accept="image/*" multiple onChange={handleImageChange} disabled={images.length >= 5} />
                        <div className="d-flex flex-wrap gap-2 mt-2">
                            {previewUrls.map((url, index) => (
                                <div key={index} style={{ position: 'relative', width: '60px', height: '60px' }}>
                                    <img src={url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                                    <button type="button" onClick={() => removeImage(index)}
                                        style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>X</button>
                                </div>
                            ))}
                        </div>
                    </Form.Group>
                    <div className="d-grid">
                        <Button variant="primary" type="submit" disabled={submitting}>
                            {submitting ? <Spinner as="span" size="sm" className="me-2" /> : "Gửi đánh giá"}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

// ===================================================================
// MODAL 2: YÊU CẦU TRẢ HÀNG - FIX 400 BAD REQUEST
// ===================================================================
// BƯỚC 1: Sửa component để nhận `orderId` làm prop
const RefundModal = ({ show, onHide, item, orderId, onRefundSuccess }) => {
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const maxRefundable = item.quantity - (item.refundedQuantity || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reason.trim()) {
            setError("Vui lòng nhập lý do.");
            return;
        }
        if (quantity < 1 || quantity > maxRefundable) {
            setError(`Số lượng phải từ 1 đến ${maxRefundable}`);
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            // BƯỚC 2: Sử dụng `orderId` từ prop để tạo payload chính xác
            const payload = {
                orderId: orderId, // <-- Lấy từ prop
                reason: reason.trim(),
                items: [
                    { orderItemId: item.id, quantity }
                ]
            };

            await API.post('/refunds', payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            toast.success("Gửi yêu cầu trả hàng thành công!");
            onRefundSuccess();
            onHide();
        } catch (err) {
            setError(err.response?.data?.message || "Gửi yêu cầu thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (show) {
            setQuantity(1);
            setReason('');
            setError('');
        }
    }, [show]);

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Yêu cầu trả hàng: {item?.productName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Số lượng</Form.Label>
                        <Form.Control
                            type="number"
                            min={1}
                            max={maxRefundable}
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            required
                        />
                        <Form.Text>Tối đa: {maxRefundable}</Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Lý do trả hàng</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <div className="d-grid">
                        <Button type="submit" variant="warning" disabled={submitting}>
                            {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};



// ===================================================================
// COMPONENT CHÍNH: MyOrders
// ===================================================================
export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('ALL');
    const [showDetailModal, setShowDetailModal] = useState(false);

    const statusMap = {
        ALL: "Tất cả",
        PENDING: "Chờ xác nhận",
        PROCESSING: "Đang xử lý",
        SHIPPED: "Đang giao",
        DELIVERED: "Đã giao",
        CANCELLED: "Đã hủy"
    };

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [productToReview, setProductToReview] = useState(null);

    const [showRefundModal, setShowRefundModal] = useState(false);
    // BƯỚC 3: Thay đổi state để lưu cả item và orderId
    const [itemToRefund, setItemToRefund] = useState(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const res = await API.get('/orders');
            setOrders(res.data);
        } catch (err) {
            setError("Không thể tải lịch sử đơn hàng.");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleShowDetails = (order) => { setSelectedOrder(order); setShowDetailModal(true); };
    const handleShowReviewModal = (item, orderId) => { setProductToReview({ ...item, orderId }); setShowReviewModal(true); setShowDetailModal(false); };

    // BƯỚC 4: Sửa hàm handler để nhận cả `item` và `order`
    const handleShowRefundModal = (item, order) => {
        setItemToRefund({ item: item, orderId: order.id });
        setShowRefundModal(true);
        setShowDetailModal(false);
    };

    const handleReviewSuccess = () => { fetchOrders(); setShowDetailModal(false); };
    const handleRefundSuccess = () => {
        fetchOrders();
        setShowRefundModal(false);
        setItemToRefund(null);
    };

    const handleCloseReviewModal = () => { setShowReviewModal(false); if (selectedOrder) setShowDetailModal(true); };
    const handleCloseRefundModal = () => {
        setShowRefundModal(false);
        setItemToRefund(null);
        if (selectedOrder) setShowDetailModal(true);
    };

    const handleCancelOrder = async (orderId) => {
        const result = await confirmSwal("Hủy đơn hàng?", `Bạn có chắc chắn muốn hủy đơn hàng #${orderId} không?`);
        if (!result.isConfirmed) return;
        try { await API.put(`/orders/${orderId}/cancel`); fetchOrders(); toast.success(`Đã hủy thành công đơn hàng #${orderId}.`); }
        catch (err) { toast.error(err.response?.data?.message || "Hủy đơn hàng thất bại."); }
    };

    const getStatusBadge = (status) => {
        const statuses = {
            PENDING: <Badge bg="secondary" className="px-3 py-2 rounded-pill fw-normal">Chờ xác nhận</Badge>,
            PROCESSING: <Badge bg="info" className="px-3 py-2 rounded-pill fw-normal">Đang xử lý</Badge>,
            SHIPPED: <Badge bg="primary" className="px-3 py-2 rounded-pill fw-normal">Đang giao</Badge>,
            DELIVERED: <Badge bg="success" className="px-3 py-2 rounded-pill fw-normal">Đã giao</Badge>,
            CANCELLED: <Badge bg="danger" className="px-3 py-2 rounded-pill fw-normal">Đã hủy</Badge>
        };
        return statuses[status] || <Badge bg="dark" className="px-3 py-2 rounded-pill fw-normal">{status}</Badge>;
    };

    const filteredOrders = activeTab === 'ALL'
        ? orders
        : orders.filter(o => o.status === activeTab);

    const money = (v) => v ? Number(v).toLocaleString("vi-VN") + " ₫" : "0 ₫";
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('vi-VN') : '';

    if (loading) return <div className="text-center py-5"><Spinner /></div>;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <>
            <div className="mb-4">
                <Nav variant="pills" className="bg-light p-1 rounded-4 gap-1" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                    {Object.keys(statusMap).map(key => (
                        <Nav.Item key={key}>
                            <Nav.Link
                                eventKey={key}
                                className={`rounded-pill px-4 py-2 border-0 ${activeTab === key ? 'shadow-sm' : 'text-muted'}`}
                                style={{ transition: '0.3s' }}
                            >
                                {statusMap[key]}
                            </Nav.Link>
                        </Nav.Item>
                    ))}
                </Nav>
            </div>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Header className="bg-white border-bottom py-3">
                    <h5 className="mb-0 fw-bold text-dark">Lịch sử Đơn hàng</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-5">
                            <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-2130356-1800917.png" alt="Empty" style={{ width: '150px', opacity: 0.6 }} />
                            <p className="mt-3 text-muted">Không tìm thấy đơn hàng nào ở trạng thái này.</p>
                        </div>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light text-muted uppercase small fw-bold">
                                <tr>
                                    <th className="px-4 py-3">Mã ĐH</th>
                                    <th>Ngày đặt</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái</th>
                                    <th className="text-end px-4">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <tr key={order.id}>
                                        <td className="px-4 fw-bold">#{order.id}</td>
                                        <td>{formatDate(order.createdAt)}</td>
                                        <td className="text-primary fw-bold">{money(order.totalAmount)}</td>
                                        <td>{getStatusBadge(order.status)}</td>
                                        <td className="text-end px-4">
                                            <Button variant="light" size="sm" className="rounded-pill px-3 border" onClick={() => handleShowDetails(order)}>Xem chi tiết</Button>
                                            {order.status === 'PENDING' && (
                                                <Button variant="outline-danger" size="sm" onClick={() => handleCancelOrder(order.id)} className="ms-2 rounded-pill px-3">
                                                    Hủy
                                                </Button>
                                            )}
                                            {order.status === 'DELIVERED' && (
                                                (() => {
                                                    const isFullyReviewed = order.orderItems && order.orderItems.length > 0 && order.orderItems.every(item => item.reviewed);
                                                    return isFullyReviewed ? (
                                                        <Button variant="outline-success" size="sm" onClick={() => handleShowDetails(order)} className="ms-2 rounded-pill px-3">
                                                            Đã đánh giá
                                                        </Button>
                                                    ) : (
                                                        <Button variant="outline-primary" size="sm" onClick={() => handleShowDetails(order)} className="ms-2 rounded-pill px-3">
                                                            Đánh giá
                                                        </Button>
                                                    );
                                                })()
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* MODAL: CHI TIẾT ĐƠN HÀNG - GIAO DIỆN NÂNG CẤP */}
            {selectedOrder && (
                <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered scrollable className="order-detail-modal">
                    <Modal.Header closeButton className="bg-light border-0 px-4 py-3">
                        <Modal.Title className="fw-bold">Đơn hàng #{selectedOrder.id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-4 py-4">
                        {/* Timeline đơn hàng (Giả định đơn giản) */}
                        <div className="order-timeline d-flex justify-content-between mb-5 position-relative">
                            <div className="position-absolute top-50 start-0 w-100 bg-light-subtle h-2px" style={{ zIndex: 0, marginTop: '-5px', height: '2px', backgroundColor: '#eee' }}></div>
                            {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((s, i, arr) => {
                                const currentIndex = arr.indexOf(selectedOrder.status);
                                const isCompleted = i <= currentIndex && selectedOrder.status !== 'CANCELLED';
                                return (
                                    <div key={s} className="text-center position-relative" style={{ zIndex: 1, width: '25%' }}>
                                        <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2 shadow-sm ${isCompleted ? 'bg-primary text-white' : 'bg-white text-muted border'}`} style={{ width: '35px', height: '35px' }}>
                                            {isCompleted ? '✓' : i + 1}
                                        </div>
                                        <div className={`small fw-bold ${isCompleted ? 'text-dark' : 'text-muted'}`}>{statusMap[s]}</div>
                                    </div>
                                );
                            })}
                        </div>

                        <Row className="g-4 mb-4">
                            <Col md={6}>
                                <div className="p-3 rounded-4 bg-light border-0 h-100">
                                    <h6 className="fw-bold border-bottom pb-2 mb-3"><FontAwesomeIcon icon={faUser} className="me-2 text-primary" /> Thông tin nhận hàng</h6>
                                    <p className="mb-1 small"><strong>Người nhận:</strong> {selectedOrder.recipientName || 'N/A'}</p>
                                    <p className="mb-1 small"><strong>SĐT:</strong> {selectedOrder.recipientPhone || 'N/A'}</p>
                                    <p className="mb-1 small"><strong>Địa chỉ:</strong> {selectedOrder.shippingAddressSnapshot}</p>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="p-3 rounded-4 bg-light border-0 h-100">
                                    <h6 className="fw-bold border-bottom pb-2 mb-3"><FontAwesomeIcon icon={faBox} className="me-2 text-primary" /> Thanh toán</h6>
                                    <p className="mb-1 small"><strong>Phương thức:</strong> <Badge bg="info" className="fw-normal">{selectedOrder.paymentMethod}</Badge></p>
                                    <p className="mb-1 small"><strong>Trạng thái:</strong> <Badge bg={selectedOrder.paymentStatus === 'PAID' ? 'success' : 'warning'} className="fw-normal">{selectedOrder.paymentStatus}</Badge></p>
                                    <p className="mb-1 small font-monospace text-muted mt-2" style={{ fontSize: '0.7rem' }}>Ngày đặt: {formatDate(selectedOrder.createdAt)}</p>
                                </div>
                            </Col>
                        </Row>

                        <div className="products-section rounded-4 border p-3">
                            <h6 className="fw-bold mb-3">Sản phẩm đã chọn</h6>
                            <ListGroup variant="flush">
                                {selectedOrder.orderItems.map(item => (
                                    <ListGroup.Item key={item.id} className="px-0 py-3 border-light d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light rounded p-2 text-center" style={{ width: '45px' }}>
                                                <small className="text-muted fw-bold">x{item.quantity}</small>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark">{item.productName}</div>
                                                <small className="text-muted">{money(item.unitPrice)} / sản phẩm</small>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div className="fw-bold text-primary">{money(item.totalPrice)}</div>
                                            <div className="mt-2 d-flex gap-1 justify-content-end">
                                                {selectedOrder.status === 'DELIVERED' && (
                                                    <>
                                                        {item.reviewed
                                                            ? <Badge bg="success" className="rounded-pill fw-normal">Đã đánh giá</Badge>
                                                            : <Button variant="outline-primary" size="xs" style={{ fontSize: '0.7rem' }} className="py-1 px-2 rounded-pill" onClick={() => handleShowReviewModal(item, selectedOrder.id)}>Đánh giá</Button>}
                                                        {(item.quantity - (item.refundedQuantity || 0)) > 0 && (
                                                            <Button variant="outline-warning" size="xs" style={{ fontSize: '0.7rem' }} className="py-1 px-2 rounded-pill" onClick={() => handleShowRefundModal(item, selectedOrder)}>Trả hàng</Button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>

                            <div className="mt-3 pt-3 border-top">
                                <div className="d-flex justify-content-between mb-1 small text-muted">
                                    <span>Tạm tính:</span>
                                    <span>{money(selectedOrder.totalAmount - (selectedOrder.shippingFee || 0))}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2 small text-muted">
                                    <span>Phí vận chuyển:</span>
                                    <span>{money(selectedOrder.shippingFee || 0)}</span>
                                </div>
                                <div className="d-flex justify-content-between pt-2">
                                    <span className="fw-bold text-dark fs-5">TỔNG CỘNG:</span>
                                    <span className="fw-bold text-danger fs-5">{money(selectedOrder.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-0 px-4 pb-4">
                        <Button variant="dark" className="w-100 rounded-pill py-2 fw-bold" onClick={() => setShowDetailModal(false)}>Đóng</Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* MODAL VIẾT ĐÁNH GIÁ */}
            {productToReview && (
                <ReviewModal
                    show={showReviewModal}
                    onHide={handleCloseReviewModal}
                    product={productToReview}
                    orderId={productToReview.orderId}
                    onReviewSuccess={handleReviewSuccess}
                />
            )}

            {/* MODAL YÊU CẦU TRẢ HÀNG */}
            {/* BƯỚC 6: Render Modal dựa trên state mới và truyền props chính xác */}
            {itemToRefund && (
                <RefundModal
                    show={showRefundModal}
                    onHide={handleCloseRefundModal}
                    item={itemToRefund.item}
                    orderId={itemToRefund.orderId}
                    onRefundSuccess={handleRefundSuccess}
                />
            )}
        </>
    );
}