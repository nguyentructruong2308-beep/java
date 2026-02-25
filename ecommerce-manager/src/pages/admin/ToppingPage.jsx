import React, { useEffect, useState, useRef } from "react";
import API from "../../api/api";
import { confirmSwal } from "../../utils/swal";
import { Table, Button, Modal, Form, Alert, Card, Container, Spinner, Badge } from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash, FaSyncAlt, FaUndo, FaUpload } from "react-icons/fa";

export default function ToppingPage() {
    const [toppings, setToppings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editTopping, setEditTopping] = useState(null);
    const [formData, setFormData] = useState({ name: "", price: "", imageUrl: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

    const fetchToppings = async () => {
        setLoading(true);
        try {
            const res = await API.get("/toppings/admin/all");
            setToppings(res.data || []);
        } catch (err) {
            setError("Không thể tải danh sách topping");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchToppings();
    }, []);

    // --- SELECTION HANDLERS ---
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(toppings.map(t => t.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        const result = await confirmSwal(
            `Xóa ${selectedIds.length} topping?`, 
            "Hành động này sẽ xóa vĩnh viễn các topping đã chọn. Bạn có chắc không?"
        );
        if (!result.isConfirmed) return;

        try {
            setLoading(true);
            await Promise.all(selectedIds.map(id => API.delete(`/toppings/${id}`)));
            setSuccess(`Đã xóa ${selectedIds.length} topping.`);
            setSelectedIds([]);
            fetchToppings();
        } catch (err) {
            setError("Có lỗi xảy ra khi xóa hàng loạt.");
        } finally {
            setLoading(false);
        }
    };

    const handleShowModal = (topping = null) => {
        if (topping) {
            setEditTopping(topping);
            setFormData({
                name: topping.name,
                price: topping.price,
                imageUrl: topping.imageUrl || ""
            });
            setImagePreview(topping.imageUrl ? `${API_BASE_URL}/uploads/${topping.imageUrl}` : null);
        } else {
            setEditTopping(null);
            setFormData({ name: "", price: "", imageUrl: "" });
            setImagePreview(null);
        }
        setShowModal(true);
        setError("");
        setSuccess("");
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Upload file và lấy URL
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Vui lòng chọn file hình ảnh");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("File không được vượt quá 5MB");
            return;
        }

        // Preview
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);

        // Upload file
        setUploading(true);
        setError("");
        try {
            const formDataUpload = new FormData();
            formDataUpload.append("file", file);

            const res = await API.post("/files/upload", formDataUpload, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            // Lưu tên file vào formData
            setFormData(prev => ({ ...prev, imageUrl: res.data.fileName }));
            setSuccess("Upload ảnh thành công");
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi khi upload ảnh");
            setImagePreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (!formData.name.trim()) {
                setError("Tên topping không được để trống");
                return;
            }
            if (!formData.price || formData.price <= 0) {
                setError("Giá phải lớn hơn 0");
                return;
            }

            const payload = {
                name: formData.name,
                price: Number(formData.price),
                imageUrl: formData.imageUrl || null
            };

            if (editTopping) {
                await API.put(`/toppings/${editTopping.id}`, payload);
                setSuccess("Cập nhật topping thành công");
            } else {
                await API.post("/toppings", payload);
                setSuccess("Thêm topping thành công");
            }
            fetchToppings();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi khi lưu topping");
        }
    };

    const handleDelete = async (id) => {
    const result = await confirmSwal("Xóa Topping?", "Bạn có chắc chắn muốn xóa topping này không?");
    if (!result.isConfirmed) return;
    try {
            await API.delete(`/toppings/${id}`);
            setSuccess("Xoá topping thành công");
            fetchToppings();
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi khi xoá topping");
        }
    };

    const handleRestore = async (id) => {
        try {
            await API.put(`/toppings/${id}/restore`);
            setSuccess("Khôi phục topping thành công");
            fetchToppings();
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi khi khôi phục topping");
        }
    };

    const money = (v) => Number(v).toLocaleString("vi-VN") + " ₫";

    // Helper để lấy URL ảnh đầy đủ
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith("http")) return imageUrl;
        return `${API_BASE_URL}/uploads/${imageUrl}`;
    };

    return (
        <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }} className="pb-5 text-dark">
            <Container fluid="lg" className="py-4">

                {/* HEADER SECTION */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
                    <div>
                        <h4 className="fw-bolder mb-1">Quản lý Topping</h4>
                        <p className="text-muted mb-0 small">Danh sách các topping cho sản phẩm</p>
                    </div>
                    <div className="d-flex gap-2 mt-3 mt-md-0 align-items-center">
                        {selectedIds.length > 0 && (
                            <Button variant="danger" className="fw-bold px-3 shadow-sm border-0 py-2" onClick={handleBulkDelete}>
                                <FaTrash className="me-2" /> Xóa {selectedIds.length} mục
                            </Button>
                        )}
                        <Button variant="white" className="shadow-sm bg-white border-0" onClick={fetchToppings}>
                            <FaSyncAlt className={loading ? "fa-spin" : ""} />
                        </Button>
                        <Button variant="primary" className="fw-bold px-3 shadow-sm" onClick={() => handleShowModal()}>
                            <FaPlus className="me-2" /> Thêm topping
                        </Button>
                    </div>
                </div>

                {/* ALERTS */}
                {error && <Alert variant="danger" className="border-0 shadow-sm" onClose={() => setError("")} dismissible>{error}</Alert>}
                {success && <Alert variant="success" className="border-0 shadow-sm" onClose={() => setSuccess("")} dismissible>{success}</Alert>}

                {/* MAIN CONTENT CARD */}
                <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <Card.Body className="p-0">
                        <Table hover responsive className="align-middle mb-0">
                            <thead className="bg-light text-muted uppercase small fw-bold">
                                <tr>
                                    <th className="px-4 py-3 border-0" style={{ width: '40px' }}>
                                        <Form.Check 
                                            type="checkbox"
                                            checked={toppings.length > 0 && selectedIds.length === toppings.length}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="border-0">ID</th>
                                    <th className="border-0">Tên topping</th>
                                    <th className="border-0">Giá</th>
                                    <th className="border-0">Hình ảnh</th>
                                    <th className="border-0">Trạng thái</th>
                                    <th className="border-0 text-end px-4">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                ) : toppings.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5 text-muted">Không có topping nào</td>
                                    </tr>
                                ) : (
                                    toppings.map((t) => (
                                        <tr key={t.id} className={`${!t.isActive ? "table-secondary" : ""} ${selectedIds.includes(t.id) ? "bg-light-primary" : ""}`}>
                                            <td className="px-4">
                                                <Form.Check 
                                                    type="checkbox"
                                                    checked={selectedIds.includes(t.id)}
                                                    onChange={() => handleSelectOne(t.id)}
                                                />
                                            </td>
                                            <td className="text-muted">#{t.id}</td>
                                            <td>
                                                <span className="fw-bold">{t.name}</span>
                                            </td>
                                            <td className="text-success fw-semibold">{money(t.price)}</td>
                                            <td>
                                                {t.imageUrl ? (
                                                    <img src={getImageUrl(t.imageUrl)} alt={t.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }} />
                                                ) : (
                                                    <em className="text-muted small">Không có</em>
                                                )}
                                            </td>
                                            <td>
                                                {t.isActive ? (
                                                    <Badge bg="success">Hoạt động</Badge>
                                                ) : (
                                                    <Badge bg="secondary">Đã ẩn</Badge>
                                                )}
                                            </td>
                                            <td className="text-end px-4">
                                                <Button variant="light" size="sm" className="me-2 text-primary shadow-sm" onClick={() => handleShowModal(t)}>
                                                    <FaEdit />
                                                </Button>
                                                {t.isActive ? (
                                                    <Button variant="light" size="sm" className="text-danger shadow-sm" onClick={() => handleDelete(t.id)}>
                                                        <FaTrash />
                                                    </Button>
                                                ) : (
                                                    <Button variant="light" size="sm" className="text-success shadow-sm" onClick={() => handleRestore(t.id)}>
                                                        <FaUndo />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </Container>

            {/* MODAL SECTION */}
            <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static">
                <Form>
                    <Modal.Header closeButton className="border-0 px-4 pt-4">
                        <Modal.Title className="fw-bold">
                            {editTopping ? "Sửa topping" : "Thêm topping mới"}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-4 pb-4">
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Tên topping *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên topping..."
                                className="bg-light border-0 shadow-none"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Giá *</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Nhập giá topping..."
                                className="bg-light border-0 shadow-none"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-0">
                            <Form.Label className="small fw-bold">Hình ảnh</Form.Label>

                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="mb-3 text-center">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: 150,
                                            objectFit: 'contain',
                                            borderRadius: 8,
                                            border: '1px solid #dee2e6'
                                        }}
                                    />
                                </div>
                            )}

                            {/* File Input */}
                            <div className="d-flex align-items-center gap-2">
                                <Form.Control
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="bg-light border-0 shadow-none"
                                    disabled={uploading}
                                />
                                {uploading && <Spinner size="sm" animation="border" />}
                            </div>
                            <Form.Text className="text-muted">
                                Chọn file ảnh từ máy tính (tối đa 5MB)
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0 px-4 pb-4">
                        <Button variant="light" className="fw-bold px-4 shadow-sm" onClick={handleCloseModal}>
                            Huỷ
                        </Button>
                        <Button
                            variant="primary"
                            className="fw-bold px-4 shadow-sm"
                            onClick={handleSave}
                            disabled={uploading}
                        >
                            {uploading ? "Đang upload..." : "Lưu thay đổi"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}
