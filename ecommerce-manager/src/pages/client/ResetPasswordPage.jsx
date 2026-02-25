import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import API from "../../api/api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Get token from URL query parameter
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError("Link đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu lại.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    setIsLoading(true);

    try {
      await API.post("/auth/reset-password", { token, newPassword });
      setMessage("Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra. Link có thể đã hết hạn, vui lòng yêu cầu lại!"
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
                Đặt lại mật khẩu
              </h3>
              <p className="text-muted text-center mb-4">
                Nhập mật khẩu mới cho tài khoản của bạn.
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

              {/* Only show form if we have a valid token */}
              {token && !message && (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label
                      htmlFor="newPasswordInput"
                      className="form-label fw-semibold"
                    >
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPasswordInput"
                      placeholder="Tối thiểu 6 ký tự"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="confirmPasswordInput"
                      className="form-label fw-semibold"
                    >
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPasswordInput"
                      placeholder="Nhập lại mật khẩu"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
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
                      "Đặt lại mật khẩu"
                    )}
                  </button>
                </form>
              )}

              <hr className="my-4" />

              <div className="text-center">
                <p className="text-muted mb-0">
                  <Link
                    to="/forgot-password"
                    className="text-decoration-none fw-semibold"
                  >
                    Yêu cầu link mới
                  </Link>
                  {" | "}
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
