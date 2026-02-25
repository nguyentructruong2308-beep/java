import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/api";
import { successSwal } from "../../utils/swal";

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError(""); // Xóa lỗi cũ khi người dùng bắt đầu nhập lại
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await API.post("/auth/register", form);
      await successSwal("Đăng ký thành công!", "Chào mừng bạn gia nhập ICREAM. Bạn sẽ được chuyển đến trang đăng nhập ngay bây giờ.");
      navigate("/login");
    } catch (err) {
      // Hiển thị lỗi từ server hoặc một lỗi mặc định
      setError(err.response?.data?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6 col-xl-5">
          {/* Card chứa form đăng ký */}
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-body p-4">

              {/* Tiêu đề */}
              <h3 className="text-center mb-4 fw-bold text-primary">Tạo tài khoản</h3>

              {/* Thông báo lỗi */}
              {error && (
                <div className="alert alert-danger py-2" role="alert">
                  <small>{error}</small>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Input Họ */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Họ</label>
                    <input
                      type="text"
                      name="firstName"
                      className="form-control"
                      placeholder="Nguyễn Văn"
                      onChange={handleChange}
                      required
                      autoFocus
                    />
                  </div>
                  {/* Input Tên */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Tên</label>
                    <input
                      type="text"
                      name="lastName"
                      className="form-control"
                      placeholder="A"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Input Email */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="name@example.com"
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Input Password */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Mật khẩu</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Tối thiểu 6 ký tự"
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Input Số điện thoại */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="Số điện thoại của bạn"
                    onChange={handleChange}
                  />
                </div>

                {/* Nút Submit */}
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 fw-bold" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang tạo tài khoản...
                    </>
                  ) : (
                    "Đăng ký"
                  )}
                </button>
              </form>

              <hr className="my-4" />

              {/* Link Đăng nhập */}
              <div className="text-center">
                <p className="text-muted mb-0">
                  Đã có tài khoản?{" "}
                  <Link to="/login" className="text-decoration-none fw-semibold">
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}