import React from 'react';
import { Container, Row, Col, Nav, Tab } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import ProfileInformation from './profile/ProfileInformation';
import MyOrders from './profile/MyOrders';
import AddressManagement from './profile/AddressManagement';
import ChangePassword from './profile/ChangePassword';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBox, faMapMarkedAlt, faKey, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import '../../assets/css/ProfilePage.css'; // [MỚI] Import CSS xịn xò

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();

  React.useEffect(() => {
    if (refreshUser) refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="profile-page-wrapper">
      <Container className="py-5 position-relative" style={{ zIndex: 1 }}>
        <Tab.Container id="profile-tabs" defaultActiveKey="profile" transition={true}>
          <Row className="g-4">
            {/* --- SIDEBAR --- */}
            <Col lg={3}>
              <div className="profile-sidebar-card" data-aos="fade-right">
                {/* User Widget */}
                <div className="user-info-widget">
                  <div className="user-avatar-large">
                    {user.username ? user.username.charAt(0).toUpperCase() : <FontAwesomeIcon icon={faUser} />}
                  </div>
                  <h5 className="fw-bold mb-1">{user.firstName} {user.lastName}</h5>
                  <small className="text-muted d-block mb-2">{user.email}</small>
                  <div className="badge bg-danger bg-opacity-10 text-danger px-3 py-1 rounded-pill mb-2">Thành viên</div>
                  <div className="loyalty-points-badge d-flex align-items-center justify-content-center gap-2 py-1 px-3 rounded-pill"
                    style={{ background: 'linear-gradient(135deg, #ffd700, #ffa500)', color: '#fff', fontSize: '0.85rem', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(255, 165, 0, 0.3)' }}>
                    <span style={{ fontSize: '1.1rem' }}>⭐</span>
                    <span>{user.loyaltyPoints || 0} Điểm tích lũy</span>
                  </div>
                </div>

                {/* Navigation */}
                <Nav variant="pills" className="flex-column gap-2">
                  <Nav.Item className="profile-nav-item">
                    <Nav.Link eventKey="profile">
                      <FontAwesomeIcon icon={faUser} className="me-3" /> Thông tin tài khoản
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item className="profile-nav-item">
                    <Nav.Link eventKey="addresses">
                      <FontAwesomeIcon icon={faMapMarkedAlt} className="me-3" /> Sổ địa chỉ
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item className="profile-nav-item">
                    <Nav.Link eventKey="orders">
                      <FontAwesomeIcon icon={faBox} className="me-3" /> Đơn hàng của tôi
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item className="profile-nav-item">
                    <Nav.Link eventKey="password">
                      <FontAwesomeIcon icon={faKey} className="me-3" /> Đổi mật khẩu
                    </Nav.Link>
                  </Nav.Item>

                  <div className="my-3 border-top opacity-25"></div>

                  <Nav.Item className="profile-nav-item">
                    <Nav.Link onClick={logout} className="text-danger fw-bold" style={{ cursor: 'pointer' }}>
                      <FontAwesomeIcon icon={faSignOutAlt} className="me-3" /> Đăng xuất
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </div>
            </Col>

            {/* --- CONTENT --- */}
            <Col lg={9}>
              <div className="profile-content-card" data-aos="fade-up" data-aos-delay="100">
                <Tab.Content>
                  <Tab.Pane eventKey="profile">
                    <div className="profile-section-title">Hồ sơ cá nhân</div>
                    <ProfileInformation />
                  </Tab.Pane>
                  <Tab.Pane eventKey="addresses">
                    <div className="profile-section-title">Địa chỉ nhận hàng</div>
                    <AddressManagement />
                  </Tab.Pane>
                  <Tab.Pane eventKey="orders">
                    <div className="profile-section-title">Lịch sử đơn hàng</div>
                    <MyOrders />
                  </Tab.Pane>
                  <Tab.Pane eventKey="password">
                    <div className="profile-section-title">Bảo mật</div>
                    <ChangePassword />
                  </Tab.Pane>
                </Tab.Content>
              </div>
            </Col>
          </Row>
        </Tab.Container>
      </Container>
    </div>
  );
}
