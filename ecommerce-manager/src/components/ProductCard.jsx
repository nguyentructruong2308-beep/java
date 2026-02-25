import React, { useState } from "react";
import { FaShoppingCart, FaHeart, FaTrash, FaBan } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../api/api";


// Format tiền VNĐ
const money = (value) => {
  if (value === null || value === undefined) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const getImageUrl = (url) => {
  if (!url) return "/no-image.jpg";
  if (url.startsWith("http")) return url;
  return `${API.defaults.baseURL}/files/download/${url}`;
};


export default function ProductCard({

  product,
  onAddToCart,
  onAddToWishlist,
  onRemoveFromWishlist,
  isWishlisted,
}) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const isOutOfStock = ((product?.stockQuantity || 0) <= 0 || product?.isActive === false);

  const handleCardClick = (e) => {
    if (!e.target.closest("button")) {
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="rounded-4 shadow-sm bg-white h-100 d-flex flex-column overflow-hidden"
      style={{
        fontSize: "0.85rem",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
        transform: isHovered && !isOutOfStock ? "translateY(-8px)" : "translateY(0)",
        boxShadow: isHovered
          ? "0 15px 30px rgba(0,0,0,0.1)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        opacity: isOutOfStock ? 0.85 : 1
      }}
    >
      {/* Ảnh */}
      <div
        className="w-100 bg-light position-relative"
        style={{ height: 210, overflow: "hidden" }}
      >
        <img
          src={getImageUrl(product.imageUrl)}
          alt={product.name}

          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease, filter 0.3s ease",
            transform: isHovered && !isOutOfStock ? "scale(1.08)" : "scale(1.0)",
            filter: isOutOfStock ? "grayscale(100%) brightness(0.7)" : "none"
          }}
        />

        {/* Overlay Hết hàng Trung tâm */}
        {isOutOfStock && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 1 }}>
                <span className="bg-dark text-white px-3 py-1 rounded-pill fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px', border: '1px solid rgba(255,255,255,0.3)' }}>
                    HẾT HÀNG
                </span>
            </div>
        )}
        
        {/* Badge Hết hàng */}
        {isOutOfStock && (
            <div className="position-absolute top-0 start-0 m-2 bg-dark text-white px-2 py-1 rounded small fw-bold d-flex align-items-center gap-1 shadow-sm" style={{ zIndex: 2 }}>
                <FaBan size={10} /> HẾT HÀNG
            </div>
        )}

        {/* Badge Giảm giá (Nếu có) */}
        {product.discount > 0 && !isOutOfStock && (
            <div className="position-absolute top-0 end-0 m-2 bg-danger text-white px-2 py-1 rounded small fw-bold" style={{ zIndex: 2 }}>
                -{product.discount}%
            </div>
        )}
      </div>

      {/* Nội dung */}
      <div className="p-3 d-flex flex-column flex-grow-1">
        <small 
            className="text-muted mb-2 d-block text-uppercase fw-bold"
            style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}
        >
          {product.categoryName || "Chưa phân loại"}
        </small>

        <h6
          className="fw-bold text-dark mb-2"
          style={{
            fontSize: "0.95rem",
            lineHeight: "1.4",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "2.7rem",
            transition: "color 0.2s",
            color: isHovered && !isOutOfStock ? "#ff6b6b" : "inherit",
          }}
        >
          {product.name}
        </h6>

        <div className="fw-bolder text-primary fs-6 mt-auto mb-3">
          {money(product.price)}
        </div>

        {/* Nút bấm */}
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm w-100 d-flex align-items-center justify-content-center gap-1 fw-medium ${isOutOfStock ? 'btn-light disabled border-0 text-muted' : 'btn-outline-primary'}`}
            style={{ borderRadius: '8px', paddingBlock: '0.4rem', transition: '0.2s', cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              if (!isOutOfStock) onAddToCart(product, e);
            }}
          >
            {isOutOfStock ? <><FaBan size={14} /> Hết</> : <><FaShoppingCart size={14} /> Giỏ</>}
          </button>

          <button
            className={`btn btn-sm w-100 d-flex align-items-center justify-content-center gap-1 fw-medium ${
              isWishlisted ? "btn-danger" : "btn-outline-danger"
            }`}
            style={{ borderRadius: '8px', paddingBlock: '0.4rem', transition: '0.2s' }}
            onClick={(e) => {
              e.stopPropagation();
              isWishlisted
                ? onRemoveFromWishlist?.(product)
                : onAddToWishlist?.(product);
            }}
          >
            {isWishlisted ? <FaTrash size={14}/> : <FaHeart size={14}/>}{" "}
            {isWishlisted ? "Xóa" : "Thích"}
          </button>
        </div>
      </div>
    </div>
  );
}
