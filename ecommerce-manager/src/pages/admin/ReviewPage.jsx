import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { confirmSwal, successSwal, errorSwal } from "../../utils/swal";
import { FaTrash, FaStar, FaSearch, FaUser, FaBox, FaFilter, FaTimes } from "react-icons/fa";
import { Button, Table, Badge, Row, Col, Card, Container, Spinner, InputGroup, Form, Pagination, Image } from "react-bootstrap";


export default function ReviewPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(10);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRating, setFilterRating] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Load reviews from API
    const loadReviews = async (page = 0) => {
        setLoading(true);
        try {
            let url = `/reviews?page=${page}&size=${pageSize}`;
            if (searchTerm) url += `&productName=${encodeURIComponent(searchTerm)}`;
            if (filterRating) url += `&rating=${filterRating}`;
            if (startDate) url += `&startDate=${startDate}T00:00:00`;
            if (endDate) url += `&endDate=${endDate}T23:59:59`;

            const res = await API.get(url);
            setReviews(res.data.content || []);
            setTotalPages(res.data.totalPages || 1);
            setTotalElements(res.data.totalElements || 0);
        } catch (error) {
            console.error("Error loading reviews:", error);
            errorSwal("Lỗi!", "Không thể tải danh sách đánh giá.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews(currentPage);
    }, [currentPage]);

    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };

    const handleDelete = async (id) => {
        const result = await confirmSwal("Xóa đánh giá?", "Hành động này không thể hoàn tác.");
        if (!result.isConfirmed) return;

        try {
            await API.delete(`/reviews/${id}`);
            successSwal("Đã xóa!", "Đánh giá đã được xóa thành công.");
            loadReviews(currentPage);
        } catch (error) {
            errorSwal("Lỗi!", "Không thể xóa đánh giá.");
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <FaStar key={i} className={i < rating ? "text-warning" : "text-muted opacity-25"} size={14} />
        ));
    };

    const getImageUrl = (url) => {
        if (!url) return "https://placehold.co/100";
        if (url.startsWith("http")) return url;
        return `${API.defaults.baseURL}/files/download/${url}`;
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return "-";
        return new Date(isoString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Container fluid className="py-4 bg-light min-vh-100">
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <Card.Body className="p-4">
                    <Row className="align-items-center">
                        <Col>
                            <h4 className="fw-bolder mb-1">Quản lý đánh giá</h4>
                            <p className="text-muted small mb-0">Tổng số: {totalElements} đánh giá</p>
                        </Col>
                        <Col md="auto">
                            <div className="d-flex gap-2">
                                <Button variant="outline-secondary" size="sm" onClick={() => {
                                    setSearchTerm("");
                                    setFilterRating("");
                                    setStartDate("");
                                    setEndDate("");
                                    loadReviews(0);
                                }}>
                                    <FaTimes className="me-1" /> Xóa bộ lọc
                                </Button>
                                <Button variant="primary" size="sm" onClick={() => loadReviews(0)}>
                                    <FaFilter className="me-1" /> Lọc
                                </Button>
                            </div>
                        </Col>
                    </Row>
                    <Row className="mt-3 g-2">
                        <Col md={3}>
                            <InputGroup size="sm">
                                <InputGroup.Text className="bg-white border-end-0"><FaSearch className="text-muted" /></InputGroup.Text>
                                <Form.Control
                                    placeholder="Tìm theo tên sản phẩm..."
                                    className="border-start-0"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && loadReviews(0)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={2}>
                            <Form.Select size="sm" value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
                                <option value="">Tất cả sao</option>
                                <option value="5">5 Sao</option>
                                <option value="4">4 Sao</option>
                                <option value="3">3 Sao</option>
                                <option value="2">2 Sao</option>
                                <option value="1">1 Sao</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Form.Control type="date" size="sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </Col>
                        <Col md={2}>
                            <Form.Control type="date" size="sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <Table responsive hover className="align-middle mb-0">
                    <thead className="bg-light">
                        <tr className="text-uppercase small text-muted border-bottom">
                            <th className="px-4 py-3 border-0">Khách hàng</th>
                            <th className="border-0">Sản phẩm</th>
                            <th className="border-0" style={{ minWidth: '120px' }}>Đánh giá</th>
                            <th className="border-0">Nội dung</th>
                            <th className="border-0">Hình ảnh</th>
                            <th className="border-0">Ngày tạo</th>
                            <th className="text-end px-4 border-0">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="text-center py-5"><Spinner animation="border" variant="primary" /></td></tr>
                        ) : reviews.length === 0 ? (
                            <tr><td colSpan="7" className="text-center py-5 text-muted">Chưa có đánh giá nào.</td></tr>
                        ) : (
                            reviews.map(review => (
                                <tr key={review.id}>
                                    <td className="px-4">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center text-primary fw-bold me-2" style={{ width: 32, height: 32 }}>
                                                <FaUser size={14} />
                                            </div>
                                            <span className="fw-medium text-dark">{review.userFullName || "Khách"}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column">
                                            <span className="fw-medium text-dark">{review.productName}</span>
                                            <small className="text-muted"><FaBox className="me-1" /> {review.categoryName || "Chưa phân loại"}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex">{renderStars(review.rating)}</div>
                                    </td>
                                    <td>
                                        <p className="mb-0 small text-muted text-truncate" style={{ maxWidth: '300px' }} title={review.comment}>{review.comment}</p>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            {review.imageUrls && review.imageUrls.map((url, idx) => (
                                                <Image key={idx} src={getImageUrl(url)} rounded style={{ width: 32, height: 32, objectFit: 'cover' }} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="text-nowrap text-muted small">
                                        {formatDateTime(review.createdAt)}
                                    </td>
                                    <td className="text-end px-4">
                                        <Button variant="light" size="sm" className="text-danger border shadow-sm" onClick={() => handleDelete(review.id)} title="Xóa đánh giá">
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                        <small className="text-muted">
                            Trang {currentPage + 1} / {totalPages}
                        </small>
                        <Pagination className="mb-0">
                            <Pagination.First onClick={() => handlePageChange(0)} disabled={currentPage === 0} />
                            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} />
                            {[...Array(totalPages)].map((_, idx) => {
                                if (idx === 0 || idx === totalPages - 1 || (idx >= currentPage - 1 && idx <= currentPage + 1)) {
                                    return <Pagination.Item key={idx} active={idx === currentPage} onClick={() => handlePageChange(idx)}>{idx + 1}</Pagination.Item>;
                                } else if (idx === currentPage - 2 || idx === currentPage + 2) {
                                    return <Pagination.Ellipsis key={idx} />;
                                }
                                return null;
                            })}
                            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1} />
                            <Pagination.Last onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage === totalPages - 1} />
                        </Pagination>
                    </div>
                )}
            </Card>
        </Container>
    );
}
