import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../api/api';
import ProductCard from '../../components/ProductCard'; // Đảm bảo đường dẫn này đúng
import { Spinner, Alert } from 'react-bootstrap';

export default function ProductsByCategoryPage() {
  // 1. Lấy categoryId từ URL
  // Tên 'categoryId' phải khớp với tên bạn đặt trong Route (ví dụ: path="/category/:categoryId")
  const { categoryId } = useParams(); 
  
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState(''); // State để lưu tên danh mục
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 2. Sử dụng useEffect để gọi API mỗi khi categoryId thay đổi
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        // Gọi API lấy sản phẩm theo danh mục mà bạn đã tạo
        const res = await API.get(`/products/category/${categoryId}`);
        setProducts(res.data);
        
        // Lấy tên danh mục để hiển thị (tùy chọn nhưng nên có)
        // Giả sử sản phẩm đầu tiên có categoryName
        if (res.data.length > 0) {
          setCategoryName(res.data[0].categoryName);
        } else {
          // Nếu không có sản phẩm, ta cần gọi API khác để lấy tên category
          try {
            const catRes = await API.get(`/categories/${categoryId}`);
            setCategoryName(catRes.data.name);
          } catch (catError) {
             setCategoryName('Không rõ');
          }
        }

      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
        setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    // Chỉ gọi khi có categoryId
    if (categoryId) {
      fetchProducts();
    }
    
    // useEffect này sẽ chạy lại mỗi khi `categoryId` trên URL thay đổi
  }, [categoryId]);

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }

  if (error) {
    return <div className="container py-5"><Alert variant="danger">{error}</Alert></div>;
  }

  return (
    <div className="container py-4">
      {/* Hiển thị tiêu đề động */}
      <h1 className="mb-4">
        Danh mục: <span className="text-primary">{categoryName}</span>
      </h1>
      
      {products.length === 0 ? (
        <Alert variant="info">Chưa có sản phẩm nào trong danh mục này.</Alert>
      ) : (
        <div className="row g-4">
          {products.map((product) => (
            <div key={product.id} className="col-6 col-md-4 col-lg-3">
              {/* Sử dụng lại ProductCard component */}
              <ProductCard
                product={product}
                // Bạn cần truyền các hàm onAddToCart, onAddToWishlist ở đây nếu có
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}