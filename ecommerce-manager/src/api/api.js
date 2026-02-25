import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8081/api",
});

API.interceptors.request.use(
  (config) => {
    // Tự động xác định key cần lấy từ localStorage dựa trên đường dẫn hiện tại
    const isAdminPath = window.location.pathname.startsWith('/admin');
    const storageKey = isAdminPath ? "admin_user" : "user";

    const userString = localStorage.getItem(storageKey);
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (e) {
        console.error(`Failed to parse ${storageKey} from localStorage`, e);
        localStorage.removeItem(storageKey);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor 2: Xử lý phản hồi (Response Interceptor)
// Tự động xử lý lỗi 401 (Unauthorized)
API.interceptors.response.use(
  (response) => {
    // Nếu request thành công, chỉ cần trả về response
    return response;
  },
  (error) => {
    // Nếu request thất bại, kiểm tra xem có phải lỗi 401 không
    if (error.response && error.response.status === 401) {
      // Lỗi 401: Token không hợp lệ hoặc đã hết hạn
      console.error("Unauthorized request (401). Logging out.");
      
      const isAdminPath = window.location.pathname.startsWith('/admin');
      const storageKey = isAdminPath ? "admin_user" : "user";
      const targetPath = isAdminPath ? '/admin/login' : '/login';
      
      // Xóa thông tin user tương ứng khỏi localStorage
      localStorage.removeItem(storageKey);
      
      // CHỈ chuyển hướng nếu chúng ta chưa ở trang đăng nhập (để tránh lặp refresh)
      if (window.location.pathname !== targetPath) {
        window.location.href = targetPath; 
      }
    }
    
    // Đối với các lỗi khác, chỉ cần trả về lỗi
    return Promise.reject(error);
  }
);

export default API;