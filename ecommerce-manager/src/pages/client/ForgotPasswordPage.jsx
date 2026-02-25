import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      await API.post("/auth/forgot-password", { email });
      setMessage(
        "Đã gửi link đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư!"
      );
      setEmail(""); // Clear email input after success
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra. Vui lòng kiểm tra lại email!"
      );
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
              <h3 className="text-center mb-4 fw-bold text-primary">
                Quên mật khẩu
              </h3>
              <p className="text-muted text-center mb-4">
                Nhập email đã đăng ký để nhận link đặt lại mật khẩu.
              </p>

              {/* Success message */}
              {message && (
                <div className="alert alert-success py-2" role="alert">
                  <small>{message}</small>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="alert alert-danger py-2" role="alert">
                  <small>{error}</small>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="emailInput" className="form-label fw-semibold">
                    Email
                  </label>
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
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-bold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Đang xử lý...
                    </>
                  ) : (
                    "Gửi yêu cầu"
                  )}
                </button>
              </form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="text-muted mb-0">
                  Đã nhớ mật khẩu?{" "}
                  <Link to="/login" className="text-decoration-none fw-semibold">
                    Đăng nhập
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
