import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import API from '../../api/api';
import { FaTag, FaCheck, FaTimes, FaMapMarkerAlt, FaCreditCard, FaWallet, FaTruck, FaArrowLeft, FaReceipt, FaArrowRight, FaStore } from 'react-icons/fa';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Discount state
  const [discountCode, setDiscountCode] = useState(location.state?.appliedDiscount?.code || '');
  const [discountInfo, setDiscountInfo] = useState(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const [discountSuccess, setDiscountSuccess] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Styles
  const styles = {
    pageWrapper: {
      background: 'radial-gradient(circle at top right, #fff5f5 0%, #fff 50%, #f0fff4 100%)',
      minHeight: '100vh',
      paddingTop: '3rem',
      paddingBottom: '5rem'
    },
    glassCard: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(15px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '24px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
      padding: '2rem',
      marginBottom: '2rem'
    },
    paymentTile: {
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      borderRadius: '20px',
      border: '2px solid transparent',
      padding: '1.5rem',
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
    },
    paymentTileActive: {
      borderColor: '#ff9f43',
      backgroundColor: '#fffaf5',
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 25px rgba(255, 159, 67, 0.15)'
    },
    summaryLabel: {
      fontSize: '0.9rem',
      color: '#666',
      fontWeight: '500'
    },
    summaryValue: {
      fontWeight: '700',
      color: '#2d3436'
    }
  };

  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        setLoading(true);
        const [cartRes, totalRes, addressRes] = await Promise.all([
          API.get('/cart'),
          API.get('/cart/total'),
          API.get('/addresses')
        ]);

        if (cartRes.data.length === 0) {
          navigate('/cart');
          return;
        }

        const currentTotal = Number(totalRes.data || 0);
        setCartItems(cartRes.data);
        setTotal(currentTotal);
        setAddresses(addressRes.data);

        if (location.state?.appliedDiscount) {
          setDiscountInfo({
            discount: location.state.appliedDiscount,
            discountAmount: location.state.discountAmount,
            finalTotal: currentTotal - location.state.discountAmount
          });
          setDiscountSuccess(`Áp dụng mã "${location.state.appliedDiscount.code.toUpperCase()}" thành công!`);
        }

        const defaultAddress = addressRes.data.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else if (addressRes.data.length > 0) {
          setSelectedAddressId(addressRes.data[0].id);
        }

      } catch (err) {
        setError("Không thể tải trang thanh toán. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    loadCheckoutData();
  }, [navigate, location.state]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Vui lòng nhập mã giảm giá');
      return;
    }
    setDiscountLoading(true);
    setDiscountError('');
    setDiscountSuccess('');
    try {
      const res = await API.post('/discounts/calculate', null, {
        params: { code: discountCode.trim(), orderTotal: total }
      });
      setDiscountInfo(res.data);
      setDiscountSuccess(`Mã "${discountCode.toUpperCase()}" đã được áp dụng!`);
    } catch (err) {
      setDiscountError(err.response?.data?.message || 'Mã giảm giá không hợp lệ');
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountCode('');
    setDiscountInfo(null);
    setDiscountError('');
    setDiscountSuccess('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedAddressId) {
      setError("Vui lòng chọn hoặc thêm mới một địa chỉ giao hàng.");
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const params = { addressId: selectedAddressId, paymentMethod };
      if (discountInfo && discountCode) {
        params.discountCode = discountCode.trim().toUpperCase();
      }
      const orderRes = await API.post('/orders', null, { params });
      const newOrder = orderRes.data;
      if (paymentMethod === 'COD') {
        navigate(`/order-success/${newOrder.id}`);
      } else {
        const paymentRes = await API.post('/payments/create', { orderId: newOrder.id });
        window.location.href = paymentRes.data.paymentUrl;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const money = (v) => v ? Number(v).toLocaleString("vi-VN") + " ₫" : "0 ₫";
  const finalAmount = discountInfo ? discountInfo.finalTotal : total;
  const discountAmount = discountInfo ? discountInfo.discountAmount : 0;

  if (loading) return (
    <div style={styles.pageWrapper} className="d-flex align-items-center justify-content-center">
      <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
    </div>
  );

  return (
    <div style={styles.pageWrapper}>
      <Container>
        <div className="mb-5">
          <Link to="/cart" className="text-decoration-none text-muted fw-bold d-flex align-items-center gap-2 mb-3">
            <FaArrowLeft /> Quay lại giỏ hàng
          </Link>
          <h1 className="fw-bold display-5">Thanh toán</h1>
          <p className="text-muted">Hoàn tất đơn hàng tuyệt vời của bạn</p>
        </div>

        {error && <Alert variant="danger" className="rounded-4 shadow-sm py-3 mb-4 border-0 animate-shake">{error}</Alert>}

        <Row className="g-4">
          <Col lg={8}>
            <Form onSubmit={handlePlaceOrder}>
              {/* Address Section */}
              <div style={styles.glassCard}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold mb-0 d-flex align-items-center">
                    <FaMapMarkerAlt className="text-danger me-2" /> Địa chỉ nhận hàng
                  </h4>
                  <Link to="/profile" className="btn btn-outline-dark rounded-pill btn-sm px-3 fw-bold">Quản lý</Link>
                </div>

                {addresses.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {addresses.map(addr => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-3 rounded-4 border-2 pointer-cursor transition-all ${selectedAddressId === addr.id ? 'border-primary bg-white shadow-sm' : 'border-light opacity-75'}`}
                        style={{ cursor: 'pointer', transition: '0.2s' }}
                      >
                        <div className="d-flex align-items-start gap-3">
                          <Form.Check
                            type="radio"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                          />
                          <div>
                            <div className="fw-bold mb-1">{addr.fullName} <span className="text-muted fw-normal">| {addr.phone}</span></div>
                            <div className="small text-muted">{`${addr.street}, ${addr.ward}, ${addr.district}, ${addr.city}`}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert variant="warning" className="rounded-4">Chưa có địa chỉ. Vui lòng thêm địa chỉ trong Profile.</Alert>
                )}
              </div>


              {/* Branch System Info */}
              <div style={styles.glassCard}>
                <h4 className="fw-bold mb-3 d-flex align-items-center">
                  <FaStore className="text-success me-2" /> Hệ thống chi nhánh (Miễn phí ship)
                </h4>
                <Alert variant="light" className="border-0 shadow-sm rounded-4 mb-3">
                  <small className="text-muted d-block mb-2">Đơn hàng sẽ được <b>Miễn phí vận chuyển</b> nếu địa chỉ nhận hàng thuộc các khu vực sau:</small>
                  <Row className="g-2">
                    {['Thủ Đức', 'Quận 7', 'Quận 1', 'Bình Thạnh'].map((branch, idx) => (
                      <Col xs={6} key={idx}>
                        <div className="d-flex align-items-center gap-2 p-2 rounded-3 bg-white border">
                          <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 20, height: 20, fontSize: '10px' }}>{idx + 1}</div>
                          <span className="fw-bold small">{branch}</span>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Alert>
              </div>

              {/* Shipping Check Logic */}
              {(() => {
                const selectedAddr = addresses.find(a => a.id === selectedAddressId);
                if (!selectedAddr) return null;

                const city = selectedAddr.city ? selectedAddr.city.toLowerCase().trim() : "";
                const isValidCity = city.includes("hồ chí minh") || city.includes("hcm") || city.includes("ho chi minh") || city.includes("sài gòn");

                if (!isValidCity) {
                  return (
                    <Alert variant="danger" className="rounded-4 mb-4 border-0 shadow-sm animate-shake">
                      <FaTimes className="me-2" />
                      Hiện tại Shop chỉ nhận giao hàng trong khu vực <b>TP. Hồ Chí Minh</b>. Vui lòng chọn địa chỉ khác.
                    </Alert>
                  );
                }

                const district = selectedAddr.district ? selectedAddr.district.toLowerCase().trim() : "";
                const isShopDelivery = district.includes("thủ đức") || district.includes("thu duc") ||
                  district.includes("quận 7") || district.includes("quan 7") ||
                  (district.includes("quận 1") && !district.includes("10") && !district.includes("11") && !district.includes("12")) ||
                  (district.includes("quan 1") && !district.includes("10") && !district.includes("11") && !district.includes("12")) ||
                  district.includes("bình thạnh") || district.includes("binh thanh");

                return (
                  <Alert variant={isShopDelivery ? "success" : "info"} className="rounded-4 mb-4 border-0 shadow-sm">
                    <FaTruck className="me-2" />
                    {isShopDelivery
                      ? <span>Đơn hàng được <b>Shop tự giao hàng</b> (Tiêu chuẩn).</span>
                      : <span>Khu vực này Shop sẽ <b>đặt Grab giao hàng</b>. Quý khách vui lòng thanh toán phí ship cho tài xế.</span>
                    }
                  </Alert>
                );
              })()}

              {/* Payment Section */}
              <div style={styles.glassCard}>
                <h4 className="fw-bold mb-4 d-flex align-items-center">
                  <FaCreditCard className="text-primary me-2" /> Phương thức thanh toán
                </h4>

                <Row className="g-3">
                  <Col md={4}>
                    <div
                      style={{ ...styles.paymentTile, ...(paymentMethod === 'COD' ? styles.paymentTileActive : {}) }}
                      onClick={() => setPaymentMethod('COD')}
                    >
                      <FaTruck size={32} className={paymentMethod === 'COD' ? 'text-primary' : 'text-muted'} />
                      <span className="fw-bold">Tiền mặt (COD)</span>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div
                      style={{ ...styles.paymentTile, ...(paymentMethod === 'MOMO' ? styles.paymentTileActive : {}) }}
                      onClick={() => setPaymentMethod('MOMO')}
                    >
                      <FaWallet size={32} style={{ color: paymentMethod === 'MOMO' ? '#A50064' : '#6c757d' }} />
                      <span className="fw-bold">Ví MoMo</span>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div
                      style={{ ...styles.paymentTile, ...(paymentMethod === 'VNPAY' ? styles.paymentTileActive : {}) }}
                      onClick={() => setPaymentMethod('VNPAY')}
                    >
                      <FaCreditCard size={32} style={{ color: paymentMethod === 'VNPAY' ? '#005BA1' : '#6c757d' }} />
                      <span className="fw-bold">VNPAY</span>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Voucher Section */}
              <div style={styles.glassCard}>
                <h4 className="fw-bold mb-4 d-flex align-items-center">
                  <FaTag className="text-warning me-2" /> Mã giảm giá
                </h4>

                {!discountInfo ? (
                  <div className="d-flex gap-2">
                    <Form.Control
                      className="rounded-pill p-3 border-2"
                      placeholder="Nhập mã voucher ngay..."
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                    />
                    <Button
                      variant="dark"
                      className="rounded-pill px-4 fw-bold"
                      onClick={handleApplyDiscount}
                      disabled={discountLoading || !discountCode}
                    >
                      {discountLoading ? <Spinner size="sm" /> : 'Áp dụng'}
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white p-3 rounded-4 border-2 border-success d-flex justify-content-between align-items-center shadow-sm">
                    <div className="text-success fw-bold">
                      <FaCheck className="me-2" /> Đã áp dụng: {discountInfo.discount?.code}
                    </div>
                    <Button variant="link" className="text-danger fw-bold" onClick={handleRemoveDiscount}>Gỡ bỏ</Button>
                  </div>
                )}
                {discountError && <div className="text-danger small mt-2 ms-2 fw-bold">{discountError}</div>}
              </div>
            </Form>
          </Col>

          <Col lg={4}>
            <div style={{ ...styles.glassCard, position: 'sticky', top: '100px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }} className="shadow-lg">
              <h4 className="fw-bold mb-4 d-flex align-items-center">
                <FaReceipt className="text-dark me-2" /> Tóm tắt đơn hàng
              </h4>

              <div className="mb-4" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {cartItems.map(item => (
                  <div key={item.id} className="d-flex justify-content-between mb-2">
                    <span className="text-muted small w-75 text-truncate">{item.productName} <b>x{item.quantity}</b></span>
                    <span className="small fw-bold">{money(item.totalPrice)}</span>
                  </div>
                ))}
              </div>

              <hr className="opacity-10" />

              <div className="d-flex flex-column gap-2 mb-4">
                <div className="d-flex justify-content-between">
                  <span style={styles.summaryLabel}>Tạm tính</span>
                  <span style={styles.summaryValue}>{money(total)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="d-flex justify-content-between text-success">
                    <span className="small fw-bold">Giảm giá voucher</span>
                    <span className="fw-bold">-{money(discountAmount)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between pt-2 border-top">
                  <span className="fs-5 fw-bold">Tổng cộng</span>
                  <span className="fs-4 fw-bold text-primary">{money(finalAmount)}</span>
                </div>
              </div>

              <Button
                variant="dark"
                size="lg"
                className="w-100 rounded-pill py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                onClick={handlePlaceOrder}
                disabled={submitting || addresses.length === 0}
              >
                {submitting ? <Spinner size="sm" /> : <>XÁC NHẬN ĐẶT HÀNG <FaArrowRight /></>}
              </Button>

              <p className="text-center text-muted small mt-3 mb-0">
                Bằng cách đặt hàng, bạn đồng ý với các điều khoản của chúng tôi.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
