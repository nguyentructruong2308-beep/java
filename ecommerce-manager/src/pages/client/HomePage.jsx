import React from 'react';
import ProductList from '../../components/ProductList';
import Deal from './Deal';

export default function HomePage() {
  return (
    <>
      <Deal />
      {/* ================= SẢN PHẨM ================= */}
      {/* Thêm data-aos="fade-up" để cả khối trượt lên nhẹ nhàng */}
      <section className="container py-5" data-aos="fade-up" data-aos-duration="1000">

        {/* Tiêu đề trang chủ (Bay ra kiểu Zoom-in) */}
        <div className="text-center mb-5">
          <h2
            className="fw-bold text-uppercase"
            style={{ color: '#ff6b6b', letterSpacing: '2px' }}
            data-aos="zoom-in"
          >
            Menu Hôm Nay
          </h2>
          <div
            className="d-inline-block mt-2"
            style={{ width: '60px', height: '3px', backgroundColor: '#ff9a9e', borderRadius: '2px' }}
            data-aos="fade-right"
            data-aos-delay="300"
          ></div>
          <p className="text-muted mt-3" data-aos="fade-up" data-aos-delay="400">
            Lựa chọn những hương vị kem tươi mát lạnh yêu thích của bạn
          </p>
        </div>

        {/* Danh sách sản phẩm */}
        <ProductList />
      </section>
    </>
  );
}