import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { Table, Button, Form, Modal, Alert, InputGroup, Spinner } from "react-bootstrap";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ADD Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [addQty, setAddQty] = useState(1);
  const [productsLoading, setProductsLoading] = useState(false);

  // EDIT Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editQty, setEditQty] = useState(1);

  // Fetch cart
  const fetchCart = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/cart");
      setCartItems(res.data);

      const totalRes = await API.get("/cart/total");
      setTotal(Number(totalRes.data || 0));
    } catch (err) {
      console.error(err);
      setError("Không thể tải giỏ hàng!");
    } finally {
      setLoading(false);
    }
  };

  // Fetch products for Add modal
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await API.get("/products");
      const data = res.data?.content ?? res.data;
      setProducts(data || []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách sản phẩm.");
    } finally {
      setProductsLoading(false);
    }
  };

  // Run fetchCart **chỉ khi token có trong localStorage**
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      fetchCart();
    }
  }, []);

  // Add product to cart
  const handleAddSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedProductId) return setError("Vui lòng chọn sản phẩm.");
    if (!addQty || addQty < 1) return setError("Số lượng phải > 0.");

    try {
      await API.post(`/cart/add?productId=${selectedProductId}&quantity=${addQty}`);
      setSuccess("Thêm vào giỏ thành công.");
      setShowAddModal(false);
      setSelectedProductId("");
      setAddQty(1);
      fetchCart();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Thêm vào giỏ thất bại!");
    }
  };

  // Remove item
  const handleRemove = async (cartItemId) => {
    if (!window.confirm("Bạn có chắc muốn xoá sản phẩm này?")) return;
    setError("");
    setSuccess("");
    try {
      await API.delete(`/cart/${cartItemId}`);
      setSuccess("Xoá sản phẩm thành công.");
      fetchCart();
    } catch (err) {
      console.error(err);
      setError("Không thể xoá sản phẩm!");
    }
  };

  // Update quantity (inline)
  const handleQuantityChange = async (cartItemId, newQty) => {
    if (!newQty || newQty < 1) return;
    setError("");
    setSuccess("");
    try {
      await API.put(`/cart/${cartItemId}?quantity=${newQty}`);
      setSuccess("Cập nhật số lượng thành công.");
      fetchCart();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Không thể cập nhật số lượng!");
    }
  };

  // Open edit modal
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditQty(item.quantity || 1);
    setShowEditModal(true);
    setError("");
    setSuccess("");
  };

  // Save edit modal
  const handleEditSave = async () => {
    if (!editingItem) return;
    if (!editQty || editQty < 1) return setError("Số lượng phải > 0.");
    setError("");
    setSuccess("");
    try {
      await API.put(`/cart/${editingItem.id}?quantity=${editQty}`);
      setSuccess("Cập nhật thành công.");
      setShowEditModal(false);
      setEditingItem(null);
      fetchCart();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Cập nhật thất bại!");
    }
  };

  const money = (v) => {
    try { return Number(v).toLocaleString("vi-VN"); }
    catch { return v; }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Giỏ hàng của bạn</h1>

      {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}

      <div className="mb-3 d-flex justify-content-between align-items-center">
        <div>
          <Button
            variant="primary"
            className="me-2"
            onClick={() => { fetchProducts(); setShowAddModal(true); }}
          >
            Thêm sản phẩm
          </Button>
          <Button variant="danger" onClick={async () => {
            if (window.confirm("Xoá toàn bộ giỏ hàng?")) {
              try { await API.delete("/cart/clear"); fetchCart(); } catch { setError("Không xoá được!"); }
            }
          }}>
            Xoá toàn bộ giỏ
          </Button>
        </div>
        <div>
          <strong>Tổng cộng: </strong>
          <span className="text-success ms-2">{money(total)} ₫</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : cartItems.length === 0 ? (
        <p>Giỏ hàng trống.</p>
      ) : (
        <Table striped bordered hover responsive className="mb-3">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Giá</th>
              <th style={{ width: 140 }}>Số lượng</th>
              <th>Thành tiền</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map(item => (
              <tr key={item.id}>
                <td>
                  <div className="d-flex align-items-center">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.productName} style={{width:56,height:56,objectFit:"cover",marginRight:12}} className="rounded"/>}
                    <div>
                      <div className="fw-semibold">{item.productName}</div>
                      <div className="text-muted" style={{ fontSize: 13 }}>{item.productId ? `ID: ${item.productId}` : ""}</div>
                    </div>
                  </div>
                </td>
                <td className="text-success">{money(item.unitPrice)} ₫</td>
                <td>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const v = parseInt(e.target.value || 0, 10);
                        setCartItems(prev => prev.map(ci => ci.id === item.id ? { ...ci, quantity: v } : ci));
                      }}
                      onBlur={(e) => {
                        const v = parseInt(e.target.value || 0, 10);
                        if (v >= 1 && v !== item.quantity) handleQuantityChange(item.id, v);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const v = parseInt(e.target.value || 0, 10);
                          if (v >= 1) handleQuantityChange(item.id, v);
                        }
                      }}
                    />
                    <Button variant="outline-secondary" onClick={() => openEditModal(item)}>Sửa</Button>
                  </InputGroup>
                </td>
                <td>{money(item.totalPrice)} ₫</td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => handleRemove(item.id)}>Xoá</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* ADD Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Thêm sản phẩm vào giỏ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {productsLoading ? (
            <div className="text-center py-3"><Spinner animation="border" /></div>
          ) : (
            <Form onSubmit={handleAddSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Sản phẩm</Form.Label>
                <Form.Select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} required>
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} {p.price ? `- ${money(p.price)} ₫` : ""}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" style={{ maxWidth: 200 }}>
                <Form.Label>Số lượng</Form.Label>
                <Form.Control type="number" min="1" value={addQty} onChange={e => setAddQty(Math.max(1, parseInt(e.target.value||1,10)))} required/>
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowAddModal(false)}>Huỷ</Button>
                <Button variant="primary" type="submit">Thêm vào giỏ</Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* EDIT Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sửa số lượng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Sản phẩm</Form.Label>
            <div className="mb-2 fw-semibold">{editingItem?.productName}</div>
          </Form.Group>
          <Form.Group className="mb-3" style={{ maxWidth: 200 }}>
            <Form.Label>Số lượng</Form.Label>
            <Form.Control type="number" min="1" value={editQty} onChange={e => setEditQty(Math.max(1, parseInt(e.target.value||1,10)))}/>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Huỷ</Button>
          <Button variant="primary" onClick={handleEditSave}>Lưu</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
