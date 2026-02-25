import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/api";
import useAuth from "../../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Lấy hàm login từ AuthContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Gọi API đăng nhập
      const response = await API.post("/auth/login", { email, password });

      // 2. Lấy toàn bộ dữ liệu trả về (bao gồm cả user và token)
      // response.data có dạng: { user: { id: 1, ... }, token: '...' }
      const loginData = response.data;

      // 3. Giao toàn bộ việc quản lý state cho AuthContext
      // Hàm login() trong AuthContext sẽ tự động:
      // - Cập nhật user state
      // - Lưu toàn bộ loginData vào localStorage dưới key "user"
      if (loginData && loginData.user && loginData.token) {
        login(loginData);
        
        // 4. Điều hướng về trang chủ
        navigate("/");
      } else {
        setError("Phản hồi từ server không hợp lệ.");
      }

    } catch (err) {
      // Dựa vào lỗi trả về từ server (nếu có) hoặc hiển thị lỗi chung
      setError(err.response?.data?.message || "Email hoặc mật khẩu không đúng!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5 col-xl-4">
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-body p-4">
              <h3 className="text-center mb-4 fw-bold text-primary">Đăng nhập</h3>
              {error && (
                <div className="alert alert-danger py-2" role="alert">
                  <small>{error}</small>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="emailInput" className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="emailInput"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="passwordInput" className="form-label fw-semibold">Mật khẩu</label>
                  <input
                    type="password"
                    className="form-control"
                    id="passwordInput"
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="text-end mt-2">
                    <Link to="/forgot-password" className="text-decoration-none small text-muted">
                      Quên mật khẩu?
                    </Link>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-bold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </button>
              </form>
              <hr className="my-4" />
              <div className="text-center">
                <p className="text-muted mb-0">
                  Chưa có tài khoản?{" "}
                  <Link to="/register" className="text-decoration-none fw-semibold">Đăng ký ngay</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}