import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import {
  FaBoxOpen, FaTags, FaShoppingCart, FaUsers, FaSignOutAlt,
  FaBars, FaTimes, FaTachometerAlt, FaUndo, FaImage, FaAngleRight, FaEdit, FaCommentDots, FaStar, FaBell, FaWarehouse, FaFire
} from "react-icons/fa";
import { Button, Nav, Container, Breadcrumb } from "react-bootstrap";
import NotificationService from "../../api/notificationService";

export default function Dashboard() {
  const { adminUser, adminLogout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Poll Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await NotificationService.getUnreadNotifications();
        setNotifications(res.data || []);
        setUnreadCount(res.data ? res.data.length : 0);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    fetchNotifications(); // Initial fetch
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s

    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notif) => {
    try {
      await NotificationService.markAsRead(notif.id);
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      setShowNotifications(false);

      if (notif.type === "REVIEW") {
        navigate("/admin/dashboard/reviews");
      }
    } catch (error) {
      console.error("Error clicking notification", error);
    }
  };

  // BẢNG MÀU CHUYÊN NGHIỆP (ENTERPRISE THEME)
  const colors = {
    sidebarBg: "#1e293b",       // Xanh than đậm (Deep Slate)
    sidebarText: "#94a3b8",     // Xám xanh (Slate Grey)
    sidebarTextActive: "#38bdf8", // Xanh da trời sáng (Sky Blue)
    sidebarBgActive: "rgba(56, 189, 248, 0.1)", // Nền active trong suốt
    mainBg: "#f1f5f9",          // Nền tổng thể xám rất nhạt
    accent: "#0ea5e9"           // Màu nhấn chính
  };

  const navLinks = [
    { to: "/admin/dashboard/statistics", icon: <FaTachometerAlt />, text: "Tổng quan" },
    { to: "/admin/dashboard/products", icon: <FaBoxOpen />, text: "Sản phẩm" },
    { to: "/admin/dashboard/categories", icon: <FaTags />, text: "Danh mục" },
    { to: "/admin/dashboard/toppings", icon: <FaTags />, text: "Topping" },
    { to: "/admin/dashboard/orders", icon: <FaShoppingCart />, text: "Đơn hàng" },
    { to: "/admin/dashboard/refunds", icon: <FaUndo />, text: "Hoàn tiền" },
    { to: "/admin/dashboard/discounts", icon: <FaTags />, text: "Mã giảm giá" },
    { to: "/admin/dashboard/deals", icon: <FaFire />, text: "Deal Xả kho" },
    { to: "/admin/dashboard/banners", icon: <FaImage />, text: "Giao diện" },
    { to: "/admin/dashboard/blogs", icon: <FaEdit />, text: "Bài viết" },
    { to: "/admin/dashboard/contacts", icon: <FaCommentDots />, text: "Lời nhắn" },
    { to: "/admin/dashboard/reviews", icon: <FaStar />, text: "Đánh giá" },
    { to: "/admin/dashboard/inventory", icon: <FaWarehouse />, text: "Kho hàng" },
    { to: "/admin/dashboard/users", icon: <FaUsers />, text: "Khách hàng" },
  ];

  // Helper lấy tên trang hiện tại
  const getCurrentPageName = () => {
    const currentLink = navLinks.find(link => location.pathname.startsWith(link.to));
    return currentLink ? currentLink.text : "Dashboard";
  };

  return (
    <div className="d-flex vh-100" style={{ backgroundColor: colors.mainBg, fontFamily: "'Inter', sans-serif" }}>

      {/* CSS Styles nội bộ */}
      <style>{`
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        /* Nav Link Styles */
        .nav-link-item {
            position: relative;
            transition: all 0.2s ease-in-out;
            color: ${colors.sidebarText} !important;
            border-left: 3px solid transparent;
        }
        .nav-link-item:hover {
            color: #f8fafc !important;
            background-color: rgba(255,255,255,0.05);
        }
        /* Active State */
        .nav-link-item.active {
            color: ${colors.sidebarTextActive} !important;
            background-color: ${colors.sidebarBgActive};
            border-left-color: ${colors.sidebarTextActive};
            font-weight: 600;
        }
      `}</style>

      {/* --- SIDEBAR --- */}
      <div
        className={`d-flex flex-column flex-shrink-0 shadow ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
        style={{
          backgroundColor: colors.sidebarBg,
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          width: isSidebarOpen ? "260px" : "72px",
          zIndex: 1020,
          overflowX: 'hidden'
        }}
      >
        {/* Header Sidebar */}
        <div className="d-flex align-items-center px-3 py-4 mb-2" style={{ height: '70px' }}>
          {/* Logo */}
          <div className="rounded-3 d-flex align-items-center justify-content-center me-3 fw-bolder flex-shrink-0"
            style={{ width: '32px', height: '32px', background: `linear-gradient(135deg, ${colors.accent}, #38bdf8)`, color: 'white' }}>
            A
          </div>

          {/* Text Admin Panel (Chỉ hiện khi mở sidebar) */}
          <span
            className={`fw-bold fs-5 text-white ${!isSidebarOpen && 'opacity-0'}`}
            style={{ whiteSpace: 'nowrap', transition: 'opacity 0.2s', letterSpacing: '0.5px' }}
          >
            ADMIN PANEL
          </span>
        </div>

        {/* Menu Items */}
        <Nav className="flex-column flex-nowrap flex-grow-1 px-2 gap-1" style={{ overflowY: 'auto' }}>
          {navLinks.map((link) => (
            <NavLink
              to={link.to}
              key={link.to}
              className={({ isActive }) =>
                `d-flex align-items-center text-decoration-none rounded-2 py-2 px-3 mb-1 nav-link-item ${isActive ? "active" : ""}`
              }
              style={{ whiteSpace: 'nowrap', cursor: 'pointer' }}
            >
              {({ isActive }) => (
                <>
                  <span className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '24px', height: '24px', fontSize: '1.1rem' }}>
                    {link.icon}
                  </span>

                  <span className={`ms-3 fw-medium ${!isSidebarOpen && 'opacity-0'}`} style={{ transition: 'opacity 0.2s', fontSize: '0.95rem' }}>
                    {link.text}
                  </span>

                  {isSidebarOpen && isActive && <FaAngleRight className="ms-auto" size={14} />}
                </>
              )}
            </NavLink>
          ))}
        </Nav>

        {/* Footer Sidebar (User) */}
        <div className="mt-auto p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className={`d-flex align-items-center mb-3 ${!isSidebarOpen && 'justify-content-center'}`}>
            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
              style={{ width: '36px', height: '36px', backgroundColor: '#334155' }}>
              {adminUser?.email?.charAt(0).toUpperCase() || 'A'}
            </div>

            {isSidebarOpen && (
              <div className="ms-3 overflow-hidden">
                <p className="mb-0 fw-semibold text-white text-truncate" style={{ fontSize: '0.9rem' }}>
                  {adminUser?.email?.split('@')[0]}
                </p>
                <small style={{ color: colors.sidebarText, fontSize: '0.75rem' }}>Administrator</small>
              </div>
            )}
          </div>

          <Button
            variant="outline-secondary"
            className="d-flex align-items-center justify-content-center w-100 border-0 py-2 text-danger bg-danger bg-opacity-10"
            onClick={adminLogout}
          >
            <FaSignOutAlt />
            {isSidebarOpen && <span className="ms-2 fw-medium">Đăng xuất</span>}
          </Button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">

        {/* Top Bar */}
        <div className="bg-white shadow-sm border-bottom px-4 py-3 d-flex justify-content-between align-items-center" style={{ height: '70px' }}>
          <div className="d-flex align-items-center">
            <Button variant="link" className="p-0 me-3 text-secondary text-decoration-none" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </Button>

            <Breadcrumb className="mb-0">
              <Breadcrumb.Item linkAs="span" className="text-muted">Admin</Breadcrumb.Item>
              <Breadcrumb.Item active className="fw-bold text-dark">{getCurrentPageName()}</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          {/* Notification Bell */}
          <div className="position-relative">
            <Button variant="light" className="position-relative border-0 bg-transparent text-secondary" onClick={() => setShowNotifications(!showNotifications)}>
              <FaBell size={20} />
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                  {unreadCount}
                </span>
              )}
            </Button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="position-absolute end-0 mt-2 bg-white shadow-lg rounded-3 border" style={{ width: '320px', zIndex: 1050, maxHeight: '400px', overflowY: 'auto' }}>
                <div className="p-2 border-bottom fw-bold text-muted small bg-light rounded-top">Thông báo mới</div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted small">Không có thông báo nào</div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className="p-3 border-bottom list-group-item-action cursor-pointer hover-bg-light"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleNotificationClick(notif)}>
                      <div className="d-flex justify-content-between mb-1">
                        <strong className="small text-dark">{notif.title}</strong>
                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>{new Date(notif.createdAt).toLocaleTimeString()}</small>
                      </div>
                      <p className="mb-0 text-secondary small text-truncate">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Nội dung trang con */}
        <div className="flex-grow-1 p-4 overflow-auto">
          <Container fluid="xxl" className="p-0 h-100">
            <Outlet />
          </Container>
        </div>
      </div>
    </div>
  );
}