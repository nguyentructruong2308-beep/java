import React from 'react';
import { Outlet } from 'react-router-dom';

// Layout components
import Header from './Header';
import Footer from './Footer';

/**
 * ClientLayout
 * - Header luôn hiển thị
 * - Footer luôn ở cuối trang
 * - Nội dung thay đổi theo route (Outlet)
 */
export default function ClientLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* ===== HEADER ===== */}
      <Header />

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-grow-1">
        <Outlet />
      </main>

      {/* ===== FOOTER ===== */}
      <Footer />
    </div>
  );
}
