import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { confirmSwal } from "../../utils/swal";
import {
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Card,
  Container,
  Spinner,
  Badge,
  Row,
  Col,
} from "react-bootstrap";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaTag,
  FaPercent,
  FaMoneyBillWave,
} from "react-icons/fa";

export default function DiscountPage() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDiscount, setEditDiscount] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderValue: "",
    maxDiscountAmount: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/discounts");
      // Filter ONLY vouchers/discounts (not Buy X Get Y deals)
      const vouchers = res.data.filter(d => !d.buyQuantity || d.buyQuantity === 0);
      setDiscounts(vouchers);
    } catch (err) {
      setError("Không thể tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  // --- SELECTION HANDLERS ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(discounts.map(d => d.id));
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
      `Xóa ${selectedIds.length} mã giảm giá?`,
      "Hành động này sẽ xóa vĩnh viễn các mã giảm giá đã chọn. Bạn có chắc không?"
    );
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await Promise.all(selectedIds.map(id => API.delete(`/discounts/${id}`)));
      setSuccess(`Đã xóa ${selectedIds.length} mã giảm giá.`);
      setSelectedIds([]);
      fetchDiscounts();
    } catch (err) {
      setError("Có lỗi xảy ra khi xóa hàng loạt.");
    } finally {
      setLoading(false);
    }
  };

  // Format datetime for input
  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  // Format datetime for display
  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleShowModal = (discount = null) => {
    if (discount) {
      setEditDiscount(discount);
      setFormData({
        code: discount.code || "",
        name: discount.name || "",
        description: discount.description || "",
        discountType: discount.discountType || "PERCENTAGE",
        discountValue: discount.discountValue || "",
        minOrderValue: discount.minOrderValue || "",
        maxDiscountAmount: discount.maxDiscountAmount || "",
        startDate: formatDateTimeForInput(discount.startDate),
        endDate: formatDateTimeForInput(discount.endDate),
        isActive: discount.isActive ?? true,
      });
    } else {
      setEditDiscount(null);
      setFormData({
        code: "",
        name: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        minOrderValue: "",
        maxDiscountAmount: "",
        startDate: "",
        endDate: "",
        isActive: true,
      });
    }
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.code.trim()) {
        setError("Mã giảm giá không được để trống");
        return;
      }
      if (!formData.name.trim()) {
        setError("Tên không được để trống");
        return;
      }
      if (!formData.discountValue || formData.discountValue <= 0) {
        setError("Giá trị giảm phải lớn hơn 0");
        return;
      }
      if (!formData.startDate || !formData.endDate) {
        setError("Vui lòng chọn ngày bắt đầu và kết thúc");
        return;
      }

      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
        discountValue: parseFloat(formData.discountValue),
        minOrderValue: formData.minOrderValue
          ? parseFloat(formData.minOrderValue)
          : null,
        maxDiscountAmount: formData.maxDiscountAmount
          ? parseFloat(formData.maxDiscountAmount)
          : null,
      };

      if (editDiscount) {
        await API.put(`/discounts/${editDiscount.id}`, payload);
        setSuccess("Cập nhật mã giảm giá thành công");
      } else {
        await API.post("/discounts", payload);
        setSuccess("Tạo mã giảm giá thành công");
      }
      fetchDiscounts();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi lưu mã giảm giá");
    }
  };

  const handleDelete = async (id) => {
    const result = await confirmSwal("Xóa mã giảm giá?", "Bạn có chắc chắn muốn xóa mã giảm giá này không?");
    if (!result.isConfirmed) return;
    try {
      await API.delete(`/discounts/${id}`);
      setSuccess("Xoá mã giảm giá thành công");
      fetchDiscounts();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi xoá mã giảm giá");
    }
  };

  // Check if discount is currently valid
  const getDiscountStatus = (discount) => {
    const now = new Date();
    const start = new Date(discount.startDate);
    const end = new Date(discount.endDate);

    if (!discount.isActive) {
      return { label: "Tắt", variant: "secondary" };
    }
    if (now < start) {
      return { label: "Chưa bắt đầu", variant: "info" };
    }
    if (now > end) {
      return { label: "Hết hạn", variant: "danger" };
    }
    return { label: "Đang hoạt động", variant: "success" };
  };

  return (
    <div
      style={{ backgroundColor: "#f4f6f9", minHeight: "100vh" }}
      className="pb-5 text-dark"
    >
      <Container fluid="lg" className="py-4">
        {/* HEADER SECTION */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <h4 className="fw-bolder mb-1">Quản lý Voucher / Mã Giảm Giá</h4>
            <p className="text-muted mb-0 small">
              Tạo và quản lý các mã khuyến mãi
            </p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0 align-items-center">
            {selectedIds.length > 0 && (
              <Button variant="danger" className="fw-bold px-3 shadow-sm" onClick={handleBulkDelete}>
                <FaTrash className="me-2" /> Xóa {selectedIds.length} mục
              </Button>
            )}
            <Button
              variant="white"
              className="shadow-sm bg-white border-0"
              onClick={fetchDiscounts}
            >
              <FaSyncAlt className={loading ? "fa-spin" : ""} />
            </Button>
            <Button
              variant="primary"
              className="fw-bold px-3 shadow-sm"
              onClick={() => handleShowModal()}
            >
              <FaPlus className="me-2" /> Thêm mã giảm giá
            </Button>
          </div>
        </div>

        {/* ALERTS */}
        {error && (
          <Alert
            variant="danger"
            className="border-0 shadow-sm"
            onClose={() => setError("")}
            dismissible
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            variant="success"
            className="border-0 shadow-sm"
            onClose={() => setSuccess("")}
            dismissible
          >
            {success}
          </Alert>
        )}

        {/* MAIN CONTENT CARD */}
        <Card
          className="border-0 shadow-sm"
          style={{ borderRadius: "12px", overflow: "hidden" }}
        >
          <Card.Body className="p-0">
            <Table hover responsive className="align-middle mb-0">
              <thead className="bg-light text-muted uppercase small fw-bold">
                <tr>
                  <th className="px-4 py-3 border-0" style={{ width: '40px' }}>
                    <Form.Check
                      type="checkbox"
                      checked={discounts.length > 0 && selectedIds.length === discounts.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="border-0">Mã</th>
                  <th className="border-0">Tên</th>
                  <th className="border-0">Loại</th>
                  <th className="border-0">Giá trị</th>
                  <th className="border-0">Thời gian</th>
                  <th className="border-0">Trạng thái</th>
                  <th className="border-0 text-end px-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <Spinner
                        animation="border"
                        variant="primary"
                        size="sm"
                        className="me-2"
                      />
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : discounts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      Chưa có mã giảm giá nào
                    </td>
                  </tr>
                ) : (
                  discounts.map((d) => {
                    const status = getDiscountStatus(d);
                    return (
                      <tr key={d.id} className={selectedIds.includes(d.id) ? "bg-light-primary" : ""}>
                        <td className="ps-4">
                          <Form.Check
                            type="checkbox"
                            checked={selectedIds.includes(d.id)}
                            onChange={() => handleSelectOne(d.id)}
                          />
                        </td>
                        <td className="px-2">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-2 text-warning">
                              <FaTag size={14} />
                            </div>
                            <span className="fw-bold text-primary">{d.code}</span>
                          </div>
                        </td>
                        <td>
                          <span className="fw-semibold">{d.name}</span>
                          {d.description && (
                            <div className="text-muted small">{d.description}</div>
                          )}
                        </td>
                        <td>
                          {d.discountType === "PERCENTAGE" ? (
                            <Badge bg="info" className="px-2 py-1">
                              <FaPercent className="me-1" size={10} />
                              Phần trăm
                            </Badge>
                          ) : (
                            <Badge bg="success" className="px-2 py-1">
                              <FaMoneyBillWave className="me-1" size={10} />
                              Cố định
                            </Badge>
                          )}
                        </td>
                        <td>
                          <span className="fw-bold">
                            {d.discountType === "PERCENTAGE"
                              ? `${d.discountValue}%`
                              : formatCurrency(d.discountValue)}
                          </span>
                          {d.maxDiscountAmount && (
                            <div className="text-muted small">
                              Tối đa: {formatCurrency(d.maxDiscountAmount)}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="small">
                            <div>Từ: {formatDateTime(d.startDate)}</div>
                            <div>Đến: {formatDateTime(d.endDate)}</div>
                          </div>
                        </td>
                        <td>
                          <Badge bg={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="text-end px-4">
                          <Button
                            variant="light"
                            size="sm"
                            className="me-2 text-primary shadow-sm"
                            onClick={() => handleShowModal(d)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            className="text-danger shadow-sm"
                            onClick={() => handleDelete(d.id)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      {/* MODAL SECTION */}
      <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static" size="lg">
        <Form>
          <Modal.Header closeButton className="border-0 px-4 pt-4">
            <Modal.Title className="fw-bold">
              {editDiscount ? "Sửa mã giảm giá" : "Thêm mã giảm giá mới"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 pb-4">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Mã giảm giá *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="VD: SALE10, NEWYEAR2024..."
                    className="bg-light border-0 shadow-none text-uppercase"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Tên chương trình *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="VD: Giảm giá mùa hè..."
                    className="bg-light border-0 shadow-none"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Mô tả chi tiết chương trình khuyến mãi..."
                className="bg-light border-0 shadow-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Loại giảm giá *</Form.Label>
                  <Form.Select
                    className="bg-light border-0 shadow-none"
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value })
                    }
                  >
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">
                    Giá trị giảm *{" "}
                    {formData.discountType === "PERCENTAGE" ? "(%)" : "(VNĐ)"}
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder={
                      formData.discountType === "PERCENTAGE" ? "10" : "50000"
                    }
                    className="bg-light border-0 shadow-none"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">
                    Giảm tối đa (VNĐ)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder="100000"
                    className="bg-light border-0 shadow-none"
                    value={formData.maxDiscountAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscountAmount: e.target.value })
                    }
                    disabled={formData.discountType !== "PERCENTAGE"}
                  />
                  <Form.Text className="text-muted">
                    Chỉ áp dụng cho loại phần trăm
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">
                    Đơn tối thiểu (VNĐ)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder="200000"
                    className="bg-light border-0 shadow-none"
                    value={formData.minOrderValue}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderValue: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Ngày bắt đầu *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    className="bg-light border-0 shadow-none"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Ngày kết thúc *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    className="bg-light border-0 shadow-none"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>





            <Form.Group className="mb-0">
              <Form.Check
                type="switch"
                id="isActive"
                label="Kích hoạt mã giảm giá"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 px-4 pb-4">
            <Button
              variant="light"
              className="fw-bold px-4 shadow-sm"
              onClick={handleCloseModal}
            >
              Huỷ
            </Button>
            <Button
              variant="primary"
              className="fw-bold px-4 shadow-sm"
              onClick={handleSave}
            >
              {editDiscount ? "Cập nhật" : "Tạo mới"}
            </Button>
          </Modal.Footer>
        </Form >
      </Modal >
    </div >
  );
}
