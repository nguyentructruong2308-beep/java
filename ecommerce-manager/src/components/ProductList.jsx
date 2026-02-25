import React, { useEffect, useState } from "react";
import API from "../api/api";
import ProductCard from "./ProductCard";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// --- PHẦN UI: KHUNG XƯƠNG (SKELETON) HIỆN KHI ĐANG TẢI ---
const ProductSkeleton = () => (
  <div className="col-6 col-md-4 col-lg-3">
    <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden" aria-hidden="true">
      <div className="bg-secondary bg-opacity-10" style={{ height: 210 }}></div>
      <div className="p-3">
        <div className="placeholder-glow mb-2">
           <span className="placeholder col-4 rounded"></span>
        </div>
        <div className="placeholder-glow mb-3">
           <span className="placeholder col-12 rounded mb-1"></span>
           <span className="placeholder col-8 rounded"></span>
        </div>
        <div className="placeholder-glow d-flex gap-2">
           <span className="placeholder col-8 py-3 rounded-pill"></span>
           <span className="placeholder col-3 py-3 rounded-circle"></span>
        </div>
      </div>
    </div>
  </div>
);

export default function ProductList() {
  // --- GIỮ NGUYÊN LOGIC CỦA BẠN ---
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Giả lập delay 0.5s để bạn kịp nhìn thấy hiệu ứng Skeleton đẹp mắt
        // (Nếu mạng nhanh quá thì dòng này giúp UI đỡ bị giật cục)
        // await new Promise(r => setTimeout(r, 500)); 

        const [prodRes, wishRes] = await Promise.all([
          API.get("/products?page=0&size=20"),
          user
            ? API.get("/wishlist")
            : Promise.resolve({ data: { products: [] } }),
        ]);

        setProducts(prodRes.data.content || []);
        setWishlistIds(
          new Set(wishRes.data.products?.map((p) => p.id) || [])
        );
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleAddToCart = async (product, e) => {
    if (!user) {
      navigate("/login");
      return;
    }

    // 🚀 HIỆU ỨNG BAY (Dispatch sang Global Animator)
    if (e) {
      window.dispatchEvent(new CustomEvent('cartAnimate', {
        detail: {
          image: product.imageUrl,
          startX: e.clientX,
          startY: e.clientY
        }
      }));
    }

    try {
      await API.post(`/cart/add?productId=${product.id}&quantity=1`);
      toast.success(`Đã thêm "${product.name}" vào giỏ`);
      
      // 🔄 CẬP NHẬT HEADER & GIỎ HÀNG CHAT
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      toast.error("Thêm giỏ thất bại");
    }
  };

  const handleAddToWishlist = async (product) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await API.post(`/wishlist/${product.id}`);
      setWishlistIds((prev) => new Set(prev).add(product.id));
      toast.success("Đã thêm vào yêu thích");
    } catch {
      toast.error("Lỗi yêu thích");
    }
  };

  const handleRemoveFromWishlist = async (product) => {
    try {
      await API.delete(`/wishlist/${product.id}`);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
      toast.info("Đã xóa khỏi yêu thích");
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  // --- CẬP NHẬT GIAO DIỆN ---
  
  // 1. Nếu đang tải -> Hiện Skeleton (thay vì chữ Loading)
  if (loading) {
    return (
      <div className="container py-4">
        <h3 className="fw-bold mb-4" data-aos="fade-right">Tất cả sản phẩm</h3>
        <div className="row g-4">
            {/* Tạo ra 8 cái khung xương giả */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <ProductSkeleton key={n} />)}
        </div>
      </div>
    );
  }

  // 2. Nếu không có sản phẩm
  if (products.length === 0) {
      return (
          <div className="text-center py-5" data-aos="fade-up">
              <h4 className="text-muted">Chưa có sản phẩm nào 😔</h4>
          </div>
      )
  }

  // 3. Hiển thị danh sách thật
  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4" data-aos="fade-right">Tất cả sản phẩm</h3>

      <div className="row g-4">
        {products.map((product, index) => (
          <div 
            key={product.id} 
            className="col-6 col-md-4 col-lg-3"
            // Thêm hiệu ứng bay lên (AOS)
            data-aos="fade-up"
            data-aos-delay={index * 50} // Hiệu ứng thác nước (cái sau chậm hơn cái trước xíu)
          >
            <ProductCard
              product={product}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              onRemoveFromWishlist={handleRemoveFromWishlist}
              isWishlisted={wishlistIds.has(product.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}