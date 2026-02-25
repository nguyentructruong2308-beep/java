import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner, Badge, Card, Row, Col } from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus, FaEye, FaSyncAlt } from "react-icons/fa";
import API from "../../api/api";
import { confirmSwal } from "../../utils/swal";
import { toast } from "react-toastify";

export default function BlogManagementPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    category: "",
    published: true,
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/blogs/admin/all?size=100");
      setBlogs(res.data.content || res.data);
    } catch (error) {
      toast.error("Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // --- SELECTION HANDLERS ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(blogs.map(b => b.id));
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
      `Xóa ${selectedIds.length} bài viết?`, 
      "Hành động này sẽ xóa vĩnh viễn các bài viết đã chọn. Bạn có chắc không?"
    );
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await Promise.all(selectedIds.map(id => API.delete(`/blogs/${id}`)));
      toast.success(`Đã xóa ${selectedIds.length} bài viết.`);
      setSelectedIds([]);
      fetchBlogs();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa hàng loạt.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title || "",
        excerpt: blog.excerpt || "",
        content: blog.content || "",
        author: blog.author || "",
        category: blog.category || "",
        published: blog.published,
      });
    } else {
      setEditingBlog(null);
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        author: "",
        category: "",
        published: true,
      });
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBlog(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("excerpt", formData.excerpt);
    data.append("content", formData.content);
    data.append("author", formData.author);
    data.append("category", formData.category);
    data.append("published", formData.published);
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      if (editingBlog) {
        await API.put(`/blogs/${editingBlog.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Cập nhật bài viết thành công");
      } else {
        await API.post("/blogs", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Thêm bài viết thành công");
      }
      handleCloseModal();
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu bài viết");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await confirmSwal("Xóa bài viết?", "Bạn có chắc chắn muốn xóa bài viết này không?");
    if (!result.isConfirmed) return;
    try {
      await API.delete(`/blogs/${id}`);
      toast.success("Đã xóa bài viết");
      fetchBlogs();
    } catch (error) {
      toast.error("Lỗi khi xóa bài viết");
    }
  };

  const getImg = (url) => {
    if (!url) return "https://placehold.co/100x60?text=No+Image";
    if (url.startsWith("http")) return url;
    return `${API.defaults.baseURL}/files/download/${url}`;
  };

  return (
    <div className="container-fluid p-0">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">Quản lý Bài viết & Tin tức</h5>
          <div className="d-flex gap-2">
            {selectedIds.length > 0 && (
              <Button variant="danger" onClick={handleBulkDelete} className="shadow-sm border-0 d-flex align-items-center gap-2">
                <FaTrash /> Xóa {selectedIds.length} mục
              </Button>
            )}
            <Button variant="light" onClick={fetchBlogs} className="border shadow-sm">
                <FaSyncAlt className={loading ? "fa-spin" : ""} />
            </Button>
            <Button variant="primary" onClick={() => handleOpenModal()} className="shadow-sm d-flex align-items-center gap-2">
              <FaPlus /> Thêm bài viết
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th style={{ width: "40px" }} className="ps-3">
                  <Form.Check 
                    type="checkbox"
                    checked={blogs.length > 0 && selectedIds.length === blogs.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={{ width: "80px" }}>Ảnh</th>
                <th>Tiêu đề</th>
                <th>Tác giả</th>
                <th>Danh mục</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th className="text-end pe-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    Chưa có bài viết nào.
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id} className={selectedIds.includes(blog.id) ? "bg-light-primary" : ""}>
                    <td className="ps-3">
                      <Form.Check 
                        type="checkbox"
                        checked={selectedIds.includes(blog.id)}
                        onChange={() => handleSelectOne(blog.id)}
                      />
                    </td>
                    <td>
                      <img
                        src={getImg(blog.imageUrl)}
                        alt={blog.title}
                        className="rounded"
                        style={{ width: "60px", height: "40px", objectFit: "cover" }}
                      />
                    </td>
                    <td>
                      <div className="fw-bold text-truncate" style={{ maxWidth: "300px" }}>
                        {blog.title}
                      </div>
                      <small className="text-muted text-truncate d-block" style={{ maxWidth: "300px" }}>
                        {blog.excerpt}
                      </small>
                    </td>
                    <td>{blog.author}</td>
                    <td><Badge bg="info" className="fw-normal">{blog.category}</Badge></td>
                    <td>
                      {blog.published ? (
                        <Badge bg="success">Công khai</Badge>
                      ) : (
                        <Badge bg="secondary">Nháp</Badge>
                      )}
                    </td>
                    <td>{new Date(blog.createdAt).toLocaleDateString("vi-VN")}</td>
                    <td className="text-end pe-3">
                      <div className="d-flex justify-content-end gap-2">
                        <Button variant="outline-primary" size="sm" onClick={() => handleOpenModal(blog)}>
                          <FaEdit />
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(blog.id)}>
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* MODAL THÊM/SỬA */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered backdrop="static">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-5 fw-bold">
            {editingBlog ? "Chỉnh sửa bài viết" : "Thêm bài viết mới"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Tiêu đề</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Nhập tiêu đề bài viết..."
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Danh mục</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="VD: Tin tức, Khuyến mãi"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Tóm tắt ngắn</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Mô tả ngắn gọn nội dung bài viết..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Nội dung bài viết (HTML hoặc Text)</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Nhập nội dung chi tiết bài viết..."
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Tác giả</Form.Label>
                  <Form.Control
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="Tên tác giả..."
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Ảnh bài viết</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
                  {editingBlog && editingBlog.imageUrl && !imageFile && (
                    <div className="mt-2">
                        <small className="text-muted d-block mb-1">Ảnh hiện tại:</small>
                        <img src={getImg(editingBlog.imageUrl)} width="100" className="rounded border" alt="Current" />
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Công khai bài viết"
                name="published"
                checked={formData.published}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Button variant="light" onClick={handleCloseModal}>
                Hủy
              </Button>
              <Button variant="primary" type="submit" disabled={submitting} className="px-4">
                {submitting ? (
                  <>
                    <Spinner size="sm" className="me-2" /> Đang lưu...
                  </>
                ) : (
                  "Lưu bài viết"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
