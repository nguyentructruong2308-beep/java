import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { confirmSwal, successSwal, errorSwal } from "../../utils/swal";
import { Table, Form, Badge, Button, Modal, Spinner, Alert, Card, Container, Row, Col, InputGroup } from "react-bootstrap";
import { FaBox, FaTruck, FaEye, FaSearch, FaSyncAlt, FaUser, FaCreditCard, FaPrint } from "react-icons/fa";

export default function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState("");

  const [activeTab, setActiveTab] = useState("ALL");

  const statusMap = {
    ALL: "Tất cả đơn",
    PENDING: "Chờ xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPED: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy"
  };

  const statusOptions = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  const getStatusVariant = (status) => {
    switch (status) {
      case "PENDING": return "secondary";
      case "PROCESSING": return "primary";
      case "SHIPPED": return "info";
      case "DELIVERED": return "success";
      case "CANCELLED": return "danger";
      default: return "light";
    }
  };

  const filteredOrders = activeTab === "ALL"
    ? orders
    : orders.filter(o => o.status === activeTab);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/orders/all");
      setOrders(res.data);
    } catch {
      setError("Không thể tải danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status?status=${newStatus}`);
      fetchOrders();
      successSwal("Đã cập nhật!", `Trạng thái đơn hàng #${orderId} đã được chuyển sang ${statusMap[newStatus]}.`);
    } catch {
      errorSwal("Lỗi!", "Không thể cập nhật trạng thái đơn hàng.");
    }
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder || !trackingNumber.trim()) {
      errorSwal("Thông báo", "Vui lòng nhập mã vận đơn trước khi lưu.");
      return;
    }
    try {
      await API.put(`/orders/${selectedOrder.id}/tracking`, null, {
        params: { trackingNumber: trackingNumber }
      });
      setShowTrackingModal(false);
      fetchOrders();
      successSwal("Thành công!", "Mã vận đơn đã được cập nhật cho đơn hàng.");
    } catch (err) {
      errorSwal("Lỗi!", "Không thể cập nhật mã vận đơn. " + (err.response?.data?.message || ""));
    }
  };

  const openTrackingModal = (order) => {
    setSelectedOrder(order);
    setTrackingNumber(order.trackingNumber || "");
    setShowTrackingModal(true);
  };

  const handleShowItems = (items) => {
    setSelectedOrderItems(items);
    setShowItemsModal(true);
  };

  const money = (v) => Number(v)?.toLocaleString("vi-VN") || v;

  // ========== PRINT INVOICE FUNCTION ==========
  const printInvoice = (order) => {
    const invoiceWindow = window.open('', '_blank', 'width=900,height=800');

    const subtotal = order.orderItems?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;
    const shippingFee = order.shippingFee || 0;
    const total = order.totalAmount || subtotal + shippingFee;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>Hóa đơn ICREAM #${order.id}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">
        <style>
          :root { --primary: #ff758c; --secondary: #ff7eb3; --text: #2d3436; --light: #f8f9fa; }
          * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
          body { padding: 50px; background: #fff; color: var(--text); line-height: 1.6; }
          
          /* Header Luxury */
          .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 40px; border-bottom: 3px solid var(--primary); margin-bottom: 40px; }
          .brand { display: flex; align-items: center; gap: 15px; }
          .logo-placeholder { width: 60px; height: 60px; background: var(--primary); border-radius: 15px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 30px; }
          .brand-info h1 { font-size: 32px; font-weight: 800; color: var(--primary); letter-spacing: 2px; }
          .header-meta { text-align: right; }
          .header-meta h2 { font-size: 24px; font-weight: 700; color: #ddd; text-transform: uppercase; margin-bottom: 5px; }
          
          /* Grid Info */
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 50px; }
          .info-box h3 { font-size: 13px; text-transform: uppercase; color: var(--primary); letter-spacing: 1px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .info-box p { margin-bottom: 8px; font-size: 14px; }
          .info-box strong { font-weight: 700; }

          /* Table Style */
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: var(--light); color: var(--text); padding: 15px 12px; text-align: left; font-size: 12px; font-weight: 700; text-transform: uppercase; border-bottom: 2px solid #eee; }
          td { padding: 18px 12px; border-bottom: 1px solid #f1f1f1; font-size: 14px; }
          .product-name { font-weight: 600; color: var(--primary); }
          .toppings { display: block; font-size: 12px; color: #888; margin-top: 4px; font-style: italic; }
          
          /* Footer & Totals */
          .footer-section { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 40px; margin-top: 20px; }
          .notes-box { padding: 20px; background: var(--light); border-radius: 15px; font-size: 13px; color: #666; }
          .totals-table { width: 100%; }
          .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; }
          .total-row.final { border-bottom: none; border-top: 2px solid var(--primary); margin-top: 10px; padding: 20px 0; font-size: 20px; font-weight: 800; color: var(--primary); }

          /* Signature */
          .signature-area { display: flex; justify-content: space-between; margin-top: 80px; text-align: center; }
          .sig-box { width: 200px; }
          .sig-box p { font-size: 12px; color: #999; margin-bottom: 60px; }
          .sig-name { font-weight: 700; border-top: 1px solid #eee; padding-top: 10px; }

          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            <div class="logo-placeholder">🍦</div>
            <div class="brand-info">
              <h1>ICREAM</h1>
              <p style="font-size: 11px; color: #888;">Thế giới kem tươi thượng hạng</p>
            </div>
          </div>
          <div class="header-meta">
            <h2>Hóa Đơn</h2>
            <p style="font-weight: 600;">#${order.id}</p>
            <p style="font-size: 12px; color: #999;">Ngày: ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <h3>Cửa hàng cung cấp</h3>
            <p><strong>ICREAM VIETNAM</strong></p>
            <p>Địa chỉ: 20 Tăng Nhơn Phú, Thủ Đức, TP.HCM</p>
            <p>Hotline: 1900 2812</p>
            <p>Email: tnicream@gmail.com</p>
          </div>
          <div class="info-box">
            <h3>Khách hàng nhận hàng</h3>
            <p><strong>${order.recipientName || 'Khách hàng'}</strong></p>
            <p>SĐT: ${order.recipientPhone || 'N/A'}</p>
            <p>Địa chỉ: ${order.shippingAddressSnapshot || 'N/A'}</p>
            <p>Thành toán: ${order.paymentMethod} (${order.paymentStatus})</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 45%;">Tên sản phẩm / Topping</th>
              <th style="text-align: center;">Số lượng</th>
              <th style="text-align: right;">Đơn giá</th>
              <th style="text-align: right;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderItems?.map(item => `
              <tr>
                <td>
                  <span class="product-name">${item.productName || 'Sản phẩm'}</span>
                  ${item.isGift ? '<span style="background: #27ae60; color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 5px; vertical-align: middle; font-weight: bold;">QUÀ TẶNG</span>' : ''}
                  ${item.toppings && item.toppings.length > 0 ?
        `<span class="toppings">+ ${item.toppings.map(t => t.toppingName).join(', ')}</span>` : ''}
                </td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${Number(item.unitPrice).toLocaleString('vi-VN')} ₫</td>
                <td style="text-align: right;"><strong>${Number(item.totalPrice).toLocaleString('vi-VN')} ₫</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer-section">
          <div class="notes-box">
            <p><strong>Ghi chú đơn hàng:</strong></p>
            <p style="margin-top: 5px;">${order.notes || 'Không có ghi chú.'}</p>
          </div>
          <div class="totals-table">
            <div class="total-row">
              <span>Tạm tính</span>
              <span>${Number(subtotal).toLocaleString('vi-VN')} ₫</span>
            </div>
            <div class="total-row">
              <span>Phí vận chuyển</span>
              <span>${Number(shippingFee).toLocaleString('vi-VN')} ₫</span>
            </div>
            <div class="total-row final">
              <span>TỔNG CỘNG</span>
              <span>${Number(total).toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>
        </div>

        <div class="signature-area">
          <div class="sig-box">
            <p>Khách hàng ký tên</p>
            <div class="sig-name">Người mua hàng</div>
          </div>
          <div class="sig-box">
            <p>Đại diện ICREAM</p>
            <div class="sig-name">Người lập phiếu</div>
          </div>
        </div>

        <p style="text-align: center; margin-top: 50px; font-size: 11px; color: #ccc;">
          Cảm ơn quý khách đã tin tưởng ICREAM. Chúc bạn một ngày ngọt ngào!
        </p>

        <script>
          window.onload = function() {
            setTimeout(() => window.print(), 500);
          }
        </script>
      </body>
      </html>
    `;

    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
  };


  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }} className="pb-5">
      <Container fluid="lg" className="py-4">

        {/* HEADER SECTION */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <h4 className="fw-bolder text-dark mb-1">Quản lý đơn hàng</h4>
            <p className="text-muted mb-0 small">Theo dõi và cập nhật trạng thái vận chuyển</p>
          </div>
          <div className="mt-3 mt-md-0">
            <Button variant="white" className="shadow-sm bg-white border-0 text-primary fw-bold" onClick={fetchOrders}>
              <FaSyncAlt className={`me-2 ${loading ? 'fa-spin' : ''}`} /> Làm mới dữ liệu
            </Button>
          </div>
        </div>

        {/* TODAY'S ORDERS SECTION */}
        {(() => {
          const today = new Date().toISOString().slice(0, 10);
          const todayOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(today));

          if (todayOrders.length > 0) return (
            <div className="mb-5 animate__animated animate__fadeIn">
              <h5 className="fw-bold text-primary mb-3"><FaBox className="me-2" />Đơn hàng hôm nay ({todayOrders.length})</h5>
              <Row className="g-3">
                {todayOrders.map(order => (
                  <Col md={4} key={'today-' + order.id}>
                    <Card className="border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #0d6efd' }}>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold text-dark">#{order.id}</span>
                          <Badge bg={getStatusVariant(order.status)} className="rounded-pill px-2">{statusMap[order.status]}</Badge>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <div className="rounded-circle bg-light p-1 me-2 text-primary" style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaUser size={10} /></div>
                          <span className="small fw-medium text-truncate">{order.recipientName || order.user.firstName}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
                          <span className="fw-bold text-danger">{money(order.totalAmount)} ₫</span>
                          <Button size="sm" variant="outline-primary" className="py-0 px-2" style={{ fontSize: '0.75rem' }} onClick={() => { setSelectedOrder(order); setShowItemsModal(true); }}>
                            Chi tiết
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          );
        })()}

        {/* FILTER TABS */}
        <div className="mb-4 d-flex flex-wrap gap-2">
          {Object.keys(statusMap).map(key => (
            <Button
              key={key}
              variant={activeTab === key ? "primary" : "white"}
              className={`shadow-sm rounded-pill px-4 fw-bold border-0 ${activeTab !== key ? 'text-muted' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {statusMap[key]}
            </Button>
          ))}
        </div>

        {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}

        {/* MAIN ORDERS TABLE CARD */}
        <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Card.Body className="p-0">
            <Table hover responsive className="align-middle mb-0">
              <thead className="bg-light text-muted uppercase small fw-bold">
                <tr>
                  <th className="px-4 py-3 border-0">Mã ĐH</th>
                  <th className="border-0">Khách hàng</th>
                  <th className="border-0 text-center">Tổng tiền</th>
                  <th className="border-0 text-center">Thanh toán</th>
                  <th className="border-0">Trạng thái vận chuyển</th>
                  <th className="border-0 text-end px-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                      Đang tải dữ liệu đơn hàng...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">Không có đơn hàng nào ở trạng thái này</td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td className="px-4 fw-bold text-primary">#{order.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-light p-2 me-2 text-secondary">
                            <FaUser size={14} />
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{order.recipientName || order.user.firstName + ' ' + order.user.lastName}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{order.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center fw-bold text-dark">{money(order.totalAmount)} ₫</td>
                      <td className="text-center">
                        <div className="small fw-bold text-uppercase">{order.paymentMethod}</div>
                        <Badge bg={order.paymentStatus === 'PAID' ? 'success' : 'warning'} className="bg-opacity-10 text-dark fw-normal border">
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td>
                        <Form.Select
                          size="sm"
                          className="mb-1 shadow-none border-light-subtle"
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          style={{ fontSize: '0.8rem', borderRadius: '6px' }}
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{statusMap[status]}</option>
                          ))}
                        </Form.Select>
                        <div className="d-flex align-items-center gap-2">
                          <Badge bg={getStatusVariant(order.status)} className="fw-normal px-2 py-1 rounded-pill">
                            {statusMap[order.status]}
                          </Badge>
                          {order.trackingNumber && (
                            <small className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                              <FaTruck className="me-1" />{order.trackingNumber}
                            </small>
                          )}
                        </div>
                      </td>
                      <td className="text-end px-4">
                        <div className="d-flex flex-column gap-1">
                          <Button size="sm" variant="light" className="text-primary shadow-sm fw-bold border" onClick={() => { setSelectedOrder(order); setShowItemsModal(true); }}>
                            <FaEye className="me-1" /> Chi tiết
                          </Button>
                          <Button size="sm" variant="primary" className="shadow-sm fw-bold" onClick={() => openTrackingModal(order)}>
                            <FaTruck className="me-1" /> Tracking
                          </Button>
                          <Button size="sm" variant="success" className="shadow-sm fw-bold" onClick={() => printInvoice(order)}>
                            <FaPrint className="me-1" /> Hóa đơn
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
      </Container>

      {/* MODAL: TRACKING */}
      <Modal show={showTrackingModal} onHide={() => setShowTrackingModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Cập nhật vận đơn</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-0">
          <p className="text-muted small mb-3">Nhập mã vận đơn cho đơn hàng <strong className="text-primary">#{selectedOrder?.id}</strong></p>
          <Form.Group>
            <Form.Label className="fw-bold small">Mã vận đơn (Tracking Number)</Form.Label>
            <Form.Control
              type="text"
              className="bg-light border-0 py-2 shadow-none"
              value={trackingNumber}
              onChange={e => setTrackingNumber(e.target.value)}
              placeholder="VD: GHN123456789"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-4">
          <Button variant="light" className="fw-bold px-4" onClick={() => setShowTrackingModal(false)}>Huỷ</Button>
          <Button variant="primary" className="fw-bold px-4 shadow-sm" onClick={handleSaveTracking}>Lưu mã vận đơn</Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL: ORDER DETAILS (UPGRADED) */}
      <Modal size="lg" show={showItemsModal} onHide={() => setShowItemsModal(false)} centered scrollable>
        <Modal.Header closeButton className="border-0 px-4 pt-4 bg-light">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <FaBox className="text-primary" /> Chi tiết đơn hàng #{selectedOrder?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-4">
          {selectedOrder && (
            <>
              {/* TIMELINE */}
              <div className="order-timeline d-flex justify-content-between mb-5 position-relative px-3 mt-2">
                <div className="position-absolute top-50 start-0 w-100 bg-light-subtle h-2px" style={{ zIndex: 0, marginTop: '-15px', height: '2px', backgroundColor: '#e9ecef' }}></div>
                {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((s, i, arr) => {
                  const currentIndex = arr.indexOf(selectedOrder.status);
                  const isCompleted = i <= currentIndex && selectedOrder.status !== 'CANCELLED';
                  return (
                    <div key={s} className="text-center position-relative" style={{ zIndex: 1, width: '25%' }}>
                      <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2 shadow-sm ${isCompleted ? 'bg-primary text-white' : 'bg-white text-muted border'}`} style={{ width: '30px', height: '30px', fontSize: '12px' }}>
                        {isCompleted ? '✓' : i + 1}
                      </div>
                      <div className={`small fw-bold ${isCompleted ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>{statusMap[s]}</div>
                    </div>
                  );
                })}
              </div>

              <Row className="g-4 mb-4">
                <Col md={6}>
                  <div className="p-3 rounded-4 bg-light border-0 h-100">
                    <h6 className="fw-bold border-bottom pb-2 mb-3 text-primary"><FaUser className="me-2" /> Thông tin người nhận</h6>
                    <p className="mb-1 small"><strong>Họ tên:</strong> {selectedOrder.recipientName || 'N/A'}</p>
                    <p className="mb-1 small"><strong>SĐT:</strong> {selectedOrder.recipientPhone || 'N/A'}</p>
                    <p className="mb-1 small"><strong>Địa chỉ:</strong> {selectedOrder.shippingAddressSnapshot}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 rounded-4 bg-light border-0 h-100">
                    <h6 className="fw-bold border-bottom pb-2 mb-3 text-primary"><FaCreditCard className="me-2" /> Thanh toán</h6>
                    <p className="mb-1 small"><strong>Phương thức:</strong> <Badge bg="info" className="text-dark fw-normal">{selectedOrder.paymentMethod}</Badge></p>
                    <p className="mb-1 small"><strong>Trạng thái:</strong> <Badge bg={selectedOrder.paymentStatus === 'PAID' ? 'success' : 'warning'} className="fw-normal">{selectedOrder.paymentStatus}</Badge></p>
                    <p className="mb-1 small text-muted mt-2">Ngày đặt: {new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN', { height: '100%', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </Col>
              </Row>

              <h6 className="fw-bold mb-3">Danh sách sản phẩm</h6>
              <Table responsive hover className="align-middle border rounded-3 overflow-hidden mb-0">
                <thead className="bg-light small text-muted text-uppercase">
                  <tr>
                    <th className="border-0 py-3 ps-3">Sản phẩm</th>
                    <th className="border-0 text-center">SL</th>
                    <th className="border-0 text-end">Đơn giá</th>
                    <th className="border-0 text-end pe-3">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.orderItems.map(item => (
                    <tr key={item.id}>
                      <td className="ps-3">
                        <div className="fw-bold text-dark">
                          {item.productName}
                          {item.isGift && <Badge bg="success" className="ms-2" style={{ fontSize: '0.65rem' }}>QUÀ TẶNG</Badge>}
                        </div>
                        {item.toppings && item.toppings.length > 0 && (
                          <div className="text-muted small fst-italic">
                            Topping: {item.toppings.map(t => t.toppingName).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end text-muted">{money(item.unitPrice)}</td>
                      <td className="text-end fw-bold text-dark pe-3">{money(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-light">
                  <tr>
                    <td colSpan="3" className="text-end py-2 text-muted small">Tạm tính:</td>
                    <td className="text-end fw-bold py-2 pe-3">{money(selectedOrder.totalAmount - (selectedOrder.shippingFee || 0))}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end py-2 text-muted small">Phí vận chuyển:</td>
                    <td className="text-end fw-bold py-2 pe-3">{money(selectedOrder.shippingFee || 0)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end py-3 text-dark fw-bold">TỔNG CỘNG:</td>
                    <td className="text-end fw-bold text-danger fs-6 py-3 pe-3">{money(selectedOrder.totalAmount)}</td>
                  </tr>
                </tfoot>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 px-4 pb-4">
          <Button variant="dark" className="fw-bold px-4 rounded-pill shadow-sm" onClick={() => setShowItemsModal(false)}>Đóng</Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}