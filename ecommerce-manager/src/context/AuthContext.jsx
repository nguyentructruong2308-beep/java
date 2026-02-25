import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'; // Thêm hook này

// API client đã được cấu hình interceptor
import API from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Tự động khôi phục Client User từ localStorage ngay khi khởi tạo
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  // Tự động khôi phục Admin User từ localStorage ngay khi khởi tạo
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem("admin_user");
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem("admin_user");
      return null;
    }
  });

  const navigate = useNavigate();


  // --- Client Auth ---
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  // --- Admin Auth ---
  const adminLogin = (adminData) => {
    setAdminUser(adminData);
    localStorage.setItem("admin_user", JSON.stringify(adminData));
  };

  const adminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem("admin_user");
    navigate("/admin/login");
  };

  const refreshUser = React.useCallback(async () => {
    try {
      const res = await API.get("/users/me");
      const updatedProfile = res.data;

      setUser(prev => {
        if (!prev) return null;
        const newUserState = { ...prev, user: updatedProfile };
        localStorage.setItem("user", JSON.stringify(newUserState));
        return newUserState;
      });
    } catch (err) {
      console.error("Failed to refresh user data:", err);
    }
  }, []);

  const authContextValue = {
    // Client Side
    user: user ? user.user : null,
    token: user ? user.token : null,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,

    // Admin Side
    adminUser: adminUser ? adminUser.user : null,
    adminToken: adminUser ? adminUser.token : null,
    isAdminAuthenticated: !!adminUser,
    adminLogin,
    adminLogout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};