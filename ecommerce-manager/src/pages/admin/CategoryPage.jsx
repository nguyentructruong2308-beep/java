import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { confirmSwal } from "../../utils/swal";
import { Table, Button, Modal, Form, Pagination, Alert, Card, Container, Row, Col, InputGroup, Spinner, Badge } from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSyncAlt, FaLayerGroup } from "react-icons/fa";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/categories/all?page=${page}&size=${size}`);
      setCategories(res.data.content || res.data);
      if (res.data.totalPages !== undefined) setTotalPages(res.data.totalPages);
      setLoading(false);
    } catch (err) {
      setError("Không thể tải danh mục");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    setSelectedIds([]); // Reset selection on page change
  }, [page]);

  // --- SELECTION HANDLERS ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(categories.map(c => c.id));
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
      `Xóa ${selectedIds.length} danh mục?`, 
      "Lưu ý: Bạn chỉ có thể xóa các danh mục không chứa sản phẩm. Hành động này không thể hoàn tác!"
    );
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await Promise.all(selectedIds.map(id => API.delete(`/categories/${id}`)));
      setSuccess(`Đã xóa thành công ${selectedIds.length} danh mục.`);
      setSelectedIds([]);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi xóa hàng loạt. Một số danh mục có thể đang chứa sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (category = null) => {
    if (category) {
      setEditCategory(category);
      setFormData({ name: category.name, description: category.description });
    } else {
      setEditCategory(null);
      setFormData({ name: "", description: "" });
    }
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        setError("Tên danh mục không được để trống");
        return;
      }

      if (editCategory) {
        await API.put(`/categories/${editCategory.id}`, formData);
        setSuccess("Cập nhật danh mục thành công");
      } else {
        await API.post(`/categories`, formData);
        setSuccess("Tạo danh mục thành công");
      }
      fetchCategories();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi lưu danh mục");
    }
  };

  const handleDelete = async (id) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    const isRestoring = !category.isActive;
    const title = isRestoring ? "Khôi phục danh mục?" : "Xóa danh mục?";
    const text = isRestoring 
      ? "Danh mục này sẽ hoạt động trở lại." 
      : "Sản phẩm thuộc danh mục này sẽ bị ẩn khỏi cửa hàng. Bạn có chắc không?";

    const result = await confirmSwal(title, text);
    if (!result.isConfirmed) return;

    try {
      if (isRestoring) {
        // Giả sử backend dùng PUT /{id} để cập nhật hoặc một endpoint restore riêng
        // Thông thường trong hệ thống này, update category cũng có thể dùng logic này
        // Nhưng nếu backend chỉ có isActive=false khi DELETE, ta cần đảm bảo có cách khôi phục
        // Dựa trên CategoryService.java (line 64), DELETE set isActive = false.
        // Cần xem lại cách khôi phục trong backend.
        await API.put(`/categories/${id}`, { ...category, isActive: true });
        setSuccess("Khôi phục danh mục thành công");
      } else {
        await API.delete(`/categories/${id}`);
        setSuccess("Xoá danh mục thành công");
      }
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi xử lý danh mục");
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    let items = [];
    for (let number = 0; number < totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === page}
          onClick={() => setPage(number)}
        >
          {number + 1}
        </Pagination.Item>
      );
    }
    return (
      <div className="d-flex justify-content-center mt-3">
        <Pagination>{items}</Pagination>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }} className="pb-5 text-dark">
      <Container fluid="lg" className="py-4">
        
        {/* HEADER SECTION */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <h4 className="fw-bolder mb-1">Quản lý danh mục</h4>
            <p className="text-muted mb-0 small">Cấu trúc phân loại sản phẩm</p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0 align-items-center">
            {selectedIds.length > 0 && (
              <Button variant="danger" className="fw-bold px-3 shadow-sm border-0 py-2" onClick={handleBulkDelete}>
                <FaTrash className="me-2" /> Xóa {selectedIds.length} mục
              </Button>
            )}
            <Button variant="white" className="shadow-sm bg-white border-0" onClick={fetchCategories}>
              <FaSyncAlt className={loading ? "fa-spin" : ""} />
            </Button>
            <Button variant="primary" className="fw-bold px-3 shadow-sm" onClick={() => handleShowModal()}>
              <FaPlus className="me-2" /> Thêm danh mục
            </Button>
          </div>
        </div>

        {/* ALERTS */}
        {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}
        {success && <Alert variant="success" className="border-0 shadow-sm">{success}</Alert>}

        {/* MAIN CONTENT CARD */}
        <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Card.Body className="p-0">
            <Table hover responsive className="align-middle mb-0">
              <thead className="bg-light text-muted uppercase small fw-bold">
                <tr>
                  <th className="px-4 py-3 border-0" style={{ width: '40px' }}>
                    <Form.Check 
                      type="checkbox"
                      checked={categories.length > 0 && selectedIds.length === categories.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="border-0">ID</th>
                  <th className="border-0">Tên danh mục</th>
                  <th className="border-0">Mô tả</th>
                  <th className="border-0 text-center">Trạng thái</th>
                  <th className="border-0 text-end px-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">Không có danh mục nào</td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c.id} className={`${selectedIds.includes(c.id) ? "bg-light-primary" : ""} ${!c.isActive ? "opacity-75 bg-light" : ""}`}>
                      <td className="px-4">
                        <Form.Check 
                          type="checkbox"
                          checked={selectedIds.includes(c.id)}
                          onChange={() => handleSelectOne(c.id)}
                        />
                      </td>
                      <td className="text-muted">#{c.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className={`rounded-circle ${c.isActive ? "bg-primary" : "bg-secondary"} bg-opacity-10 p-2 me-2 ${c.isActive ? "text-primary" : "text-secondary"}`}>
                            <FaLayerGroup size={14} />
                          </div>
                          <span className={`fw-bold ${!c.isActive ? "text-decoration-line-through text-muted" : ""}`}>{c.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-muted small">
                          {c.description || <em className="opacity-50">Không có mô tả</em>}
                        </span>
                      </td>
                      <td className="text-center">
                        <Badge bg={c.isActive ? "success" : "secondary"} className="bg-opacity-10 text-dark fw-normal border">
                          {c.isActive ? "● Hoạt động" : "○ Đã ẩn"}
                        </Badge>
                      </td>
                      <td className="text-end px-4">
                        <Button variant="light" size="sm" className="me-2 text-primary shadow-sm border" onClick={() => handleShowModal(c)}>
                          <FaEdit />
                        </Button>
                        <Button variant="light" size="sm" className={`${c.isActive ? "text-danger" : "text-success"} shadow-sm border`} onClick={() => handleDelete(c.id)}>
                          {c.isActive ? <FaTrash /> : <FaSyncAlt />}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {renderPagination()}
      </Container>

      {/* MODAL SECTION */}
      <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static">
        <Form>
          <Modal.Header closeButton className="border-0 px-4 pt-4">
            <Modal.Title className="fw-bold">
              {editCategory ? "Sửa danh mục" : "Thêm danh mục"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 pb-4">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Tên danh mục *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên danh mục..."
                className="bg-light border-0 shadow-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-0">
              <Form.Label className="small fw-bold">Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Nhập mô tả danh mục (nếu có)..."
                className="bg-light border-0 shadow-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 px-4 pb-4">
            <Button variant="light" className="fw-bold px-4 shadow-sm" onClick={handleCloseModal}>
              Huỷ
            </Button>
            <Button variant="primary" className="fw-bold px-4 shadow-sm" onClick={handleSave}>
              Lưu thay đổi
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}