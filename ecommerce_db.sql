-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th2 25, 2026 lúc 06:11 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `ecommerce_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `addresses`
--

CREATE TABLE `addresses` (
  `id` bigint(20) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `city` varchar(255) NOT NULL,
  `district` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `is_default` bit(1) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `street` varchar(255) NOT NULL,
  `ward` varchar(255) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `addresses`
--

INSERT INTO `addresses` (`id`, `created_at`, `updated_at`, `city`, `district`, `full_name`, `is_default`, `phone`, `street`, `ward`, `user_id`) VALUES
(1, '2025-12-16 03:09:05.000000', '2025-12-16 03:09:05.000000', 'TP. Hồ Chí Minh', 'Quận 1', 'Hoàng Lâm', b'1', '0987654321', '123 Đường ABC', 'Phường 1', 2),
(2, '2025-12-26 20:57:00.000000', '2025-12-26 20:57:00.000000', 'sdg', 'dzxgs', 'ngan tran', b'1', '0937976562', 'long an', 'zxdsg', 3),
(3, '2026-01-18 00:46:53.000000', '2026-01-18 00:46:53.000000', 'Đồng Nai', 'Thị trấn Định Quán', 'NGUYỄN TRÚC TRƯỜNG', b'1', '0337050902', '23', 'Định Quán', 5),
(4, '2026-01-19 02:53:20.000000', '2026-01-19 02:53:47.000000', 'Long Khánh', 'haha', 'NGUYỄN TRÚC TRƯỜNG', b'0', '0337050902', '23', 'Định Quán', 5),
(5, '2026-01-21 00:01:41.000000', '2026-01-21 00:01:41.000000', 'Đồng Nai', 'Thị trấn Định Quán', 'NGUYỄN TRÚC TRƯỜNG', b'1', '0337050902', 'Khu 12, Ấp Hiệp Đồng, Xã Định Quán, Tỉnh Đồng Nai', 'Định Quán', 6),
(6, '2026-01-27 22:00:35.000000', '2026-01-28 01:46:06.000000', 'Ho Chi Minh', 'Thu Duc', 'kem que dâu', b'0', '1234567412', '21/63 đường số 2', 'Phuoc Long B', 8),
(7, '2026-01-28 22:01:01.000000', '2026-01-29 00:50:16.000000', 'hcm', 'Tan Phu', 'Chị nè', b'0', '0937976521', '54/23', 'Cai Be', 4),
(8, '2026-01-29 01:33:04.000000', '2026-01-30 01:43:16.000000', 'Hồ Chí Minh', 'QUận 1', 'NGUYỄN TRÚC TRƯỜNG', b'0', '0337050902', '23', 'Phước Long B', 5);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `blocked_tokens`
--

CREATE TABLE `blocked_tokens` (
  `id` bigint(20) NOT NULL,
  `expiry_date` datetime(6) NOT NULL,
  `token` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `blogs`
--

CREATE TABLE `blogs` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `excerpt` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_published` bit(1) DEFAULT NULL,
  `title` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `blogs`
--

INSERT INTO `blogs` (`id`, `created_at`, `updated_at`, `author`, `category`, `content`, `excerpt`, `image_url`, `is_published`, `title`) VALUES
(1, '2026-01-19 15:45:02.000000', '2026-01-19 15:45:02.000000', 'Quản trị viên', 'Hệ thống', '### 🌟 1. Mua sắm tích điểm - Nhận ngàn ưu đãi (Loyalty Points)\nTừ nay, mỗi đơn hàng hoàn tất sẽ mang lại giá trị cộng thêm cho bạn. Với mỗi **10,000 VNĐ** chi tiêu, bạn sẽ nhận được **1 điểm tích lũy**. Số điểm này sẽ được dùng để đổi các mã giảm giá hấp dẫn.\n\n### 🔐 2. Bảo mật tuyệt đối với công nghệ Refresh Token\nHệ thống mới giúp duy trì phiên đăng nhập của bạn một cách an toàn và liên tục, giảm thiểu việc phải nhập mật khẩu thường xuyên mà vẫn đảm bảo an toàn tuyệt đối.\n\n### 📧 3. Hệ thống Email thông báo thông minh\nHệ thống email tự động sẽ gửi tới bạn ngay lập tức: Xác nhận đơn hàng, Chào mừng thành viên mới và Cập nhật trạng thái hoàn tiền.\n\n### ⭐ 4. Đánh giá sản phẩm trực quan\nGiao diện đánh giá đã được nâng cấp với khả năng lọc thông minh và hiển thị hình ảnh thực tế từ khách hàng, giúp bạn chọn được sản phẩm ưng ý nhất.', 'Chào đón diện mạo mới và các tính năng đột phá: Hệ thống tích điểm Loyalty, Bảo mật 2 lớp với Refresh Token và giao diện Đánh giá sản phẩm trực quan.', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1000', b'1', 'Nâng cấp Trải nghiệm Mua sắm & Bảo mật cùng Ecommerce Store'),
(2, '2026-01-19 15:45:27.000000', '2026-01-19 15:45:27.000000', 'Đội ngũ Stylist', 'Hướng dẫn', '### 📏 1. Cách đo kích thước cơ thể\nĐể chọn size chuẩn, bạn cần chuẩn bị thước dây và đo các vòng: Ngực, Eo, Mông và Chiều cao cân nặng.\n\n### 👕 2. Hiểu rõ bảng Size của từng thương hiệu\nMỗi thương hiệu có một quy chuẩn riêng (S, M, L, XL). Bạn nên ưu tiên xem bảng thông số chi tiết (cm) hơn là chỉ nhìn vào ký hiệu size.\n\n### 🧵 3. Lưu ý về chất liệu vải\nCác loại vải như Cotton, Jean thường có độ co giãn khác nhau. Nếu vải không co giãn, hãy cân nhắc chọn lớn hơn 1 size để thoải mái vận động.', 'Việc chọn sai size là trở ngại lớn nhất khi mua sắm online. Hãy cùng Ecommerce Store tìm hiểu cách đo và chọn size chuẩn xác nhất cho mọi loại trang phục.', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1000', b'1', 'Bí quyết chọn Size chuẩn - Không còn nỗi lo đổi trả khi mua Online'),
(3, '2026-01-19 15:45:27.000000', '2026-01-19 15:45:27.000000', 'Chuyên gia Fashion', 'Xu hướng', '### 🌿 1. Thời trang bền vững (Eco-friendly)\nSử dụng các chất liệu tự nhiên như vải lanh, lụa tơ tằm và các loại vải tái chế đang trở thành xu hướng hàng đầu.\n\n### 🎨 2. Gam màu Pastel và Trái đất\nCác tông màu nhẹ nhàng như xanh olive, nâu đất và tím oải hương sẽ mang lại cảm giác thư thái và sang trọng.\n\n### 🧥 3. Thiết kế Oversize vẫn chưa hạ nhiệt\nSự thoải mái vẫn là ưu tiên hàng đầu với các dòng áo khoác và quần ống rộng, phù hợp cho cả đi làm và dạo phố.', 'Khám phá những gam màu và chất liệu sẽ thống trị làng thời trang trong năm 2026. Chú trọng vào sự tối giản và thân thiện với môi trường.', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000', b'1', 'Xu hướng thời trang 2026: Sự trỗi dậy của phong cách bền vững'),
(4, '2026-01-19 15:45:27.000000', '2026-01-19 15:45:27.000000', 'Ban Biên Tập', 'Mẹo vặt', '### 💰 1. Tận dụng hệ thống tích điểm (Loyalty Points)\nVới mỗi đơn hàng, bạn sẽ nhận được điểm. Hãy tích lũy chúng để đổi lấy Freight Voucher hoặc giảm giá trực tiếp trên hóa đơn.\n\n### 🎟️ 2. Săn Deal vào các khung giờ vàng\nEcommerce Store thường xuyên có các mã giảm giá chớp nhoáng (Flash Sale) vào cuối tuần. Hãy đăng ký nhận thông báo qua Email để không bỏ lỡ.\n\n### 🏷️ 3. Mua theo Combo\nThay vì mua lẻ, việc lựa chọn các gói Combo sản phẩm sẽ giúp bạn tiết kiệm tới 20% tổng giá trị đơn hàng.', 'Bạn đã biết cách sử dụng hệ thống Loyalty Points mới để mua hàng với giá hời nhất chưa? Xem ngay lộ trình tiết kiệm tại đây.', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1000', b'1', 'Mẹo mua sắm thông minh: Tối ưu hóa điểm thưởng và mã giảm giá');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart_items`
--

CREATE TABLE `cart_items` (
  `id` bigint(20) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `quantity` int(11) NOT NULL,
  `temp_cart_id` varchar(255) DEFAULT NULL,
  `product_variant_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `selected_size` varchar(255) DEFAULT NULL,
  `product_id` bigint(20) DEFAULT NULL,
  `is_gift` bit(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `cart_items`
--

INSERT INTO `cart_items` (`id`, `created_at`, `updated_at`, `quantity`, `temp_cart_id`, `product_variant_id`, `user_id`, `selected_size`, `product_id`, `is_gift`) VALUES
(81, '2026-01-23 18:31:40.000000', '2026-01-23 18:31:40.000000', 1, NULL, 63, 7, NULL, NULL, NULL),
(82, '2026-01-23 18:31:43.000000', '2026-01-23 18:31:43.000000', 2, NULL, NULL, 7, NULL, 96, NULL),
(103, '2026-01-29 00:49:47.000000', '2026-01-29 00:49:47.000000', 1, NULL, NULL, 4, NULL, 111, b'0'),
(123, '2026-01-30 01:40:54.000000', '2026-01-30 01:41:00.000000', 4, NULL, NULL, 5, 'S', 111, b'0'),
(124, '2026-01-30 01:42:26.000000', '2026-01-30 01:42:26.000000', 5, NULL, 63, 5, NULL, NULL, b'0'),
(125, '2026-01-30 01:42:36.000000', '2026-01-30 01:42:36.000000', 10, NULL, NULL, 5, NULL, 97, b'0'),
(127, '2026-01-30 01:42:36.000000', '2026-01-30 01:42:36.000000', 3, NULL, NULL, 5, NULL, 97, b'1'),
(128, '2026-01-30 01:45:52.000000', '2026-01-30 01:45:52.000000', 10, NULL, NULL, 5, NULL, 96, b'0');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart_item_toppings`
--

CREATE TABLE `cart_item_toppings` (
  `id` bigint(20) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `cart_item_id` bigint(20) NOT NULL,
  `topping_id` bigint(20) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `cart_item_toppings`
--

INSERT INTO `cart_item_toppings` (`id`, `price`, `cart_item_id`, `topping_id`, `created_at`, `updated_at`) VALUES
(81, 5000.00, 123, 1, '2026-01-30 08:40:54.963018', '2026-01-30 08:40:54.963018'),
(82, 7000.00, 123, 2, '2026-01-30 08:40:54.971339', '2026-01-30 08:40:54.971339'),
(83, 5000.00, 123, 4, '2026-01-30 08:40:54.974256', '2026-01-30 08:40:54.974256'),
(84, 5000.00, 123, 5, '2026-01-30 08:40:54.979122', '2026-01-30 08:40:54.979122'),
(85, 5000.00, 128, 4, '2026-01-30 08:45:52.105426', '2026-01-30 08:45:52.105426');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `description` text DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `created_at`, `updated_at`, `description`, `is_active`, `name`) VALUES
(4, '2025-12-16 03:09:04.000000', '2026-01-10 01:54:34.000000', 'Hương vị theo từng khẩu vị\n', b'1', 'Kem Nhập Khẩu'),
(5, '2025-12-16 03:09:04.000000', '2026-01-10 01:54:14.000000', 'Kem Cuộn nhiều lựa chọn', b'1', 'Kem cuộn'),
(6, '2025-12-27 02:38:55.000000', '2025-12-27 02:38:55.000000', 'Kem que truyền thống, trái cây', b'1', 'Kem que'),
(7, '2025-12-27 02:38:55.000000', '2025-12-27 02:38:55.000000', 'Kem múc nhiều vị', b'1', 'Kem ly'),
(8, '2025-12-27 02:38:55.000000', '2025-12-27 02:38:55.000000', 'Kem hộp gia đình', b'1', 'Kem hộp'),
(9, '2025-12-27 02:38:55.000000', '2026-01-10 01:54:42.000000', 'Socola, cốm, hạt, marshmallow', b'0', 'Topping'),
(10, '2025-12-27 02:38:55.000000', '2025-12-27 02:38:55.000000', 'Combo kem và topping', b'1', 'Combo'),
(11, '2026-01-19 04:46:28.000000', '2026-01-21 01:12:07.000000', 'Các loại kem premium nhập khẩu cao cấp', b'0', 'Kem cao cấp'),
(12, '2026-01-19 04:46:28.000000', '2026-01-21 01:12:07.000000', 'Kem làm từ trái cây tươi nguyên chất', b'0', 'Kem trái cây'),
(13, '2026-01-19 04:46:28.000000', '2026-01-21 01:12:07.000000', 'Kem sữa chua thanh mát ít calo', b'0', 'Kem sữa chua'),
(14, '2026-01-19 04:46:28.000000', '2026-01-21 01:11:47.000000', 'Kem dành cho người ăn kiêng, ít đường', b'0', 'Kem ít đường'),
(15, '2026-01-19 04:46:28.000000', '2026-01-19 04:46:28.000000', 'Các loại bánh kem sinh nhật', b'1', 'Bánh kem'),
(16, '2026-01-21 01:19:27.000000', '2026-01-21 01:19:27.000000', 'Kem ốc quế', b'1', 'Kem ốc quế');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `contacts`
--

CREATE TABLE `contacts` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `is_read` bit(1) DEFAULT NULL,
  `message` text NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `response` text DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `contacts`
--

INSERT INTO `contacts` (`id`, `created_at`, `updated_at`, `email`, `is_read`, `message`, `name`, `phone`, `response`, `subject`) VALUES
(1, '2026-01-19 08:20:42.000000', '2026-01-19 08:20:50.000000', 'nguyentruong23082005@gmail.com', b'1', 'sdgsgdsgsg', 'NGUYỄN TRÚC TRƯỜNG', NULL, NULL, 'csdgsg'),
(2, '2026-01-19 08:53:56.000000', '2026-01-19 08:54:03.000000', 'nguyentruong23082005@gmail.com', b'1', 'fgdsfdbafbf', 'NGUYỄN TRÚC TRƯỜNG', NULL, NULL, 'bfdbfbfbdabf');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `discounts`
--

CREATE TABLE `discounts` (
  `id` bigint(20) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `description` varchar(255) DEFAULT NULL,
  `discount_type` enum('FIXED_AMOUNT','PERCENTAGE') NOT NULL,
  `discount_value` decimal(38,2) NOT NULL,
  `end_date` datetime(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `start_date` datetime(6) NOT NULL,
  `code` varchar(50) NOT NULL,
  `max_discount_amount` decimal(38,2) DEFAULT NULL,
  `min_order_value` decimal(38,2) DEFAULT NULL,
  `required_tier` enum('GOLD','LOYAL','MEMBER','NEW','SILVER','VIP') DEFAULT NULL,
  `voucher_source` enum('LOYALTY','SHOP','TIER') DEFAULT NULL,
  `buy_quantity` int(11) DEFAULT NULL,
  `get_quantity` int(11) DEFAULT NULL,
  `gift_product_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `discounts`
--

INSERT INTO `discounts` (`id`, `created_at`, `updated_at`, `description`, `discount_type`, `discount_value`, `end_date`, `is_active`, `name`, `start_date`, `code`, `max_discount_amount`, `min_order_value`, `required_tier`, `voucher_source`, `buy_quantity`, `get_quantity`, `gift_product_id`) VALUES
(1, '2026-01-18 00:51:10.000000', '2026-01-18 00:51:10.000000', 'Gần tết nên giảm', 'PERCENTAGE', 10.00, '2026-01-31 07:51:00.000000', b'1', 'Giảm giá mùa xuân', '2026-01-18 07:50:00.000000', 'KHONGGIAM', NULL, 50000.00, NULL, NULL, NULL, NULL, NULL),
(2, '2026-01-28 05:41:16.000000', '2026-01-28 05:53:02.174952', 'Giảm 50K cho hóa đơn từ 500K - Chỉ dành cho hạng Bạc', 'FIXED_AMOUNT', 50000.00, '2026-07-28 12:41:16.000000', b'1', 'Ưu đãi Hạng Bạc', '2026-01-27 12:41:16.000000', 'SILVER2026', 50000.00, 500000.00, 'SILVER', 'TIER', NULL, NULL, NULL),
(3, '2026-01-28 05:41:16.000000', '2026-01-28 05:53:14.386388', 'Giảm 10% tối đa 200K - Dành riêng cho hạng Vàng', 'PERCENTAGE', 10.00, '2027-01-28 12:41:16.000000', b'1', 'Đặc quyền Hạng Vàng', '2026-01-27 12:41:16.000000', 'GOLDVIP', 200000.00, 0.00, 'GOLD', 'TIER', NULL, NULL, NULL),
(4, '2026-01-29 00:08:21.000000', '2026-01-29 00:08:21.000000', 'Mã Ngon nha', 'FIXED_AMOUNT', 50000.00, '2026-05-29 07:07:00.000000', b'1', 'Lụm Nhanh Mua Lẹ', '2026-01-28 07:07:00.000000', 'DINHLAM', NULL, 20000.00, NULL, 'SHOP', NULL, NULL, NULL),
(5, '2026-01-29 00:21:42.000000', '2026-01-29 00:39:21.000000', 'Ngon', 'PERCENTAGE', 0.00, '2099-12-31 09:59:00.000000', b'1', 'Ưu đãi: Kem Ốc Quế Vani', '2026-01-28 17:21:00.000000', 'DEAL_1769671282787', NULL, NULL, NULL, 'SHOP', 5, 1, 98),
(6, '2026-01-29 00:39:04.000000', '2026-01-29 00:39:04.000000', 'Săn Ngay Nào!!!', 'PERCENTAGE', 0.00, '2099-12-31 16:59:00.000000', b'1', 'Ưu đãi: Kem Que Dâu Tây', '2026-01-29 00:38:00.000000', 'DEAL_1769672292763', NULL, NULL, NULL, 'SHOP', 10, 3, 97),
(7, '2026-01-29 00:42:14.000000', '2026-01-29 00:42:14.000000', 'Mua 3 tặng 3', 'PERCENTAGE', 0.00, '2099-12-31 16:59:00.000000', b'1', 'Ưu đãi: Mua 3 Bánh Kem Dâu Tây Organic tặng 3 Kem Ly Dâu Tây Fresh', '2026-01-29 00:40:00.000000', 'DEAL_1769672436469', NULL, NULL, NULL, 'SHOP', 3, 3, 92);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `is_read` bit(1) DEFAULT NULL,
  `message` text NOT NULL,
  `related_id` bigint(20) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `notifications`
--

INSERT INTO `notifications` (`id`, `created_at`, `updated_at`, `is_read`, `message`, `related_id`, `title`, `type`) VALUES
(1, '2026-01-29 04:52:15.000000', '2026-01-29 04:52:33.000000', b'1', 'Sản phẩm: Bánh Kem Dâu Tây Organic - 5 sao', 3, 'Đánh giá mới từ Kim SeonHo', 'REVIEW');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `payment_method` varchar(255) DEFAULT NULL,
  `payment_status` varchar(255) DEFAULT NULL,
  `shipping_address_snapshot` text NOT NULL,
  `status` enum('CANCELLED','DELIVERED','PENDING','PROCESSING','SHIPPED') NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `tracking_number` varchar(255) DEFAULT NULL,
  `address_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT NULL,
  `discount_code` varchar(255) DEFAULT NULL,
  `shipping_note` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `created_at`, `updated_at`, `payment_method`, `payment_status`, `shipping_address_snapshot`, `status`, `total_amount`, `tracking_number`, `address_id`, `user_id`, `discount_amount`, `discount_code`, `shipping_note`) VALUES
(1, '2025-12-16 03:09:05.000000', '2026-01-20 23:03:36.000000', 'COD', 'PAID', '123 Đường ABC, Phường 1, Quận 1, TP. Hồ Chí Minh', 'CANCELLED', 4800000.00, NULL, 1, 2, NULL, NULL, NULL),
(2, '2025-12-26 20:57:13.000000', '2026-01-28 23:15:53.000000', 'COD', 'PENDING', 'long an, zxdsg, dzxgs, sdg', 'DELIVERED', 28000.00, NULL, 2, 3, NULL, NULL, NULL),
(3, '2025-12-27 03:02:44.000000', '2026-01-19 02:52:29.000000', 'COD', 'PENDING', 'long an, zxdsg, dzxgs, sdg', 'DELIVERED', 162000.00, NULL, 2, 3, NULL, NULL, NULL),
(19, '2026-01-18 01:44:45.000000', '2026-01-19 02:52:33.000000', 'VNPAY', 'PENDING', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 130000.00, NULL, 3, 5, 0.00, NULL, NULL),
(21, '2026-01-18 01:53:26.000000', '2026-01-19 02:52:38.000000', 'VNPAY', 'PENDING', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 114000.00, NULL, 3, 5, 0.00, NULL, NULL),
(22, '2026-01-18 02:01:07.000000', '2026-01-18 02:12:58.000000', 'VNPAY', 'PENDING', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 92700.00, 'ádasd', 3, 5, 10300.00, 'KHONGGIAM', NULL),
(23, '2026-01-18 02:13:43.000000', '2026-01-28 23:15:58.000000', 'VNPAY', 'PENDING', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 72900.00, NULL, 3, 5, 8100.00, 'KHONGGIAM', NULL),
(24, '2026-01-18 02:25:52.000000', '2026-01-28 23:16:12.000000', 'VNPAY', 'PENDING', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 49000.00, NULL, 3, 5, 0.00, NULL, NULL),
(25, '2026-01-18 02:29:16.000000', '2026-01-28 23:16:03.000000', 'MOMO', 'PENDING', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 57600.00, NULL, 3, 5, 6400.00, 'KHONGGIAM', NULL),
(26, '2026-01-18 04:14:52.000000', '2026-01-28 23:16:07.000000', 'MOMO', 'PENDING', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 108900.00, NULL, 3, 5, 12100.00, 'KHONGGIAM', NULL),
(27, '2026-01-18 04:15:13.000000', '2026-01-19 02:59:05.000000', 'VNPAY', 'PENDING', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 108900.00, NULL, 3, 5, 12100.00, 'KHONGGIAM', NULL),
(28, '2026-01-18 04:15:31.000000', '2026-01-28 23:16:26.000000', 'COD', 'PENDING', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 121000.00, NULL, 3, 5, 0.00, NULL, NULL),
(29, '2026-01-18 04:18:25.000000', '2026-01-19 02:59:09.000000', 'MOMO', 'PENDING', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 49000.00, NULL, 3, 5, 0.00, NULL, NULL),
(30, '2026-01-18 04:21:46.000000', '2026-01-19 02:52:24.000000', 'MOMO', 'PENDING', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 49000.00, NULL, 3, 5, 0.00, NULL, NULL),
(31, '2026-01-18 04:23:51.000000', '2026-01-19 02:58:58.000000', 'MOMO', 'PAID', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 49000.00, NULL, 3, 5, 0.00, NULL, NULL),
(32, '2026-01-18 04:25:27.000000', '2026-01-28 23:16:17.000000', 'MOMO', 'PAID', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 88200.00, NULL, 3, 5, 9800.00, 'KHONGGIAM', NULL),
(33, '2026-01-18 04:37:51.000000', '2026-01-28 23:16:21.000000', 'MOMO', 'FAILED', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 98000.00, NULL, 3, 5, 0.00, NULL, NULL),
(34, '2026-01-18 06:52:24.000000', '2026-01-28 23:17:07.000000', 'MOMO', 'PENDING', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 98000.00, NULL, 3, 5, 0.00, NULL, NULL),
(35, '2026-01-18 06:54:02.000000', '2026-01-19 02:52:43.000000', 'COD', 'PENDING', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 98000.00, NULL, 3, 5, 0.00, NULL, NULL),
(36, '2026-01-18 06:57:09.000000', '2026-01-18 11:40:53.000000', 'MOMO', 'FAILED', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'CANCELLED', 84000.00, NULL, 3, 5, 0.00, NULL, NULL),
(37, '2026-01-18 23:21:50.000000', '2026-01-28 23:16:31.000000', 'VNPAY', 'PENDING', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'SHIPPED', 130000.00, NULL, 3, 5, 0.00, NULL, NULL),
(38, '2026-01-18 23:22:14.000000', '2026-01-19 02:52:15.000000', 'MOMO', 'PENDING', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'CANCELLED', 130000.00, NULL, 3, 5, 0.00, NULL, NULL),
(39, '2026-01-18 23:30:37.000000', '2026-01-28 23:16:36.000000', 'MOMO', 'PENDING', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'SHIPPED', 117000.00, NULL, 3, 5, 13000.00, 'KHONGGIAM', NULL),
(40, '2026-01-18 23:40:19.000000', '2026-01-28 23:17:01.000000', 'MOMO', 'PENDING', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 117000.00, NULL, 3, 5, 13000.00, 'KHONGGIAM', NULL),
(41, '2026-01-18 23:48:27.000000', '2026-01-19 03:46:44.000000', 'MOMO', 'PAID', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 130000.00, NULL, 3, 5, 0.00, NULL, NULL),
(42, '2026-01-18 23:56:09.000000', '2026-01-19 03:53:32.000000', 'MOMO', 'PAID', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 117000.00, NULL, 3, 5, 13000.00, 'KHONGGIAM', NULL),
(43, '2026-01-19 00:01:08.000000', '2026-01-19 00:01:30.000000', 'MOMO', 'PAID', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'PROCESSING', 130000.00, NULL, 3, 5, 0.00, NULL, NULL),
(44, '2026-01-19 00:07:48.000000', '2026-01-19 00:08:03.000000', 'MOMO', 'PAID', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'PROCESSING', 117000.00, NULL, 3, 5, 13000.00, 'KHONGGIAM', NULL),
(45, '2026-01-19 00:11:56.000000', '2026-01-19 03:53:21.000000', 'MOMO', 'PENDING', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'CANCELLED', 117000.00, NULL, 3, 5, 13000.00, 'KHONGGIAM', NULL),
(46, '2026-01-19 00:13:22.000000', '2026-01-19 03:46:34.000000', 'MOMO', 'PAID', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 117000.00, NULL, 3, 5, 13000.00, 'KHONGGIAM', NULL),
(47, '2026-01-19 00:20:25.000000', '2026-01-19 04:37:58.000000', 'MOMO', 'PAID', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 115200.00, NULL, 3, 5, 12800.00, 'KHONGGIAM', NULL),
(48, '2026-01-19 01:18:37.000000', '2026-01-19 01:18:51.000000', 'MOMO', 'PAID', '23, Định Quán, Thị trấn Định Quán, Đồng Nai', 'PROCESSING', 48000.00, NULL, 3, 5, 0.00, NULL, NULL),
(49, '2026-01-21 00:02:43.000000', '2026-01-21 00:04:19.000000', 'COD', 'PENDING', 'Khu 12, Ấp Hiệp Đồng, Xã Định Quán, Tỉnh Đồng Nai, Định Quán, Thị trấn Định Quán, Đồng Nai', 'PROCESSING', 78300.00, NULL, 5, 6, 8700.00, 'KHONGGIAM', NULL),
(50, '2026-01-21 01:27:48.000000', '2026-01-28 23:16:40.000000', 'COD', 'PENDING', 'Khu 12, Ấp Hiệp Đồng, Xã Định Quán, Tỉnh Đồng Nai, Định Quán, Thị trấn Định Quán, Đồng Nai', 'DELIVERED', 146000.00, NULL, 5, 6, 0.00, NULL, NULL),
(51, '2026-01-27 22:00:52.000000', '2026-01-27 22:01:24.000000', 'COD', 'PENDING', 'long an, dxg, dfhtj, dxfhr', 'DELIVERED', 228000.00, NULL, 6, 8, 0.00, NULL, NULL),
(52, '2026-01-27 23:05:59.000000', '2026-01-27 23:24:16.000000', 'MOMO', 'PENDING', 'long an, dxg, dfhtj, dxfhr', 'DELIVERED', 65000.00, NULL, 6, 8, 0.00, NULL, NULL),
(53, '2026-01-27 23:06:38.000000', '2026-01-27 23:24:21.000000', 'COD', 'PENDING', 'long an, dxg, dfhtj, dxfhr', 'DELIVERED', 65000.00, NULL, 6, 8, 0.00, NULL, NULL),
(54, '2026-01-28 00:18:40.000000', '2026-01-28 00:20:01.000000', 'MOMO', 'PENDING', '21/63 đường số 2, Phuoc Long B, Thu Duc, Ho Chi Minh', 'DELIVERED', 342000.00, NULL, 6, 8, 38000.00, 'KHONGGIAM', 'Shop giao hàng tiêu chuẩn'),
(55, '2026-01-28 00:19:06.000000', '2026-01-28 00:19:54.000000', 'COD', 'PENDING', '21/63 đường số 2, Phuoc Long B, Thu Duc, Ho Chi Minh', 'DELIVERED', 342000.00, NULL, 6, 8, 38000.00, 'KHONGGIAM', 'Shop giao hàng tiêu chuẩn'),
(56, '2026-01-28 01:07:53.000000', '2026-01-28 23:16:45.000000', 'COD', 'PENDING', '21/63 đường số 2, Phuoc Long B, Tân Phú, Ho Chi Minh', 'DELIVERED', 252000.00, NULL, 6, 8, 0.00, NULL, 'Shop sẽ đặt Grab giao hàng. Quý khách vui lòng thanh toán phí ship cho tài xế.'),
(57, '2026-01-28 01:46:32.000000', '2026-01-28 23:16:49.000000', 'MOMO', 'PENDING', '21/63 đường số 2, Phuoc Long B, Thu Duc, Ho Chi Minh', 'DELIVERED', 475000.00, NULL, 6, 8, 0.00, NULL, 'Shop giao hàng tiêu chuẩn'),
(58, '2026-01-28 21:58:52.000000', '2026-01-28 21:58:52.000000', 'COD', 'PENDING', '21/63 đường số 2, Phuoc Long B, Thu Duc, Ho Chi Minh', 'PENDING', 507000.00, NULL, 6, 8, 0.00, NULL, 'Shop giao hàng tiêu chuẩn'),
(59, '2026-01-28 22:02:38.000000', '2026-01-28 23:16:54.000000', 'COD', 'PENDING', '54/23, Cai Be, Quan 1, hcm', 'DELIVERED', 72000.00, NULL, 7, 4, 0.00, NULL, 'Shop giao hàng tiêu chuẩn'),
(60, '2026-01-29 00:43:54.000000', '2026-01-29 00:43:54.000000', 'COD', 'PENDING', '54/23, Cai Be, Quan 1, hcm', 'PENDING', 1236000.00, NULL, 7, 4, 0.00, NULL, 'Shop giao hàng tiêu chuẩn'),
(61, '2026-01-29 00:47:31.000000', '2026-01-29 00:47:31.000000', 'COD', 'PENDING', '54/23, Cai Be, Quan 1, hcm', 'PENDING', 140000.00, NULL, 7, 4, 0.00, NULL, 'Shop giao hàng tiêu chuẩn'),
(62, '2026-01-29 00:48:03.000000', '2026-01-29 00:48:03.000000', 'COD', 'PENDING', '54/23, Cai Be, Quan 1, hcm', 'PENDING', 129000.00, NULL, 7, 4, 0.00, NULL, 'Shop giao hàng tiêu chuẩn'),
(63, '2026-01-29 00:50:41.000000', '2026-01-29 00:50:41.000000', 'MOMO', 'PENDING', '54/23, Cai Be, Tan Phu, hcm', 'PENDING', 420000.00, NULL, 7, 4, 0.00, NULL, 'Shop sẽ đặt Grab giao hàng. Quý khách vui lòng thanh toán phí ship cho tài xế.'),
(64, '2026-01-29 00:54:47.000000', '2026-01-29 00:54:47.000000', 'MOMO', 'PENDING', '54/23, Cai Be, Tan Phu, hcm', 'PENDING', 420000.00, NULL, 7, 4, 0.00, NULL, 'Shop sẽ đặt Grab giao hàng. Quý khách vui lòng thanh toán phí ship cho tài xế.'),
(65, '2026-01-29 00:56:21.000000', '2026-01-29 00:56:21.000000', 'MOMO', 'PENDING', '54/23, Cai Be, Tan Phu, hcm', 'PENDING', 420000.00, NULL, 7, 4, 0.00, NULL, 'Shop sẽ đặt Grab giao hàng. Quý khách vui lòng thanh toán phí ship cho tài xế.'),
(66, '2026-01-29 01:33:22.000000', '2026-01-29 01:33:22.000000', 'MOMO', 'PENDING', '23, Phước Long B, QUận 2, Hồ Chí Minh', 'PENDING', 1084500.00, NULL, 8, 5, 120500.00, 'KHONGGIAM', 'Shop sẽ đặt Grab giao hàng. Quý khách vui lòng thanh toán phí ship cho tài xế.'),
(67, '2026-01-29 01:39:38.000000', '2026-01-29 01:39:52.000000', 'MOMO', 'PAID', '23, Phước Long B, QUận 2, Hồ Chí Minh', 'PROCESSING', 1205000.00, NULL, 8, 5, 0.00, NULL, 'Shop sẽ đặt Grab giao hàng. Quý khách vui lòng thanh toán phí ship cho tài xế.'),
(68, '2026-01-29 23:34:27.000000', '2026-01-29 23:35:11.000000', 'MOMO', 'FAILED', '23, Phước Long B, QUận 2, Hồ Chí Minh', 'PENDING', 913500.00, NULL, 8, 5, 101500.00, 'KHONGGIAM', 'Shop sẽ đặt Grab giao hàng. Quý khách vui lòng thanh toán phí ship cho tài xế.'),
(69, '2026-01-29 23:35:44.000000', '2026-01-29 23:35:58.000000', 'MOMO', 'PAID', '23, Phước Long B, QUận 2, Hồ Chí Minh', 'PROCESSING', 115000.00, NULL, 8, 5, 0.00, NULL, 'Shop sẽ đặt Grab giao hàng. Quý khách vui lòng thanh toán phí ship cho tài xế.'),
(70, '2026-01-30 01:43:29.000000', '2026-01-30 01:44:07.000000', 'MOMO', 'FAILED', '23, Phước Long B, QUận 1, Hồ Chí Minh', 'PENDING', 2078000.00, NULL, 8, 5, 0.00, NULL, 'Shop giao hàng tiêu chuẩn');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) NOT NULL,
  `quantity` int(11) NOT NULL,
  `refunded_quantity` int(11) NOT NULL DEFAULT 0,
  `total_price` decimal(10,2) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `order_id` bigint(20) NOT NULL,
  `product_variant_id` bigint(20) DEFAULT NULL,
  `product_id` bigint(20) DEFAULT NULL,
  `updated_at` timestamp(6) NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `is_gift` bit(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `order_items`
--

INSERT INTO `order_items` (`id`, `quantity`, `refunded_quantity`, `total_price`, `unit_price`, `order_id`, `product_variant_id`, `product_id`, `updated_at`, `created_at`, `is_gift`) VALUES
(1, 1, 0, 2500000.00, 2500000.00, 1, 1, NULL, NULL, '2026-01-18 08:39:47.111236', b'0'),
(2, 1, 0, 2300000.00, 2300000.00, 1, 3, NULL, NULL, '2026-01-18 08:39:47.111236', b'0'),
(3, 1, 0, 28000.00, 28000.00, 2, 12, NULL, NULL, '2026-01-18 08:39:47.111236', b'0'),
(4, 1, 0, 24000.00, 24000.00, 3, 11, NULL, NULL, '2026-01-18 08:39:47.111236', b'0'),
(5, 1, 0, 28000.00, 28000.00, 3, 12, NULL, NULL, '2026-01-18 08:39:47.111236', b'0'),
(6, 1, 0, 110000.00, 110000.00, 3, 13, NULL, NULL, '2026-01-18 08:39:47.111236', b'0'),
(25, 1, 0, 32000.00, 32000.00, 19, 16, 19, '2026-01-18 01:44:45.000000', '2026-01-18 01:44:45.000000', b'0'),
(26, 2, 0, 98000.00, 27000.00, 19, 15, 18, '2026-01-18 01:44:45.000000', '2026-01-18 01:44:45.000000', b'0'),
(27, 1, 0, 30000.00, 13000.00, 21, NULL, 20, '2026-01-18 01:53:26.000000', '2026-01-18 01:53:26.000000', b'0'),
(28, 1, 0, 13000.00, 13000.00, 21, NULL, 20, '2026-01-18 01:53:26.000000', '2026-01-18 01:53:26.000000', b'0'),
(29, 1, 0, 32000.00, 32000.00, 21, 16, 19, '2026-01-18 01:53:26.000000', '2026-01-18 01:53:26.000000', b'0'),
(30, 1, 0, 27000.00, 27000.00, 21, 15, 18, '2026-01-18 01:53:26.000000', '2026-01-18 01:53:26.000000', b'0'),
(31, 1, 0, 12000.00, 12000.00, 21, 9, 12, '2026-01-18 01:53:26.000000', '2026-01-18 01:53:26.000000', b'0'),
(32, 1, -1, 27000.00, 27000.00, 22, 15, 18, '2026-01-19 02:56:17.000000', '2026-01-18 02:01:07.000000', b'0'),
(33, 1, 0, 32000.00, 32000.00, 22, 16, 19, '2026-01-18 02:01:07.000000', '2026-01-18 02:01:07.000000', b'0'),
(34, 1, 0, 44000.00, 17000.00, 22, NULL, 20, '2026-01-18 02:01:07.000000', '2026-01-18 02:01:07.000000', b'0'),
(35, 1, 0, 57000.00, 32000.00, 23, 16, 19, '2026-01-18 02:13:43.000000', '2026-01-18 02:13:43.000000', b'0'),
(36, 1, 0, 24000.00, 24000.00, 23, 11, 14, '2026-01-18 02:13:44.000000', '2026-01-18 02:13:44.000000', b'0'),
(37, 1, 0, 49000.00, 32000.00, 24, 16, 19, '2026-01-18 02:25:52.000000', '2026-01-18 02:25:52.000000', b'0'),
(38, 2, 0, 64000.00, 27000.00, 25, 15, 18, '2026-01-18 02:29:16.000000', '2026-01-18 02:29:16.000000', b'0'),
(39, 1, 0, 13000.00, 13000.00, 26, NULL, 20, '2026-01-18 04:14:52.000000', '2026-01-18 04:14:52.000000', b'0'),
(40, 2, 0, 108000.00, 32000.00, 26, 16, 19, '2026-01-18 04:14:52.000000', '2026-01-18 04:14:52.000000', b'0'),
(41, 1, 0, 13000.00, 13000.00, 27, NULL, 20, '2026-01-18 04:15:13.000000', '2026-01-18 04:15:13.000000', b'0'),
(42, 2, 0, 108000.00, 32000.00, 27, 16, 19, '2026-01-18 04:15:13.000000', '2026-01-18 04:15:13.000000', b'0'),
(43, 1, 0, 13000.00, 13000.00, 28, NULL, 20, '2026-01-18 04:15:31.000000', '2026-01-18 04:15:31.000000', b'0'),
(44, 2, 0, 108000.00, 32000.00, 28, 16, 19, '2026-01-18 04:15:31.000000', '2026-01-18 04:15:31.000000', b'0'),
(45, 1, 0, 49000.00, 32000.00, 29, 16, 19, '2026-01-18 04:18:25.000000', '2026-01-18 04:18:25.000000', b'0'),
(46, 1, 0, 49000.00, 32000.00, 30, 16, 19, '2026-01-18 04:21:46.000000', '2026-01-18 04:21:46.000000', b'0'),
(47, 1, 0, 49000.00, 32000.00, 31, 16, 19, '2026-01-18 04:23:51.000000', '2026-01-18 04:23:51.000000', b'0'),
(48, 2, 0, 98000.00, 32000.00, 32, 16, 19, '2026-01-18 04:25:27.000000', '2026-01-18 04:25:27.000000', b'0'),
(49, 2, 0, 98000.00, 32000.00, 33, 16, 19, '2026-01-18 04:37:51.000000', '2026-01-18 04:37:51.000000', b'0'),
(50, 2, 0, 98000.00, 32000.00, 34, 16, 19, '2026-01-18 06:52:24.000000', '2026-01-18 06:52:24.000000', b'0'),
(51, 2, 0, 98000.00, 32000.00, 35, 16, 19, '2026-01-18 06:54:02.000000', '2026-01-18 06:54:02.000000', b'0'),
(52, 1, 0, 42000.00, 32000.00, 36, 16, 19, '2026-01-18 06:57:09.000000', '2026-01-18 06:57:09.000000', b'0'),
(53, 1, 0, 42000.00, 32000.00, 36, 16, 19, '2026-01-18 06:57:09.000000', '2026-01-18 06:57:09.000000', b'0'),
(54, 1, 0, 58000.00, 48000.00, 37, 61, 93, '2026-01-18 23:21:50.000000', '2026-01-18 23:21:50.000000', b'0'),
(55, 1, 0, 34000.00, 34000.00, 37, 63, 94, '2026-01-18 23:21:50.000000', '2026-01-18 23:21:50.000000', b'0'),
(56, 1, 0, 38000.00, 38000.00, 37, 60, 93, '2026-01-18 23:21:50.000000', '2026-01-18 23:21:50.000000', b'0'),
(57, 1, 0, 58000.00, 48000.00, 38, 61, 93, '2026-01-18 23:22:14.000000', '2026-01-18 23:22:14.000000', b'0'),
(58, 1, 0, 34000.00, 34000.00, 38, 63, 94, '2026-01-18 23:22:14.000000', '2026-01-18 23:22:14.000000', b'0'),
(59, 1, 0, 38000.00, 38000.00, 38, 60, 93, '2026-01-18 23:22:14.000000', '2026-01-18 23:22:14.000000', b'0'),
(60, 1, 0, 58000.00, 48000.00, 39, 61, 93, '2026-01-18 23:30:37.000000', '2026-01-18 23:30:37.000000', b'0'),
(61, 1, 0, 34000.00, 34000.00, 39, 63, 94, '2026-01-18 23:30:37.000000', '2026-01-18 23:30:37.000000', b'0'),
(62, 1, 0, 38000.00, 38000.00, 39, 60, 93, '2026-01-18 23:30:37.000000', '2026-01-18 23:30:37.000000', b'0'),
(63, 1, 0, 58000.00, 48000.00, 40, 61, 93, '2026-01-18 23:40:19.000000', '2026-01-18 23:40:19.000000', b'0'),
(64, 1, 0, 34000.00, 34000.00, 40, 63, 94, '2026-01-18 23:40:19.000000', '2026-01-18 23:40:19.000000', b'0'),
(65, 1, 0, 38000.00, 38000.00, 40, 60, 93, '2026-01-18 23:40:19.000000', '2026-01-18 23:40:19.000000', b'0'),
(66, 1, 0, 58000.00, 48000.00, 41, 61, 93, '2026-01-18 23:48:27.000000', '2026-01-18 23:48:27.000000', b'0'),
(67, 1, 0, 34000.00, 34000.00, 41, 63, 94, '2026-01-18 23:48:27.000000', '2026-01-18 23:48:27.000000', b'0'),
(68, 1, 0, 38000.00, 38000.00, 41, 60, 93, '2026-01-18 23:48:27.000000', '2026-01-18 23:48:27.000000', b'0'),
(69, 1, 0, 58000.00, 48000.00, 42, 61, 93, '2026-01-18 23:56:09.000000', '2026-01-18 23:56:09.000000', b'0'),
(70, 1, 0, 34000.00, 34000.00, 42, 63, 94, '2026-01-18 23:56:09.000000', '2026-01-18 23:56:09.000000', b'0'),
(71, 1, 0, 38000.00, 38000.00, 42, 60, 93, '2026-01-18 23:56:09.000000', '2026-01-18 23:56:09.000000', b'0'),
(72, 1, 0, 58000.00, 48000.00, 43, 61, 93, '2026-01-19 00:01:08.000000', '2026-01-19 00:01:08.000000', b'0'),
(73, 1, 0, 34000.00, 34000.00, 43, 63, 94, '2026-01-19 00:01:08.000000', '2026-01-19 00:01:08.000000', b'0'),
(74, 1, 0, 38000.00, 38000.00, 43, 60, 93, '2026-01-19 00:01:08.000000', '2026-01-19 00:01:08.000000', b'0'),
(75, 1, 0, 58000.00, 48000.00, 44, 61, 93, '2026-01-19 00:07:48.000000', '2026-01-19 00:07:48.000000', b'0'),
(76, 1, 0, 34000.00, 34000.00, 44, 63, 94, '2026-01-19 00:07:48.000000', '2026-01-19 00:07:48.000000', b'0'),
(77, 1, 0, 38000.00, 38000.00, 44, 60, 93, '2026-01-19 00:07:48.000000', '2026-01-19 00:07:48.000000', b'0'),
(78, 1, 0, 58000.00, 48000.00, 45, 61, 93, '2026-01-19 00:11:56.000000', '2026-01-19 00:11:56.000000', b'0'),
(79, 1, 0, 34000.00, 34000.00, 45, 63, 94, '2026-01-19 00:11:56.000000', '2026-01-19 00:11:56.000000', b'0'),
(80, 1, 0, 38000.00, 38000.00, 45, 60, 93, '2026-01-19 00:11:56.000000', '2026-01-19 00:11:56.000000', b'0'),
(81, 1, 0, 58000.00, 48000.00, 46, 61, 93, '2026-01-19 00:13:22.000000', '2026-01-19 00:13:22.000000', b'0'),
(82, 1, 0, 34000.00, 34000.00, 46, 63, 94, '2026-01-19 00:13:22.000000', '2026-01-19 00:13:22.000000', b'0'),
(83, 1, 0, 38000.00, 38000.00, 46, 60, 93, '2026-01-19 00:13:22.000000', '2026-01-19 00:13:22.000000', b'0'),
(84, 1, 0, 74000.00, 52000.00, 47, 59, 92, '2026-01-19 00:20:25.000000', '2026-01-19 00:20:25.000000', b'0'),
(85, 1, 0, 54000.00, 32000.00, 47, 57, 92, '2026-01-19 00:20:26.000000', '2026-01-19 00:20:26.000000', b'0'),
(86, 1, 0, 48000.00, 38000.00, 48, 60, 93, '2026-01-19 01:18:37.000000', '2026-01-19 01:18:37.000000', b'0'),
(87, 1, 0, 55000.00, 38000.00, 49, 60, 93, '2026-01-21 00:02:43.000000', '2026-01-21 00:02:43.000000', b'0'),
(88, 1, 0, 32000.00, 32000.00, 49, 57, 92, '2026-01-21 00:02:43.000000', '2026-01-21 00:02:43.000000', b'0'),
(89, 2, 0, 146000.00, 38000.00, 50, 60, 93, '2026-01-21 01:27:48.000000', '2026-01-21 01:27:48.000000', b'0'),
(90, 6, 0, 228000.00, 38000.00, 51, 60, 93, '2026-01-27 22:00:52.000000', '2026-01-27 22:00:52.000000', b'0'),
(91, 1, 0, 65000.00, 55000.00, 52, NULL, 107, '2026-01-27 23:05:59.000000', '2026-01-27 23:05:59.000000', b'0'),
(92, 1, 0, 65000.00, 55000.00, 53, NULL, 107, '2026-01-27 23:06:38.000000', '2026-01-27 23:06:38.000000', b'0'),
(93, 1, 0, 380000.00, 380000.00, 54, NULL, 110, '2026-01-28 00:18:40.000000', '2026-01-28 00:18:40.000000', b'0'),
(94, 1, 0, 380000.00, 380000.00, 55, NULL, 110, '2026-01-28 00:19:06.000000', '2026-01-28 00:19:06.000000', b'0'),
(95, 3, 0, 96000.00, 32000.00, 56, 57, 92, '2026-01-28 01:07:53.000000', '2026-01-28 01:07:53.000000', b'0'),
(96, 3, 0, 156000.00, 52000.00, 56, 59, 92, '2026-01-28 01:07:53.000000', '2026-01-28 01:07:53.000000', b'0'),
(97, 1, 0, 55000.00, 55000.00, 57, NULL, 107, '2026-01-28 01:46:32.000000', '2026-01-28 01:46:32.000000', b'0'),
(98, 1, 0, 420000.00, 420000.00, 57, NULL, 111, '2026-01-28 01:46:32.000000', '2026-01-28 01:46:32.000000', b'0'),
(99, 1, 0, 32000.00, 32000.00, 58, 57, 92, '2026-01-28 21:58:52.000000', '2026-01-28 21:58:52.000000', b'0'),
(100, 1, 0, 55000.00, 55000.00, 58, NULL, 107, '2026-01-28 21:58:52.000000', '2026-01-28 21:58:52.000000', b'0'),
(101, 1, 0, 420000.00, 420000.00, 58, NULL, 111, '2026-01-28 21:58:52.000000', '2026-01-28 21:58:52.000000', b'0'),
(102, 1, 0, 20000.00, 20000.00, 59, NULL, 20, '2026-01-28 22:02:38.000000', '2026-01-28 22:02:38.000000', b'0'),
(103, 1, 0, 17000.00, 17000.00, 59, NULL, 20, '2026-01-28 22:02:38.000000', '2026-01-28 22:02:38.000000', b'0'),
(104, 1, 0, 35000.00, 28000.00, 59, 12, 15, '2026-01-28 22:02:38.000000', '2026-01-28 22:02:38.000000', b'0'),
(105, 3, 0, 1140000.00, 380000.00, 60, NULL, 110, '2026-01-29 00:43:54.000000', '2026-01-29 00:43:54.000000', b'0'),
(106, 3, 0, 96000.00, 32000.00, 60, 57, 92, '2026-01-29 00:43:54.000000', '2026-01-29 00:43:54.000000', b'0'),
(107, 3, 0, 0.00, 0.00, 61, NULL, 97, '2026-01-29 00:47:31.000000', '2026-01-29 00:47:31.000000', b'1'),
(108, 10, 0, 140000.00, 14000.00, 61, NULL, 97, '2026-01-29 00:47:31.000000', '2026-01-29 00:47:31.000000', b'0'),
(109, 1, 0, 95000.00, 95000.00, 62, NULL, 102, '2026-01-29 00:48:03.000000', '2026-01-29 00:48:03.000000', b'0'),
(110, 1, 0, 34000.00, 34000.00, 62, 63, 94, '2026-01-29 00:48:03.000000', '2026-01-29 00:48:03.000000', b'0'),
(111, 1, 0, 420000.00, 420000.00, 63, NULL, 111, '2026-01-29 00:50:41.000000', '2026-01-29 00:50:41.000000', b'0'),
(112, 1, 0, 420000.00, 420000.00, 64, NULL, 111, '2026-01-29 00:54:47.000000', '2026-01-29 00:54:47.000000', b'0'),
(113, 1, 0, 420000.00, 420000.00, 65, NULL, 111, '2026-01-29 00:56:21.000000', '2026-01-29 00:56:21.000000', b'0'),
(114, 1, 0, 65000.00, 38000.00, 66, 60, 93, '2026-01-29 01:33:22.000000', '2026-01-29 01:33:22.000000', b'0'),
(115, 3, 0, 0.00, 0.00, 66, 57, 92, '2026-01-29 01:33:22.000000', '2026-01-29 01:33:22.000000', b'1'),
(116, 3, 0, 1140000.00, 380000.00, 66, NULL, 110, '2026-01-29 01:33:22.000000', '2026-01-29 01:33:22.000000', b'0'),
(117, 1, 0, 65000.00, 38000.00, 67, 60, 93, '2026-01-29 01:39:38.000000', '2026-01-29 01:39:38.000000', b'0'),
(118, 3, 0, 0.00, 0.00, 67, 57, 92, '2026-01-29 01:39:38.000000', '2026-01-29 01:39:38.000000', b'1'),
(119, 3, 0, 1140000.00, 380000.00, 67, NULL, 110, '2026-01-29 01:39:38.000000', '2026-01-29 01:39:38.000000', b'0'),
(120, 2, 0, 30000.00, 15000.00, 68, NULL, 96, '2026-01-29 23:34:27.000000', '2026-01-29 23:34:27.000000', b'0'),
(121, 2, 0, 900000.00, 450000.00, 68, NULL, 109, '2026-01-29 23:34:27.000000', '2026-01-29 23:34:27.000000', b'0'),
(122, 5, 0, 85000.00, 12000.00, 68, NULL, 98, '2026-01-29 23:34:27.000000', '2026-01-29 23:34:27.000000', b'0'),
(123, 2, 0, 30000.00, 15000.00, 69, NULL, 96, '2026-01-29 23:35:44.000000', '2026-01-29 23:35:44.000000', b'0'),
(124, 5, 0, 85000.00, 12000.00, 69, NULL, 98, '2026-01-29 23:35:44.000000', '2026-01-29 23:35:44.000000', b'0'),
(125, 10, 0, 140000.00, 14000.00, 70, NULL, 97, '2026-01-30 01:43:29.000000', '2026-01-30 01:43:29.000000', b'0'),
(126, 3, 0, 0.00, 0.00, 70, NULL, 97, '2026-01-30 01:43:29.000000', '2026-01-30 01:43:29.000000', b'1'),
(127, 5, 0, 170000.00, 34000.00, 70, 63, 94, '2026-01-30 01:43:29.000000', '2026-01-30 01:43:29.000000', b'0'),
(128, 4, 0, 1768000.00, 420000.00, 70, NULL, 111, '2026-01-30 01:43:29.000000', '2026-01-30 01:43:29.000000', b'0');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_item_toppings`
--

CREATE TABLE `order_item_toppings` (
  `id` bigint(20) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `price` decimal(10,2) NOT NULL,
  `order_item_id` bigint(20) NOT NULL,
  `topping_id` bigint(20) NOT NULL,
  `topping_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `order_item_toppings`
--

INSERT INTO `order_item_toppings` (`id`, `created_at`, `updated_at`, `price`, `order_item_id`, `topping_id`, `topping_name`) VALUES
(4, '2026-01-18 01:44:45.000000', '2026-01-18 01:44:45.000000', 7000.00, 26, 2, 'Pudding trứng'),
(5, '2026-01-18 01:44:45.000000', '2026-01-18 01:44:45.000000', 5000.00, 26, 4, 'Bánh vụn (oreo, bánh quế nghiền)'),
(6, '2026-01-18 01:44:45.000000', '2026-01-18 01:44:45.000000', 10000.00, 26, 7, 'Chocolate chips / sốt chocolate – vị ngọt đắng'),
(7, '2026-01-18 01:53:26.000000', '2026-01-18 01:53:26.000000', 5000.00, 27, 1, 'Trân châu đen'),
(8, '2026-01-18 01:53:26.000000', '2026-01-18 01:53:26.000000', 7000.00, 27, 2, 'Pudding trứng'),
(9, '2026-01-18 01:53:26.000000', '2026-01-18 01:53:26.000000', 5000.00, 27, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(10, '2026-01-18 02:01:07.000000', '2026-01-18 02:01:07.000000', 7000.00, 34, 2, 'Pudding trứng'),
(11, '2026-01-18 02:01:07.000000', '2026-01-18 02:01:07.000000', 5000.00, 34, 4, 'Bánh vụn (oreo, bánh quế nghiền)'),
(12, '2026-01-18 02:01:07.000000', '2026-01-18 02:01:07.000000', 5000.00, 34, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(13, '2026-01-18 02:01:07.000000', '2026-01-18 02:01:07.000000', 10000.00, 34, 7, 'Chocolate chips / sốt chocolate – vị ngọt đắng'),
(14, '2026-01-18 02:13:43.000000', '2026-01-18 02:13:43.000000', 5000.00, 35, 1, 'Trân châu đen'),
(15, '2026-01-18 02:13:43.000000', '2026-01-18 02:13:43.000000', 5000.00, 35, 4, 'Bánh vụn (oreo, bánh quế nghiền)'),
(16, '2026-01-18 02:13:43.000000', '2026-01-18 02:13:43.000000', 5000.00, 35, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(17, '2026-01-18 02:13:43.000000', '2026-01-18 02:13:43.000000', 10000.00, 35, 7, 'Chocolate chips / sốt chocolate – vị ngọt đắng'),
(18, '2026-01-18 02:25:52.000000', '2026-01-18 02:25:52.000000', 7000.00, 37, 2, 'Pudding trứng'),
(19, '2026-01-18 02:25:52.000000', '2026-01-18 02:25:52.000000', 5000.00, 37, 4, 'Bánh vụn (oreo, bánh quế nghiền)'),
(20, '2026-01-18 02:25:52.000000', '2026-01-18 02:25:52.000000', 5000.00, 37, 8, 'Trân châu trắng'),
(21, '2026-01-18 02:29:16.000000', '2026-01-18 02:29:16.000000', 5000.00, 38, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(22, '2026-01-18 04:14:52.000000', '2026-01-18 04:14:52.000000', 5000.00, 40, 1, 'Trân châu đen'),
(23, '2026-01-18 04:14:52.000000', '2026-01-18 04:14:52.000000', 7000.00, 40, 2, 'Pudding trứng'),
(24, '2026-01-18 04:14:52.000000', '2026-01-18 04:14:52.000000', 5000.00, 40, 4, 'Bánh vụn (oreo, bánh quế nghiền)'),
(25, '2026-01-18 04:14:52.000000', '2026-01-18 04:14:52.000000', 5000.00, 40, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(26, '2026-01-18 04:15:13.000000', '2026-01-18 04:15:13.000000', 5000.00, 42, 1, 'Trân châu đen'),
(27, '2026-01-18 04:15:13.000000', '2026-01-18 04:15:13.000000', 7000.00, 42, 2, 'Pudding trứng'),
(28, '2026-01-18 04:15:13.000000', '2026-01-18 04:15:13.000000', 5000.00, 42, 4, 'Bánh vụn (oreo, bánh quế nghiền)'),
(29, '2026-01-18 04:15:13.000000', '2026-01-18 04:15:13.000000', 5000.00, 42, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(30, '2026-01-18 04:15:31.000000', '2026-01-18 04:15:31.000000', 5000.00, 44, 1, 'Trân châu đen'),
(31, '2026-01-18 04:15:31.000000', '2026-01-18 04:15:31.000000', 7000.00, 44, 2, 'Pudding trứng'),
(32, '2026-01-18 04:15:31.000000', '2026-01-18 04:15:31.000000', 5000.00, 44, 4, 'Bánh vụn (oreo, bánh quế nghiền)'),
(33, '2026-01-18 04:15:31.000000', '2026-01-18 04:15:31.000000', 5000.00, 44, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(34, '2026-01-18 04:18:25.000000', '2026-01-18 04:18:25.000000', 5000.00, 45, 1, 'Trân châu đen'),
(35, '2026-01-18 04:18:25.000000', '2026-01-18 04:18:25.000000', 7000.00, 45, 2, 'Pudding trứng'),
(36, '2026-01-18 04:18:25.000000', '2026-01-18 04:18:25.000000', 5000.00, 45, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(37, '2026-01-18 04:21:46.000000', '2026-01-18 04:21:46.000000', 5000.00, 46, 1, 'Trân châu đen'),
(38, '2026-01-18 04:21:46.000000', '2026-01-18 04:21:46.000000', 7000.00, 46, 2, 'Pudding trứng'),
(39, '2026-01-18 04:21:46.000000', '2026-01-18 04:21:46.000000', 5000.00, 46, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(40, '2026-01-18 04:23:51.000000', '2026-01-18 04:23:51.000000', 5000.00, 47, 1, 'Trân châu đen'),
(41, '2026-01-18 04:23:51.000000', '2026-01-18 04:23:51.000000', 7000.00, 47, 2, 'Pudding trứng'),
(42, '2026-01-18 04:23:51.000000', '2026-01-18 04:23:51.000000', 5000.00, 47, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(43, '2026-01-18 04:25:27.000000', '2026-01-18 04:25:27.000000', 5000.00, 48, 1, 'Trân châu đen'),
(44, '2026-01-18 04:25:27.000000', '2026-01-18 04:25:27.000000', 7000.00, 48, 2, 'Pudding trứng'),
(45, '2026-01-18 04:25:27.000000', '2026-01-18 04:25:27.000000', 5000.00, 48, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(46, '2026-01-18 04:37:51.000000', '2026-01-18 04:37:51.000000', 5000.00, 49, 1, 'Trân châu đen'),
(47, '2026-01-18 04:37:51.000000', '2026-01-18 04:37:51.000000', 7000.00, 49, 2, 'Pudding trứng'),
(48, '2026-01-18 04:37:51.000000', '2026-01-18 04:37:51.000000', 5000.00, 49, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(49, '2026-01-18 06:52:24.000000', '2026-01-18 06:52:24.000000', 5000.00, 50, 1, 'Trân châu đen'),
(50, '2026-01-18 06:52:24.000000', '2026-01-18 06:52:24.000000', 7000.00, 50, 2, 'Pudding trứng'),
(51, '2026-01-18 06:52:24.000000', '2026-01-18 06:52:24.000000', 5000.00, 50, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(52, '2026-01-18 06:54:02.000000', '2026-01-18 06:54:02.000000', 5000.00, 51, 1, 'Trân châu đen'),
(53, '2026-01-18 06:54:02.000000', '2026-01-18 06:54:02.000000', 7000.00, 51, 2, 'Pudding trứng'),
(54, '2026-01-18 06:54:02.000000', '2026-01-18 06:54:02.000000', 5000.00, 51, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(55, '2026-01-18 06:57:09.000000', '2026-01-18 06:57:09.000000', 5000.00, 52, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(56, '2026-01-18 06:57:09.000000', '2026-01-18 06:57:09.000000', 5000.00, 52, 8, 'Trân châu trắng'),
(57, '2026-01-18 06:57:09.000000', '2026-01-18 06:57:09.000000', 5000.00, 53, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(58, '2026-01-18 06:57:09.000000', '2026-01-18 06:57:09.000000', 5000.00, 53, 8, 'Trân châu trắng'),
(59, '2026-01-18 23:21:50.000000', '2026-01-18 23:21:50.000000', 5000.00, 54, 1, 'Trân châu đen'),
(60, '2026-01-18 23:21:50.000000', '2026-01-18 23:21:50.000000', 5000.00, 54, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(61, '2026-01-18 23:22:14.000000', '2026-01-18 23:22:14.000000', 5000.00, 57, 1, 'Trân châu đen'),
(62, '2026-01-18 23:22:14.000000', '2026-01-18 23:22:14.000000', 5000.00, 57, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(63, '2026-01-18 23:30:37.000000', '2026-01-18 23:30:37.000000', 5000.00, 60, 1, 'Trân châu đen'),
(64, '2026-01-18 23:30:37.000000', '2026-01-18 23:30:37.000000', 5000.00, 60, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(65, '2026-01-18 23:40:19.000000', '2026-01-18 23:40:19.000000', 5000.00, 63, 1, 'Trân châu đen'),
(66, '2026-01-18 23:40:19.000000', '2026-01-18 23:40:19.000000', 5000.00, 63, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(67, '2026-01-18 23:48:27.000000', '2026-01-18 23:48:27.000000', 5000.00, 66, 1, 'Trân châu đen'),
(68, '2026-01-18 23:48:27.000000', '2026-01-18 23:48:27.000000', 5000.00, 66, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(69, '2026-01-18 23:56:09.000000', '2026-01-18 23:56:09.000000', 5000.00, 69, 1, 'Trân châu đen'),
(70, '2026-01-18 23:56:09.000000', '2026-01-18 23:56:09.000000', 5000.00, 69, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(71, '2026-01-19 00:01:08.000000', '2026-01-19 00:01:08.000000', 5000.00, 72, 1, 'Trân châu đen'),
(72, '2026-01-19 00:01:08.000000', '2026-01-19 00:01:08.000000', 5000.00, 72, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(73, '2026-01-19 00:07:48.000000', '2026-01-19 00:07:48.000000', 5000.00, 75, 1, 'Trân châu đen'),
(74, '2026-01-19 00:07:48.000000', '2026-01-19 00:07:48.000000', 5000.00, 75, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(75, '2026-01-19 00:11:56.000000', '2026-01-19 00:11:56.000000', 5000.00, 78, 1, 'Trân châu đen'),
(76, '2026-01-19 00:11:56.000000', '2026-01-19 00:11:56.000000', 5000.00, 78, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(77, '2026-01-19 00:13:22.000000', '2026-01-19 00:13:22.000000', 5000.00, 81, 1, 'Trân châu đen'),
(78, '2026-01-19 00:13:22.000000', '2026-01-19 00:13:22.000000', 5000.00, 81, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(79, '2026-01-19 00:20:25.000000', '2026-01-19 00:20:25.000000', 5000.00, 84, 1, 'Trân châu đen'),
(80, '2026-01-19 00:20:26.000000', '2026-01-19 00:20:26.000000', 7000.00, 84, 2, 'Pudding trứng'),
(81, '2026-01-19 00:20:26.000000', '2026-01-19 00:20:26.000000', 5000.00, 84, 4, 'Bánh vụn (oreo, bánh quế nghiền)'),
(82, '2026-01-19 00:20:26.000000', '2026-01-19 00:20:26.000000', 5000.00, 84, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(83, '2026-01-19 00:20:26.000000', '2026-01-19 00:20:26.000000', 5000.00, 85, 1, 'Trân châu đen'),
(84, '2026-01-19 00:20:26.000000', '2026-01-19 00:20:26.000000', 7000.00, 85, 2, 'Pudding trứng'),
(85, '2026-01-19 00:20:26.000000', '2026-01-19 00:20:26.000000', 5000.00, 85, 4, 'Bánh vụn (oreo, bánh quế nghiền)'),
(86, '2026-01-19 00:20:26.000000', '2026-01-19 00:20:26.000000', 5000.00, 85, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(87, '2026-01-19 01:18:37.000000', '2026-01-19 01:18:37.000000', 5000.00, 86, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(88, '2026-01-19 01:18:37.000000', '2026-01-19 01:18:37.000000', 5000.00, 86, 8, 'Trân châu trắng'),
(89, '2026-01-21 00:02:43.000000', '2026-01-21 00:02:43.000000', 5000.00, 87, 1, 'Trân châu đen'),
(90, '2026-01-21 00:02:43.000000', '2026-01-21 00:02:43.000000', 7000.00, 87, 2, 'Pudding trứng'),
(91, '2026-01-21 00:02:43.000000', '2026-01-21 00:02:43.000000', 5000.00, 87, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(92, '2026-01-21 01:27:48.000000', '2026-01-21 01:27:48.000000', 5000.00, 89, 1, 'Trân châu đen'),
(93, '2026-01-21 01:27:48.000000', '2026-01-21 01:27:48.000000', 7000.00, 89, 2, 'Pudding trứng'),
(94, '2026-01-21 01:27:48.000000', '2026-01-21 01:27:48.000000', 8000.00, 89, 3, 'Thạch phô mai'),
(95, '2026-01-21 01:27:48.000000', '2026-01-21 01:27:48.000000', 5000.00, 89, 4, 'Bánh vụn (oreo, bánh quế nghiền)'),
(96, '2026-01-21 01:27:48.000000', '2026-01-21 01:27:48.000000', 5000.00, 89, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(97, '2026-01-21 01:27:48.000000', '2026-01-21 01:27:48.000000', 5000.00, 89, 8, 'Trân châu trắng'),
(98, '2026-01-27 23:05:59.000000', '2026-01-27 23:05:59.000000', 5000.00, 91, 1, 'Trân châu đen'),
(99, '2026-01-27 23:05:59.000000', '2026-01-27 23:05:59.000000', 5000.00, 91, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(100, '2026-01-27 23:06:38.000000', '2026-01-27 23:06:38.000000', 5000.00, 92, 1, 'Trân châu đen'),
(101, '2026-01-27 23:06:38.000000', '2026-01-27 23:06:38.000000', 5000.00, 92, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(102, '2026-01-28 22:02:38.000000', '2026-01-28 22:02:38.000000', 7000.00, 104, 2, 'Pudding trứng'),
(103, '2026-01-29 01:33:22.000000', '2026-01-29 01:33:22.000000', 5000.00, 114, 1, 'Trân châu đen'),
(104, '2026-01-29 01:33:22.000000', '2026-01-29 01:33:22.000000', 7000.00, 114, 2, 'Pudding trứng'),
(105, '2026-01-29 01:33:22.000000', '2026-01-29 01:33:22.000000', 5000.00, 114, 4, 'Bánh vụn (oreo, bánh quế nghiền)'),
(106, '2026-01-29 01:33:22.000000', '2026-01-29 01:33:22.000000', 5000.00, 114, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(107, '2026-01-29 01:33:22.000000', '2026-01-29 01:33:22.000000', 5000.00, 114, 8, 'Trân châu trắng'),
(108, '2026-01-29 01:39:38.000000', '2026-01-29 01:39:38.000000', 5000.00, 117, 1, 'Trân châu đen'),
(109, '2026-01-29 01:39:38.000000', '2026-01-29 01:39:38.000000', 7000.00, 117, 2, 'Pudding trứng'),
(110, '2026-01-29 01:39:38.000000', '2026-01-29 01:39:38.000000', 5000.00, 117, 4, 'Bánh vụn (oreo, bánh quế nghiền)'),
(111, '2026-01-29 01:39:38.000000', '2026-01-29 01:39:38.000000', 5000.00, 117, 5, 'Hạt khô (hạnh nhân, đậu phộng, óc chó…) – tạo độ giòn'),
(112, '2026-01-29 01:39:38.000000', '2026-01-29 01:39:38.000000', 5000.00, 117, 8, 'Trân châu trắng'),
(113, '2026-01-29 23:34:27.000000', '2026-01-29 23:34:27.000000', 5000.00, 122, 4, 'Bánh vụn (oreo, bánh quế nghiền)'),
(114, '2026-01-29 23:35:44.000000', '2026-01-29 23:35:44.000000', 5000.00, 124, 4, 'Bánh vụn (oreo, bánh quế nghiền)'),
(115, '2026-01-30 01:43:29.000000', '2026-01-30 01:43:29.000000', 5000.00, 128, 1, 'Trân châu đen'),
(116, '2026-01-30 01:43:29.000000', '2026-01-30 01:43:29.000000', 7000.00, 128, 2, 'Pudding trứng'),
(117, '2026-01-30 01:43:29.000000', '2026-01-30 01:43:29.000000', 5000.00, 128, 4, 'Bánh vụn'),
(118, '2026-01-30 01:43:29.000000', '2026-01-30 01:43:29.000000', 5000.00, 128, 5, 'Hạt khô_tạo độ giòn');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` bigint(20) NOT NULL,
  `expiry_date` datetime(6) NOT NULL,
  `token` varchar(255) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `id` bigint(20) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `amount` decimal(10,2) NOT NULL,
  `payload` text DEFAULT NULL,
  `payment_method` varchar(255) NOT NULL,
  `status` enum('FAILED','PENDING','SUCCESSFUL') NOT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `order_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `payment_transactions`
--

INSERT INTO `payment_transactions` (`id`, `created_at`, `updated_at`, `amount`, `payload`, `payment_method`, `status`, `transaction_id`, `order_id`) VALUES
(1, '2026-01-18 01:44:45.000000', '2026-01-18 01:44:45.000000', 130000.00, NULL, 'VNPAY', 'PENDING', NULL, 19),
(2, '2026-01-18 01:53:26.000000', '2026-01-18 01:53:26.000000', 114000.00, NULL, 'VNPAY', 'PENDING', NULL, 21),
(3, '2026-01-18 02:01:07.000000', '2026-01-18 02:01:07.000000', 92700.00, NULL, 'VNPAY', 'PENDING', NULL, 22),
(4, '2026-01-18 02:13:44.000000', '2026-01-18 02:13:44.000000', 72900.00, NULL, 'VNPAY', 'PENDING', NULL, 23),
(5, '2026-01-18 02:25:52.000000', '2026-01-18 02:25:52.000000', 49000.00, NULL, 'VNPAY', 'PENDING', NULL, 24),
(6, '2026-01-18 04:15:13.000000', '2026-01-18 04:15:13.000000', 108900.00, NULL, 'VNPAY', 'PENDING', NULL, 27),
(7, '2026-01-18 04:18:25.000000', '2026-01-18 04:18:25.000000', 49000.00, '{\"amount\":\"49000\",\"partnerCode\":\"MOMO\",\"orderId\":\"29_1768735105578\",\"requestId\":\"8b2a432d-86a7-4c63-8050-e183cca2c2aa\",\"responseTime\":\"1768735106241\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3wyOV8xNzY4NzM1MTA1NTc4&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3wyOV8xNzY4NzM1MTA1NTc4&v=3.0&sr=0&sig=0ab70e2736951f6da56269942d943cc979c50fcf041f72706c3c00e5\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3wyOV8xNzY4NzM1MTA1NTc4&s=0ce19574a708b84a80ebbfe7e4c9ad9cbb6f522ac4d5e8519d98cbdaef6b3c01\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3wyOV8xNzY4NzM1MTA1NTc4&v=3.0\"}', 'MOMO', 'PENDING', '29_1768735105578', 29),
(8, '2026-01-18 04:21:46.000000', '2026-01-18 04:21:46.000000', 49000.00, '{\"amount\":\"49000\",\"partnerCode\":\"MOMO\",\"orderId\":\"30_1768735306104\",\"requestId\":\"8d5b3caf-7e87-459d-855a-a6ed37c53d7a\",\"responseTime\":\"1768735306707\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3wzMF8xNzY4NzM1MzA2MTA0&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3wzMF8xNzY4NzM1MzA2MTA0&v=3.0&sr=0&sig=3e03d2e3c95c65989b24bc6c1237ceed428f14cf940e68d7f9c18672\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3wzMF8xNzY4NzM1MzA2MTA0&s=1fdb8b88d98a80057632038b4ec44721ff346848416b7091c3f9897c6471881b\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3wzMF8xNzY4NzM1MzA2MTA0&v=3.0\"}', 'MOMO', 'PENDING', '30_1768735306104', 30),
(9, '2026-01-18 04:23:51.000000', '2026-01-18 04:24:07.000000', 49000.00, '{\"amount\":\"49000\",\"partnerCode\":\"MOMO\",\"orderId\":\"31_1768735431819\",\"requestId\":\"bc1040a1-fcab-41d6-a9cb-716fb8c8fcce\",\"responseTime\":\"1768735432445\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3wzMV8xNzY4NzM1NDMxODE5&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3wzMV8xNzY4NzM1NDMxODE5&v=3.0&sr=0&sig=6d0b11b664e21b6fc5fb2e2fb19cae92339b8d2e6bc39db128b5d8dc\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3wzMV8xNzY4NzM1NDMxODE5&s=34aa957b7ee663db80b5f48faadfc6793f749a34220b136f2154fe44ec44aba2\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3wzMV8xNzY4NzM1NDMxODE5&v=3.0\"}', 'MOMO', 'SUCCESSFUL', '31_1768735431819', 31),
(10, '2026-01-18 04:25:28.000000', '2026-01-18 04:25:43.000000', 88200.00, '{\"amount\":\"88200\",\"partnerCode\":\"MOMO\",\"orderId\":\"32_1768735527949\",\"requestId\":\"ee422ee7-70a4-4232-98f8-f9489691c734\",\"responseTime\":\"1768735528563\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3wzMl8xNzY4NzM1NTI3OTQ5&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3wzMl8xNzY4NzM1NTI3OTQ5&v=3.0&sr=0&sig=15444ec945307becbbded5dccdfe8e2c0b59c9a221f12cebc26b1d0e\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3wzMl8xNzY4NzM1NTI3OTQ5&s=b1391bdd611c387703fe8a86929d4ae3a86e476e339150a291fe79a227a66870\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3wzMl8xNzY4NzM1NTI3OTQ5&v=3.0\"}', 'MOMO', 'SUCCESSFUL', '32_1768735527949', 32),
(11, '2026-01-18 04:37:52.000000', '2026-01-18 04:38:01.000000', 98000.00, '{\"amount\":\"98000\",\"partnerCode\":\"MOMO\",\"orderId\":\"33_1768736271921\",\"requestId\":\"8b26b2f6-fea7-4be9-83ab-5d52373c96e4\",\"responseTime\":\"1768736273220\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3wzM18xNzY4NzM2MjcxOTIx&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3wzM18xNzY4NzM2MjcxOTIx&v=3.0&sr=0&sig=01ca2ac9fe0304591801faf5327fb831004a8c8af461dee68fdee799\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3wzM18xNzY4NzM2MjcxOTIx&s=46f79b5a570450db1611b4018165ef07a0fa08b01b09db698197a67a028b0b24\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3wzM18xNzY4NzM2MjcxOTIx&v=3.0\"}', 'MOMO', 'FAILED', '33_1768736271921', 33),
(12, '2026-01-18 06:52:24.000000', '2026-01-18 06:52:24.000000', 98000.00, '{\"amount\":\"98000\",\"partnerCode\":\"MOMO\",\"orderId\":\"34_1768744344715\",\"requestId\":\"14ff997c-edd3-4b79-a510-1af4ee04a27b\",\"responseTime\":\"1768744345299\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3wzNF8xNzY4NzQ0MzQ0NzE1&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3wzNF8xNzY4NzQ0MzQ0NzE1&v=3.0&sr=0&sig=5eef32a1ec4a24cce7a9121735e4686fc008300b18c9a8fe5c7fa67a\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3wzNF8xNzY4NzQ0MzQ0NzE1&s=d4b34037d96f722af117065fda968554744fca984fb61b8ca8fdcda8fab37aeb\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3wzNF8xNzY4NzQ0MzQ0NzE1&v=3.0\"}', 'MOMO', 'PENDING', '34_1768744344715', 34),
(13, '2026-01-18 06:57:11.000000', '2026-01-18 06:57:20.000000', 84000.00, '{\"amount\":\"84000\",\"partnerCode\":\"MOMO\",\"orderId\":\"36_1768744630078\",\"requestId\":\"84f8a75e-096d-46b0-a2b8-49b011471292\",\"responseTime\":\"1768744632157\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3wzNl8xNzY4NzQ0NjMwMDc4&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3wzNl8xNzY4NzQ0NjMwMDc4&v=3.0&sr=0&sig=955ed86511ca9c736c0b279ec9701e704bf34f67301e2d883e7b8fc2\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3wzNl8xNzY4NzQ0NjMwMDc4&s=9c98f158eb7dd736a7061b758fb6e91a8f13a2e382a3c0ccd29d5297ddba1088\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3wzNl8xNzY4NzQ0NjMwMDc4&v=3.0\"}', 'MOMO', 'FAILED', '36_1768744630078', 36),
(14, '2026-01-18 23:21:50.000000', '2026-01-18 23:21:50.000000', 130000.00, NULL, 'VNPAY', 'PENDING', NULL, 37),
(15, '2026-01-18 23:22:15.000000', '2026-01-18 23:22:15.000000', 130000.00, '{\"amount\":\"130000\",\"partnerCode\":\"MOMO\",\"orderId\":\"38_1768803734198\",\"requestId\":\"fbed6f54-1d74-4651-9aed-2e51089fdbc2\",\"responseTime\":\"1768803735439\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3wzOF8xNzY4ODAzNzM0MTk4&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3wzOF8xNzY4ODAzNzM0MTk4&v=3.0&sr=0&sig=645839075b01aaed1e456beb6e44cac24cbeea6ae46f1146dd22ad12\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3wzOF8xNzY4ODAzNzM0MTk4&s=05d775ae8fc539119755f2dc6284a48bb8c600f5dae60b33c813cd67c57972f4\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3wzOF8xNzY4ODAzNzM0MTk4&v=3.0\"}', 'MOMO', 'PENDING', '38_1768803734198', 38),
(16, '2026-01-18 23:30:40.000000', '2026-01-18 23:30:40.000000', 117000.00, '{\"amount\":\"117000\",\"partnerCode\":\"MOMO\",\"orderId\":\"39_1768804238068\",\"requestId\":\"a06f5b71-59dc-4b47-840c-7bccfe34c040\",\"responseTime\":\"1768804240744\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3wzOV8xNzY4ODA0MjM4MDY4&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3wzOV8xNzY4ODA0MjM4MDY4&v=3.0&sr=0&sig=ea3bd6ec45c73c959c6cbe39abefe3738ca63ee4103cfb8ff535d7ad\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3wzOV8xNzY4ODA0MjM4MDY4&s=0684f47ba69c27234f7d94caaebe39263c28fed9e509258062a78e3fd8e3a685\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3wzOV8xNzY4ODA0MjM4MDY4&v=3.0\"}', 'MOMO', 'PENDING', '39_1768804238068', 39),
(17, '2026-01-18 23:40:21.000000', '2026-01-18 23:40:21.000000', 117000.00, '{\"amount\":\"117000\",\"partnerCode\":\"MOMO\",\"orderId\":\"40_1768804820346\",\"requestId\":\"7b3f628f-2855-45cb-9322-29846fcad1fd\",\"responseTime\":\"1768804821506\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3w0MF8xNzY4ODA0ODIwMzQ2&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3w0MF8xNzY4ODA0ODIwMzQ2&v=3.0&sr=0&sig=84ee15705bcf1c010b6c5356bdc15bdb3fbe3ba8e9bb32a2154cfe86\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3w0MF8xNzY4ODA0ODIwMzQ2&s=141f5a7d424ee08eb31f6b3388218ca9ed0c86c8131d8862cac1c3d10e60f94e\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3w0MF8xNzY4ODA0ODIwMzQ2&v=3.0\"}', 'MOMO', 'PENDING', '40_1768804820346', 40),
(18, '2026-01-18 23:48:28.000000', '2026-01-18 23:48:57.000000', 130000.00, '{\"amount\":\"130000\",\"partnerCode\":\"MOMO\",\"orderId\":\"41_1768805308012\",\"requestId\":\"04f71044-bd20-4f48-9797-c890474c178d\",\"responseTime\":\"1768805308944\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3w0MV8xNzY4ODA1MzA4MDEy&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3w0MV8xNzY4ODA1MzA4MDEy&v=3.0&sr=0&sig=db3612d99c9a2140b940cc46f70ca22c2e03e6a540b3e726e035a741\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3w0MV8xNzY4ODA1MzA4MDEy&s=0c4de32634b198a959a3e1c5573bb769cdbd2b003c99758a4194f417b01254f6\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3w0MV8xNzY4ODA1MzA4MDEy&v=3.0\"}', 'MOMO', 'SUCCESSFUL', '41_1768805308012', 41),
(19, '2026-01-18 23:56:29.000000', '2026-01-18 23:56:45.000000', 117000.00, '{\"amount\":\"117000\",\"partnerCode\":\"MOMO\",\"orderId\":\"42_1768805770545\",\"requestId\":\"6dacaa0b-d3c9-4e0a-ac80-0d3a49a61c0c\",\"responseTime\":\"1768805789234\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3w0Ml8xNzY4ODA1NzcwNTQ1&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3w0Ml8xNzY4ODA1NzcwNTQ1&v=3.0&sr=0&sig=86a23564f527ca30e85c097b02b12d98fe983cbe41863149c7ca782b\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3w0Ml8xNzY4ODA1NzcwNTQ1&s=4e40893ef12854edbc8d3b4267d5a703bf0bc24afbc044cd54d3a4ef2c1df15d\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3w0Ml8xNzY4ODA1NzcwNTQ1&v=3.0\"}', 'MOMO', 'SUCCESSFUL', '42_1768805770545', 42),
(20, '2026-01-19 00:01:09.000000', '2026-01-19 00:01:30.000000', 130000.00, '{\"amount\":\"130000\",\"partnerCode\":\"MOMO\",\"orderId\":\"43_1768806068806\",\"requestId\":\"c4a32fa1-b365-4be2-9eb2-6603ca63626f\",\"responseTime\":\"1768806069801\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3w0M18xNzY4ODA2MDY4ODA2&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3w0M18xNzY4ODA2MDY4ODA2&v=3.0&sr=0&sig=4b191fdebbe851b0b58ed57881c8041603aaa9f60ad9dcee2b4dd18d\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3w0M18xNzY4ODA2MDY4ODA2&s=43cb51ab02f91e0f5e10aec080701daae5fdaacc3d58fc26964f917951ee4b8e\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3w0M18xNzY4ODA2MDY4ODA2&v=3.0\"}', 'MOMO', 'SUCCESSFUL', '43_1768806068806', 43),
(21, '2026-01-19 00:07:49.000000', '2026-01-19 00:08:03.000000', 117000.00, '{\"amount\":\"117000\",\"partnerCode\":\"MOMO\",\"orderId\":\"44_1768806468929\",\"requestId\":\"4dc2c42a-b527-42c3-a625-491fb348d9f6\",\"responseTime\":\"1768806469977\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3w0NF8xNzY4ODA2NDY4OTI5&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3w0NF8xNzY4ODA2NDY4OTI5&v=3.0&sr=0&sig=5e011e2ff9708d58539a8545c0cd2d3bcc3b7ee14e6cb05c5710972d\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3w0NF8xNzY4ODA2NDY4OTI5&s=67c2b925f3ce0f72413ea25dd0f72ed811afc750fe3a26f3830dbfeb24e9349f\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3w0NF8xNzY4ODA2NDY4OTI5&v=3.0\"}', 'MOMO', 'SUCCESSFUL', '44_1768806468929', 44),
(22, '2026-01-19 00:11:59.000000', '2026-01-19 00:11:59.000000', 117000.00, '{\"amount\":\"117000\",\"partnerCode\":\"MOMO\",\"orderId\":\"45_1768806717943\",\"requestId\":\"4ccb52eb-6dbb-47e9-80b6-1fbc0158069b\",\"responseTime\":\"1768806719337\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3w0NV8xNzY4ODA2NzE3OTQz&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3w0NV8xNzY4ODA2NzE3OTQz&v=3.0&sr=0&sig=b5632b6ccee212c4ac71aae1efa9bfafdd2c42e0fda2ee2d07845067\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3w0NV8xNzY4ODA2NzE3OTQz&s=3daff9bc142b40de22f7ecb4242352740aec1e970c8fd58c7fd9303b8ede64c2\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3w0NV8xNzY4ODA2NzE3OTQz&v=3.0\"}', 'MOMO', 'PENDING', '45_1768806717943', 45),
(23, '2026-01-19 00:13:22.000000', '2026-01-19 00:13:31.000000', 117000.00, '{\"amount\":\"117000\",\"partnerCode\":\"MOMO\",\"orderId\":\"46_1768806802575\",\"requestId\":\"129c669a-aaa0-45ac-ac5b-707318107609\",\"responseTime\":\"1768806802766\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3w0Nl8xNzY4ODA2ODAyNTc1&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3w0Nl8xNzY4ODA2ODAyNTc1&v=3.0&sr=0&sig=72a0f40d11eb43d21aedbfb8400b071c56bc2924a382f0935229dde3\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3w0Nl8xNzY4ODA2ODAyNTc1&s=b61217c307688e8c548974272143ad45034e938932b9841b6bf1ca127ed038ab\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3w0Nl8xNzY4ODA2ODAyNTc1&v=3.0\"}', 'MOMO', 'SUCCESSFUL', '46_1768806802575', 46),
(24, '2026-01-19 00:20:27.000000', '2026-01-19 00:20:40.000000', 115200.00, '{\"amount\":\"115200\",\"partnerCode\":\"MOMO\",\"orderId\":\"47_1768807226653\",\"requestId\":\"26b792c3-5823-4fc3-9967-8da0284238f6\",\"responseTime\":\"1768807227707\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3w0N18xNzY4ODA3MjI2NjUz&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3w0N18xNzY4ODA3MjI2NjUz&v=3.0&sr=0&sig=a01d8bf4a463902bb0b689160aa90a3e8b169c936ed6c60172f0860b\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3w0N18xNzY4ODA3MjI2NjUz&s=c3338343e1fd9986121578fa8209e65df601214b605d425a196b0ae6c90cb21a\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3w0N18xNzY4ODA3MjI2NjUz&v=3.0\"}', 'MOMO', 'SUCCESSFUL', '47_1768807226653', 47),
(25, '2026-01-19 01:18:39.000000', '2026-01-19 01:18:51.000000', 48000.00, '{\"amount\":\"48000\",\"partnerCode\":\"MOMO\",\"orderId\":\"48_1768810718152\",\"requestId\":\"5096281a-7b8a-4270-ad41-3856f0a41324\",\"responseTime\":\"1768810719319\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3w0OF8xNzY4ODEwNzE4MTUy&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3w0OF8xNzY4ODEwNzE4MTUy&v=3.0&sr=0&sig=3dc0ebd79b67907e969dc901bdfa11fb66af089f5a0c68dceba2c06e\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3w0OF8xNzY4ODEwNzE4MTUy&s=aa453aa0ffe4d5ed892633bf9d948dea3e2e7132c38817a76d323b54ac06546b\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3w0OF8xNzY4ODEwNzE4MTUy&v=3.0\"}', 'MOMO', 'SUCCESSFUL', '48_1768810718152', 48),
(26, '2026-01-29 01:33:26.000000', '2026-01-29 01:33:26.000000', 1084500.00, '{\"amount\":\"1084500\",\"partnerCode\":\"MOMO\",\"orderId\":\"66_1769675604602\",\"requestId\":\"ec115726-c1cb-418e-a8e6-f9d30e0c6907\",\"responseTime\":\"1769675600464\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3w2Nl8xNzY5Njc1NjA0NjAy&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3w2Nl8xNzY5Njc1NjA0NjAy&v=3.0&sr=0&sig=90580fa232a7bb3cf80ec759c3df3ffbe8b0f2e821dfe69ed5263453\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3w2Nl8xNzY5Njc1NjA0NjAy&s=9177cf24419021b8da4b28314d1154495e787a79478351c6ba90177d137a87c4\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3w2Nl8xNzY5Njc1NjA0NjAy&v=3.0\"}', 'MOMO', 'PENDING', '66_1769675604602', 66),
(27, '2026-01-29 01:39:39.000000', '2026-01-29 01:39:52.000000', 1205000.00, '{\"amount\":\"1205000\",\"partnerCode\":\"MOMO\",\"orderId\":\"67_1769675979177\",\"requestId\":\"304a49c3-581e-44d6-8a59-df4ef8f299ca\",\"responseTime\":\"1769675973809\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3w2N18xNzY5Njc1OTc5MTc3&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3w2N18xNzY5Njc1OTc5MTc3&v=3.0&sr=0&sig=e15fbac04372714c6009b0d8a7b4a70a936df819e70a16e12abe2003\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3w2N18xNzY5Njc1OTc5MTc3&s=5a24f640960cc66500e3854486a7e7982ba1f8fb9afb05070d641f2904668a0a\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3w2N18xNzY5Njc1OTc5MTc3&v=3.0\"}', 'MOMO', 'SUCCESSFUL', '67_1769675979177', 67),
(28, '2026-01-29 23:34:33.000000', '2026-01-29 23:35:11.000000', 913500.00, '{\"amount\":\"913500\",\"partnerCode\":\"MOMO\",\"orderId\":\"68_1769754871664\",\"requestId\":\"dce4f59f-0783-4b98-a885-a67c956bf9e0\",\"responseTime\":\"1769754867877\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3w2OF8xNzY5NzU0ODcxNjY0&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3w2OF8xNzY5NzU0ODcxNjY0&v=3.0&sr=0&sig=ab624f26fb772653f26cf09e9a9450d3bc8004f869c02f82987bbe71\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3w2OF8xNzY5NzU0ODcxNjY0&s=9e167fef936f00dacc6ba8c18cbad5bc3688ffaf4bfd186309807cb2619ee679\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3w2OF8xNzY5NzU0ODcxNjY0&v=3.0\"}', 'MOMO', 'FAILED', '68_1769754871664', 68),
(29, '2026-01-29 23:35:45.000000', '2026-01-29 23:35:58.000000', 115000.00, '{\"amount\":\"115000\",\"partnerCode\":\"MOMO\",\"orderId\":\"69_1769754945185\",\"requestId\":\"bf47591c-2daa-4fe1-bfc2-6681c31a3754\",\"responseTime\":\"1769754939621\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3w2OV8xNzY5NzU0OTQ1MTg1&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3w2OV8xNzY5NzU0OTQ1MTg1&v=3.0&sr=0&sig=db129d7bb18de5ae70d2050b5265dca1f6d12ffaf996f3134361e9fe\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3w2OV8xNzY5NzU0OTQ1MTg1&s=90a9df8021dec5d89a03aabdedfba45fecb2d68e226519cf9738591d408f75d1\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3w2OV8xNzY5NzU0OTQ1MTg1&v=3.0\"}', 'MOMO', 'SUCCESSFUL', '69_1769754945185', 69),
(30, '2026-01-30 01:43:30.000000', '2026-01-30 01:44:07.000000', 2078000.00, '{\"amount\":\"2078000\",\"partnerCode\":\"MOMO\",\"orderId\":\"70_1769762609937\",\"requestId\":\"fe06b3a6-9096-4891-a1cc-ff73f33c3fa1\",\"responseTime\":\"1769762604721\",\"deeplink\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=app&sid=TU9NT3w3MF8xNzY5NzYyNjA5OTM3&v=3.0\",\"qrCodeUrl\":\"momo://app?action=payWithApp&isScanQR=true&serviceType=qr&sid=TU9NT3w3MF8xNzY5NzYyNjA5OTM3&v=3.0&sr=0&sig=b6b989244dba2e1834517b8685cf0a161f1edf1e8a3e6beb773754b7\",\"resultCode\":\"0\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3w3MF8xNzY5NzYyNjA5OTM3&s=6ca2e6f8aeb397bec9686785f3efa1d170a095ecddba3dfb4f7386129cb35a1a\",\"message\":\"Thành công.\",\"deeplinkMiniApp\":\"momo://app?action=payWithApp&isScanQR=false&serviceType=miniapp&sid=TU9NT3w3MF8xNzY5NzYyNjA5OTM3&v=3.0\"}', 'MOMO', 'FAILED', '70_1769762609937', 70);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` bigint(20) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `average_rating` double DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `is_featured` bit(1) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `review_count` int(11) DEFAULT NULL,
  `specifications` text DEFAULT NULL,
  `view_count` bigint(20) DEFAULT NULL,
  `category_id` bigint(20) DEFAULT NULL,
  `stock_quantity` int(11) DEFAULT NULL,
  `available_sizes` varchar(255) DEFAULT NULL,
  `sold_count` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `created_at`, `updated_at`, `average_rating`, `description`, `image_url`, `is_active`, `is_featured`, `name`, `price`, `review_count`, `specifications`, `view_count`, `category_id`, `stock_quantity`, `available_sizes`, `sold_count`) VALUES
(1, '2025-12-16 03:09:05.000000', '2025-12-26 19:30:11.000000', 5, 'Kem vani mịn, béo nhẹ, hương vị truyền thống dễ ăn, phù hợp mọi lứa tuổi.', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766801743/hrevnwzwqpof3kwojyrl.jpg', b'0', b'1', 'Kem Ly Vani Truyền Thống', 2500000.00, 1, '{\"Layout\":\"75% (TKL)\",\"Kết nối\":\"3 Mode (USB-C, 2.4Ghz, Bluetooth)\"}', 11, 4, NULL, NULL, NULL),
(2, '2025-12-16 03:09:05.000000', '2025-12-26 19:31:44.000000', 0, 'Kem chocolate đậm vị kết hợp ốc quế giòn tan.', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766801281/tsfq4noyizfeptaeaioh.jpg', b'0', b'0', 'Kem Ốc Quế Chocolate', 2300000.00, 0, '{\"Nút bấm\":\"Silent Click\",\"DPI\":\"8000 DPI\"}', 21, 5, NULL, NULL, NULL),
(12, '2025-12-27 02:55:51.000000', '2026-01-11 00:37:23.000000', NULL, 'Kem que vị dâu mát lạnh', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766804327/ofiyjnqtvouaamm8e0l9.jpg', b'1', b'1', 'Kem que dâu', 15000.00, NULL, NULL, 33, 6, NULL, NULL, NULL),
(13, '2025-12-27 02:55:51.000000', '2026-01-11 00:42:08.000000', NULL, 'Tên sản phẩm: Kem Que Socola\nMô tả:\nKem Que Socola là món kem cổ điển, thơm ngon, được phủ lớp socola mịn bên ngoài và kem sữa mềm mượt bên trong. Đây là lựa chọn lý tưởng cho những ai yêu thích vị socola ngọt đậm đà, dễ ăn và tiện lợi.\n\nThành phần chính:\nKem sữa / kem vani: tạo độ mềm mịn bên trong\nLớp phủ socola: socola đen hoặc socola sữa, tan ngay khi cắn\nĐường và hương liệu tự nhiên: cân bằng vị ngọt và tăng hương thơm\nQue gỗ: tiện cầm nắm và ăn ngay\n\nHình thức:\nKem que dài, gọn, phủ socola toàn bộ bề mặt\nPhục vụ trực tiếp trên que, không cần cốc hay dụng cụ khác\nKích cỡ: 70–120ml/que tùy thương hiệu\nVị giác & cảm giác:\nLớp socola giòn tan khi cắn\nKem bên trong mềm mượt, mát lạnh\nVị ngọt vừa phải, thơm socola, kết hợp với hương kem sữa béo ngậy\nĂn trực tiếp, tiện lợi cho mọi lúc, mọi nơi\n\nPhù hợp với:\nTrẻ em và người lớn yêu thích socola\nLà snack tráng miệng nhanh hoặc món giải nhiệt mùa hè\nCó thể dùng kết hợp với topping, rắc hạt, hay sốt socola để tăng trải nghiệm', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766804403/w5mknsbazeehxd3owqnm.jpg', b'1', b'0', 'Kem Que Socola', 18000.00, NULL, NULL, 14, 4, NULL, NULL, NULL),
(14, '2025-12-27 02:55:51.000000', '2026-01-18 11:03:16.000000', NULL, 'Kem ly vani truyền thống', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766804539/hvk3jywh7pijfzag4j1u.jpg', b'1', b'1', 'Kem ly vani', 25000.00, NULL, NULL, 16, 5, NULL, NULL, NULL),
(15, '2025-12-27 02:55:51.000000', '2026-01-12 08:28:00.000000', NULL, 'Kem ốc quế socola & vani', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766804605/iyavgmp6xfvp26dki7yn.jpg', b'1', b'0', 'Kem ốc quế mix vị', 30000.00, NULL, NULL, 6, 6, NULL, NULL, NULL),
(16, '2025-12-27 02:55:51.000000', '2026-01-13 17:44:04.000000', NULL, 'Kem hộp lớn cho gia đình', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766804713/latjk3dzxyrtwgyfdcrj.jpg', b'1', b'1', 'Kem hộp gia đình', 120000.00, NULL, NULL, 4, 9, NULL, NULL, NULL),
(18, '2026-01-09 18:11:52.000000', '2026-01-23 18:34:21.000000', 5, 'kem hương ốc quế', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768007534/ffe2tplqw0gjfrgmygsv.jpg', b'1', b'1', 'Kem Ly Sữa Chua', 34000.00, 1, NULL, 51, 6, NULL, NULL, NULL),
(19, '2026-01-09 20:07:33.000000', '2026-01-20 23:50:36.000000', 0, 'Mô tả:\nKem Ly Sữa là món kem mịn, béo ngậy được phục vụ trong cốc nhỏ, thích hợp ăn trực tiếp hoặc kết hợp với các topping khác. Sản phẩm có vị sữa tự nhiên thơm dịu, kết cấu mềm mượt và tan ngay trong miệng.\n\nThành phần chính:\nSữa tươi / kem sữa: tạo độ béo và mịn\nĐường: cân bằng vị ngọt nhẹ\nTinh chất vanilla hoặc hương sữa tự nhiên: làm tăng hương thơm\nTopping tuỳ chọn: có thể thêm socola, caramel, trái cây, bánh vụn hoặc hạt ngũ cốc\nHình thức:\nĐược phục vụ trong cốc (ly)\nThường ăn kèm muỗng nhựa hoặc muỗng gỗ nhỏ gọn\n\nKích cỡ: khoảng 120–200ml/ly\nVị giác & cảm giác:\nVị ngọt dịu, béo vừa phải\nHương sữa thơm nhẹ, không gắt\nKhi ăn có cảm giác mát lạnh và mịn mượt\nCó thể kết hợp với topping tạo vị đa dạng: caramel ngọt, socola đậm, trái cây thanh mát\nPhù hợp với:\nTrẻ em, thanh thiếu niên, người thích vị kem sữa tự nhiên\nĂn trực tiếp hoặc làm nền cho kem mix nhiều hương vị khác', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768036583/hh88mzysnhqnbw9x4qbv.webp', b'1', b'1', 'Kem Ly Sữa ', 34000.00, 0, NULL, 60, 7, 4, '', NULL),
(20, '2026-01-10 02:31:34.000000', '2026-01-28 22:02:38.000000', 0, 'Thành phần chính:\n\nKem sữa/vanilla: tạo độ mềm mượt\n\nLớp phủ socola sữa: giòn tan, thơm ngon\n\nQue gỗ tiện cầm\n\nĐường và hương liệu tự nhiên\n\nHình thức:\n\nKem que dài, gọn, phủ socola toàn bộ\n\nPhục vụ trực tiếp trên que\n\nKích thước: ~70–120ml/que\n\nVị giác & cảm giác:\n\nLớp socola giòn, tan ngay khi cắn\n\nKem bên trong mềm mượt, mát lạnh\n\nVị ngọt vừa phải, thơm socola, kết hợp với hương kem sữa béo ngậy\n\nPhù hợp với:\n\nTrẻ em và người lớn yêu thích socola\n\nĂn trực tiếp, snack giải nhiệt nhanh\n\nCó thể dùng kết hợp với topping hoặc sốt để tăng trải nghiệm', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768037496/oeqxsesbaql6yb9mucip.jpg', b'1', b'0', 'Kem Que Socola Classic', 13000.00, 0, NULL, 26, 6, 38, 'M,L,XL', NULL),
(21, '2026-01-19 04:46:28.000000', '2026-01-21 01:11:38.000000', 4.7, 'Kem que socola đen đậm đà với 70% cacao, lớp phủ giòn tan', 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=400', b'0', b'1', 'Kem Que Socola Đen', 15000.00, 156, NULL, 2101, 6, 150, NULL, NULL),
(22, '2026-01-19 04:46:28.000000', '2026-01-21 01:11:38.000000', 4.5, 'Kem que dâu tây tươi mát với hạt dâu thật bên trong', 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400', b'0', b'1', 'Kem Que Dâu Tây', 14000.00, 120, NULL, 1801, 6, 200, NULL, NULL),
(23, '2026-01-19 04:46:28.000000', '2026-01-21 01:11:38.000000', 4.3, 'Kem que vani truyền thống với vị ngọt thanh tự nhiên', 'https://images.unsplash.com/photo-1560008581-09826d1de69e?w=400', b'0', b'0', 'Kem Que Vani Classic', 12000.00, 89, NULL, 1501, 6, 180, NULL, NULL),
(24, '2026-01-19 04:46:28.000000', '2026-01-21 01:11:38.000000', 4.6, 'Kem que dừa béo ngậy với cốt dừa tươi và dừa nạo', 'https://images.unsplash.com/photo-1629385701021-fcd568a743e8?w=400', b'0', b'0', 'Kem Que Dừa Béo', 16000.00, 95, NULL, 1601, 6, 120, NULL, NULL),
(25, '2026-01-19 04:46:28.000000', '2026-01-21 01:11:38.000000', 4.4, 'Kem que xoài tươi mát với miếng xoài thật', 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400', b'0', b'1', 'Kem Que Xoài Nhiệt Đới', 15000.00, 78, NULL, 1201, 6, 90, NULL, NULL),
(26, '2026-01-19 04:46:28.000000', '2026-01-21 01:11:38.000000', 4.8, 'Kem que trà xanh matcha Nhật Bản nguyên chất', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', b'0', b'1', 'Kem Que Matcha', 18000.00, 145, NULL, 2200, 6, 80, NULL, NULL),
(27, '2026-01-19 04:46:28.000000', '2026-01-21 01:11:38.000000', 4.9, 'Kem ly socola kết hợp với brownie thơm ngon', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', b'0', b'1', 'Kem Ly Socola Brownie', 35000.00, 210, NULL, 3501, 7, 60, NULL, NULL),
(28, '2026-01-19 04:46:28.000000', '2026-01-21 01:11:38.000000', 4.7, 'Kem ly vani phủ sốt caramel mặn ngọt hài hòa', 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?w=400', b'0', b'1', 'Kem Ly Vani Caramel', 32000.00, 180, NULL, 2801, 7, 75, NULL, NULL),
(29, '2026-01-19 04:46:28.000000', '2026-01-21 01:11:38.000000', 4.6, 'Kem ly dâu tây với lớp cheesecake béo ngậy', 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400', b'0', b'0', 'Kem Ly Dâu Cheesecake', 38000.00, 120, NULL, 2000, 7, 50, NULL, NULL),
(30, '2026-01-19 04:46:28.000000', '2026-01-19 04:46:28.000000', 4.8, 'Kem vani với vụn bánh Oreo giòn tan', 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400', b'1', b'1', 'Kem Ly Cookies & Cream', 34000.00, 165, NULL, 2600, 7, 85, NULL, NULL),
(31, '2026-01-19 04:46:28.000000', '2026-01-19 04:46:28.000000', 4.9, 'Kem trà sữa thơm ngon với trân châu dai mềm', 'https://images.unsplash.com/photo-1559703248-dcaaec9fab78?w=400', b'1', b'1', 'Kem Ly Trà Sữa Trân Châu', 36000.00, 230, NULL, 3800, 7, 40, NULL, NULL),
(32, '2026-01-19 04:46:28.000000', '2026-01-19 04:46:28.000000', 4.5, 'Kem tiramisu đậm vị cà phê và mascarpone', 'https://images.unsplash.com/photo-1557142046-c704a3adf364?w=400', b'1', b'0', 'Kem Ly Tiramisu', 40000.00, 95, NULL, 1500, 7, 55, NULL, NULL),
(33, '2026-01-19 04:46:28.000000', '2026-01-19 04:46:28.000000', 4.8, 'Kem cuộn dâu tây tươi với topping dâu tươi', 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400', b'1', b'1', 'Kem Cuộn Dâu Tây Fresh', 45000.00, 200, NULL, 3200, 5, 30, NULL, NULL),
(34, '2026-01-19 04:46:28.000000', '2026-01-19 04:46:28.000000', 4.9, 'Kem cuộn vani với Oreo nghiền và kem tươi', 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400', b'1', b'1', 'Kem Cuộn Oreo', 48000.00, 250, NULL, 4000, 5, 25, NULL, NULL),
(35, '2026-01-19 04:46:28.000000', '2026-01-19 04:46:28.000000', 4.7, 'Kem cuộn Nutella kết hợp chuối tươi', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', b'1', b'0', 'Kem Cuộn Nutella Banana', 50000.00, 150, NULL, 2500, 5, 35, NULL, NULL),
(36, '2026-01-19 04:46:28.000000', '2026-01-19 04:46:28.000000', 4.8, 'Kem cuộn matcha với đậu đỏ Nhật Bản', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', b'1', b'1', 'Kem Cuộn Matcha Red Bean', 52000.00, 180, NULL, 2900, 5, 20, NULL, NULL),
(37, '2026-01-19 04:46:28.000000', '2026-01-19 04:46:28.000000', 4.6, 'Kem cuộn xoài kết hợp xôi dừa', 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400', b'1', b'0', 'Kem Cuộn Mango Sticky Rice', 55000.00, 120, NULL, 1800, 5, 15, NULL, NULL),
(38, '2026-01-19 04:46:28.000000', '2026-01-19 04:46:28.000000', 4.4, 'Hộp kem vani gia đình 1 lít, vị truyền thống', 'https://images.unsplash.com/photo-1560008581-09826d1de69e?w=400', b'1', b'0', 'Kem Hộp Vani 1L', 95000.00, 80, NULL, 1000, 8, 40, NULL, NULL),
(39, '2026-01-19 04:46:28.000000', '2026-01-19 04:46:28.000000', 4.6, 'Hộp kem socola gia đình 1 lít, đậm đà', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', b'1', b'1', 'Kem Hộp Socola 1L', 98000.00, 95, NULL, 1200, 8, 35, NULL, NULL),
(40, '2026-01-19 04:46:28.000000', '2026-01-19 04:46:28.000000', 4.8, 'Hộp kem 3 vị: Vani, Socola, Dâu - 1.5L', 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400', b'1', b'1', 'Kem Hộp Combo 3 Vị', 145000.00, 150, NULL, 2000, 8, 25, NULL, NULL),
(41, '2026-01-19 04:46:28.000000', '2026-01-19 04:46:28.000000', 4.7, 'Hộp kem matcha cao cấp 500ml', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', b'1', b'0', 'Kem Hộp Matcha Premium', 120000.00, 70, NULL, 900, 8, 20, NULL, NULL),
(42, '2026-01-19 04:46:28.000000', '2026-01-19 04:46:28.000000', 4.9, 'Kem Haagen Dazs vani nhập khẩu Mỹ 473ml', 'https://images.unsplash.com/photo-1560008581-09826d1de69e?w=400', b'1', b'1', 'Haagen Dazs Vanilla', 280000.00, 85, NULL, 1500, 4, 15, NULL, NULL),
(43, '2026-01-19 04:46:28.000000', '2026-01-19 04:46:28.000000', 4.9, 'Kem Ben & Jerry với cookie dough 473ml', 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400', b'1', b'1', 'Ben & Jerry Cookie Dough', 295000.00, 120, NULL, 2000, 4, 12, NULL, NULL),
(44, '2026-01-19 04:46:28.000000', '2026-01-19 04:46:28.000000', 4.8, 'Kem que Magnum socola đôi nhập khẩu', 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=400', b'1', b'1', 'Magnum Double Chocolate', 45000.00, 200, NULL, 3000, 4, 50, NULL, NULL),
(45, '2026-01-19 04:46:28.000000', '2026-01-28 23:13:11.000000', 4.7, 'Kem Movenpick socola Thụy Sĩ 500ml', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', b'1', b'0', 'Movenpick Swiss Chocolate', 250000.00, 60, NULL, 800, 4, 343, NULL, NULL),
(46, '2026-01-19 04:46:28.000000', '2026-01-19 04:46:28.000000', 4.7, 'Combo 2 kem ly tự chọn + 2 topping', 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400', b'1', b'1', 'Combo Kem Đôi', 60000.00, 180, NULL, 2500, 10, 100, NULL, NULL),
(47, '2026-01-19 04:46:28.000000', '2026-01-19 04:46:28.000000', 4.8, 'Combo 4 kem ly + 1 kem hộp 500ml + topping', 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400', b'1', b'1', 'Combo Gia Đình', 150000.00, 95, NULL, 1500, 10, 30, NULL, NULL),
(48, '2026-01-19 04:46:28.000000', '2026-01-19 04:46:28.000000', 4.6, 'Combo 10 kem que + 5 kem ly + topping', 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400', b'1', b'0', 'Combo Party', 200000.00, 45, NULL, 700, 10, 15, NULL, NULL),
(49, '2026-01-19 04:46:28.000000', '2026-01-28 23:12:31.000000', 4.9, 'Phiên bản giới hạn - kem việt quất Alaska', 'https://images.unsplash.com/photo-1559703248-dcaaec9fab78?w=400', b'1', b'1', 'Kem Việt Quất Limited Edition', 55000.00, 300, NULL, 5000, 7, 99, NULL, NULL),
(50, '2026-01-19 04:46:28.000000', '2026-01-19 04:46:28.000000', 4.4, 'Kem dưa hấu thanh mát - Seasonal', 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400', b'0', b'0', 'Kem Dưa Hấu Mùa Hè', 28000.00, 80, NULL, 1200, 6, 50, NULL, NULL),
(51, '2026-01-19 04:59:06.000000', '2026-01-21 01:11:38.000000', 4.8, 'Kem ly socola đậm đà với 70% cacao Bỉ, phủ sốt socola nóng', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', b'0', b'1', 'Kem Ly Socola Premium', 35000.00, 156, NULL, 2100, 7, 0, 'S,M,L', NULL),
(52, '2026-01-19 04:59:07.000000', '2026-01-21 01:11:00.000000', 4.7, 'Kem ly dâu tây tươi mát với miếng dâu thật và kem tươi', 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400', b'0', b'1', 'Kem Ly Dâu Tây Fresh', 32000.00, 120, NULL, 1800, 7, 0, 'S,M,L', NULL),
(53, '2026-01-19 04:59:07.000000', '2026-01-21 01:11:00.000000', 4.9, 'Kem trà xanh matcha nguyên chất từ Uji, Nhật Bản', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', b'0', b'1', 'Kem Ly Matcha Nhật Bản', 38000.00, 200, NULL, 3001, 7, 0, 'S,M,L', NULL),
(54, '2026-01-19 04:59:07.000000', '2026-01-21 01:11:00.000000', 4.6, 'Kem vani Madagascar phủ sốt caramel muối biển', 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?w=400', b'0', b'0', 'Kem Ly Vani Caramel', 34000.00, 95, NULL, 1500, 7, 0, 'S,M,L', NULL),
(55, '2026-01-19 04:59:07.000000', '2026-01-21 01:11:01.000000', 4.9, 'Kem cuộn vani với Oreo nghiền, kem tươi và sốt socola', 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400', b'0', b'1', 'Kem Cuộn Oreo', 45000.00, 250, NULL, 4001, 5, 0, 'M,L', NULL),
(56, '2026-01-19 04:59:07.000000', '2026-01-21 01:11:01.000000', 4.8, 'Kem cuộn dâu tây tươi với topping dâu và kem whip', 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=400', b'0', b'1', 'Kem Cuộn Dâu Tây Fresh', 48000.00, 180, NULL, 3200, 5, 0, 'M,L', NULL),
(57, '2026-01-19 04:59:07.000000', '2026-01-21 01:11:01.000000', 4.7, 'Kem que socola đen 70% cacao với lớp phủ giòn tan', 'https://images.unsplash.com/photo-1629385701021-fcd568a743e8?w=400', b'0', b'1', 'Kem Que Socola Đen', 15000.00, 156, NULL, 2100, 6, 150, NULL, NULL),
(58, '2026-01-19 04:59:07.000000', '2026-01-21 01:11:01.000000', 4.5, 'Kem que dâu tây tươi mát với hạt dâu thật', 'https://images.unsplash.com/photo-1633933358116-a27b902fad35?w=400', b'0', b'0', 'Kem Que Dâu', 14000.00, 120, NULL, 1800, 6, 200, NULL, NULL),
(59, '2026-01-19 04:59:07.000000', '2026-01-21 01:11:01.000000', 4.3, 'Kem que vani truyền thống vị ngọt thanh', 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400', b'0', b'0', 'Kem Que Vani', 12000.00, 89, NULL, 1500, 6, 180, NULL, NULL),
(60, '2026-01-19 04:59:07.000000', '2026-01-21 01:11:01.000000', 4.6, 'Kem que dừa béo ngậy với cốt dừa tươi', 'https://images.unsplash.com/photo-1560008581-09826d1de69e?w=400', b'0', b'0', 'Kem Que Dừa', 16000.00, 95, NULL, 1600, 6, 120, NULL, NULL),
(61, '2026-01-19 04:59:07.000000', '2026-01-21 01:11:01.000000', 4.4, 'Kem que xoài nhiệt đới tươi mát', 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400', b'0', b'1', 'Kem Que Xoài', 15000.00, 78, NULL, 1200, 6, 90, NULL, NULL),
(62, '2026-01-19 04:59:07.000000', '2026-01-21 01:11:22.000000', 4.8, 'Kem que trà xanh matcha Nhật Bản', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', b'0', b'1', 'Kem Que Matcha', 18000.00, 145, NULL, 2200, 6, 80, NULL, NULL),
(63, '2026-01-19 04:59:07.000000', '2026-01-21 01:11:22.000000', 4.4, 'Hộp kem vani gia đình 1 lít', 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400', b'0', b'0', 'Kem Hộp Vani 1L', 95000.00, 80, NULL, 1000, 8, 40, NULL, NULL),
(64, '2026-01-19 04:59:07.000000', '2026-01-21 01:11:22.000000', 4.6, 'Hộp kem socola gia đình 1 lít', 'https://images.unsplash.com/photo-1563589173312-476d8c36b242?w=400', b'0', b'1', 'Kem Hộp Socola 1L', 98000.00, 95, NULL, 1200, 8, 35, NULL, NULL),
(65, '2026-01-19 04:59:07.000000', '2026-01-21 01:11:22.000000', 4.8, 'Hộp kem 3 vị: Vani, Socola, Dâu', 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?w=400', b'0', b'1', 'Kem Hộp Combo 3 Vị 1.5L', 145000.00, 150, NULL, 2000, 8, 25, NULL, NULL),
(66, '2026-01-19 04:59:07.000000', '2026-01-21 01:11:22.000000', 4.9, 'Kem Haagen Dazs vani nhập khẩu Mỹ', 'https://images.unsplash.com/photo-1557142046-c704a3adf364?w=400', b'0', b'1', 'Haagen Dazs Vanilla Bean 473ml', 280000.00, 85, NULL, 1500, 4, 15, NULL, NULL),
(67, '2026-01-19 04:59:07.000000', '2026-01-21 01:11:22.000000', 4.9, 'Kem Ben & Jerry cookie dough nhập khẩu', 'https://images.unsplash.com/photo-1516559828984-fb3b99548b21?w=400', b'0', b'1', 'Ben & Jerry Cookie Dough 473ml', 295000.00, 120, NULL, 2001, 4, 12, NULL, NULL),
(68, '2026-01-19 04:59:07.000000', '2026-01-21 01:11:22.000000', 4.8, 'Kem que Magnum socola đôi nhập khẩu', 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400', b'0', b'1', 'Magnum Double Chocolate', 45000.00, 200, NULL, 3000, 4, 50, NULL, NULL),
(69, '2026-01-19 04:59:07.000000', '2026-01-21 01:11:22.000000', 4.7, 'Combo 2 kem ly tự chọn + 2 topping', 'https://images.unsplash.com/photo-1594488506255-a7cf19db9fd1?w=400', b'0', b'1', 'Combo Kem Đôi', 60000.00, 180, NULL, 2500, 10, 100, NULL, NULL),
(70, '2026-01-19 04:59:07.000000', '2026-01-21 01:11:22.000000', 4.8, 'Combo 4 kem ly + 1 kem hộp 500ml + topping', 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=400', b'0', b'1', 'Combo Gia Đình', 150000.00, 95, NULL, 1500, 10, 30, NULL, NULL),
(71, '2026-01-19 04:59:07.000000', '2026-01-21 01:11:22.000000', 4.9, 'Phiên bản giới hạn - kem việt quất Alaska', 'https://images.unsplash.com/photo-1559703248-dcaaec9fab78?w=400', b'0', b'1', 'Kem Việt Quất Limited', 55000.00, 300, NULL, 5000, 7, 0, NULL, NULL),
(72, '2026-01-19 04:59:07.000000', '2026-01-19 04:59:07.000000', 4.4, 'Kem dưa hấu thanh mát - Seasonal (Tạm ngừng)', 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400', b'0', b'0', 'Kem Dưa Hấu Mùa Hè', 28000.00, 80, NULL, 1200, 6, 50, NULL, NULL),
(73, '2026-01-19 05:02:13.000000', '2026-01-19 05:02:13.000000', 4.8, 'Kem ly socola đậm đà với 70% cacao Bỉ', 'https://images.pexels.com/photos/1352281/pexels-photo-1352281.jpeg?w=400', b'1', b'1', 'Kem Ly Socola Premium', 35000.00, 156, NULL, 2100, 7, 0, 'S,M,L', NULL),
(74, '2026-01-19 05:02:13.000000', '2026-01-19 05:02:13.000000', 4.7, 'Kem ly dâu tây tươi với miếng dâu thật', 'https://images.pexels.com/photos/1294943/pexels-photo-1294943.jpeg?w=400', b'1', b'1', 'Kem Ly Dâu Tây Fresh', 32000.00, 120, NULL, 1800, 7, 0, 'S,M,L', NULL),
(75, '2026-01-19 05:02:13.000000', '2026-01-19 05:02:13.000000', 4.9, 'Kem trà xanh matcha nguyên chất từ Uji', 'https://images.pexels.com/photos/5060281/pexels-photo-5060281.jpeg?w=400', b'1', b'1', 'Kem Ly Matcha Nhật Bản', 38000.00, 200, NULL, 3000, 7, 0, 'S,M,L', NULL),
(76, '2026-01-19 05:02:13.000000', '2026-01-19 05:02:13.000000', 4.6, 'Kem vani Madagascar với hạt vani thật', 'https://images.pexels.com/photos/1362534/pexels-photo-1362534.jpeg?w=400', b'1', b'0', 'Kem Ly Vani Classic', 34000.00, 95, NULL, 1500, 7, 0, 'S,M,L', NULL),
(77, '2026-01-19 05:02:14.000000', '2026-01-21 00:59:17.000000', 4.8, 'Kem vani với vụn bánh Oreo giòn tan', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768982355/ufsureo6jnoknfqb1jur.png', b'1', b'1', 'Kem Ly Cookies & Cream', 36000.00, 165, NULL, 2601, 7, 150, '', NULL),
(78, '2026-01-19 05:02:14.000000', '2026-01-21 00:59:30.000000', 4.9, 'Kem cuộn kiểu Thái với topping tự chọn', 'https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?w=400', b'0', b'1', 'Kem Cuộn Thái Lan', 45000.00, 250, NULL, 4000, 5, 0, 'M,L', NULL),
(79, '2026-01-19 05:02:14.000000', '2026-01-21 00:58:04.000000', 4.7, 'Kem que phủ socola giòn tan', 'https://images.pexels.com/photos/1430714/pexels-photo-1430714.jpeg?w=400', b'0', b'1', 'Kem Que Socola', 15000.00, 156, NULL, 2100, 6, 150, NULL, NULL),
(80, '2026-01-19 05:02:14.000000', '2026-01-21 00:59:26.000000', 4.5, 'Kem que dâu tây tươi mát', 'https://images.pexels.com/photos/1352296/pexels-photo-1352296.jpeg?w=400', b'0', b'0', 'Kem Que Dâu Tây', 14000.00, 120, NULL, 1800, 6, 200, NULL, NULL),
(81, '2026-01-19 05:02:14.000000', '2026-01-21 01:09:47.000000', 4.3, 'Kem que vani truyền thống', 'https://images.pexels.com/photos/1352270/pexels-photo-1352270.jpeg?w=400', b'0', b'0', 'Kem Que Vani', 12000.00, 89, NULL, 1501, 6, 180, NULL, NULL),
(82, '2026-01-19 05:02:14.000000', '2026-01-21 00:59:53.000000', 4.4, 'Kem que xoài nhiệt đới', 'https://images.pexels.com/photos/3625371/pexels-photo-3625371.jpeg?w=400', b'0', b'1', 'Kem Que Xoài', 15000.00, 78, NULL, 1200, 6, 90, NULL, NULL),
(83, '2026-01-19 05:02:14.000000', '2026-01-21 00:59:48.000000', 4.8, 'Kem que trà xanh Nhật Bản', 'https://images.pexels.com/photos/6990941/pexels-photo-6990941.jpeg?w=400', b'0', b'1', 'Kem Que Matcha', 18000.00, 145, NULL, 2200, 6, 80, NULL, NULL),
(84, '2026-01-19 05:02:14.000000', '2026-01-21 00:59:37.000000', 4.4, 'Hộp kem vani gia đình', 'https://images.pexels.com/photos/1362534/pexels-photo-1362534.jpeg?w=400', b'0', b'0', 'Kem Hộp Vani 1L', 95000.00, 80, NULL, 1000, 8, 40, NULL, NULL),
(85, '2026-01-19 05:02:14.000000', '2026-01-21 00:59:41.000000', 4.6, 'Hộp kem socola gia đình', 'https://images.pexels.com/photos/1352281/pexels-photo-1352281.jpeg?w=400', b'0', b'1', 'Kem Hộp Socola 1L', 98000.00, 95, NULL, 1200, 8, 35, NULL, NULL),
(86, '2026-01-19 05:02:14.000000', '2026-01-21 01:09:47.000000', 4.8, 'Combo Vani + Socola + Dâu', 'https://images.pexels.com/photos/1352299/pexels-photo-1352299.jpeg?w=400', b'0', b'1', 'Kem Hộp 3 Vị 1.5L', 145000.00, 150, NULL, 2000, 8, 25, NULL, NULL),
(87, '2026-01-19 05:02:14.000000', '2026-01-30 01:39:46.000000', 4.7, '2 kem ly tự chọn + topping', 'https://images.pexels.com/photos/1332267/pexels-photo-1332267.jpeg?w=400', b'1', b'1', 'Combo Kem Đôi', 60000.00, 180, NULL, 2501, 10, 100, NULL, NULL),
(88, '2026-01-19 05:02:14.000000', '2026-01-19 05:02:14.000000', 4.8, '4 kem ly + 1 hộp 500ml', 'https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?w=400', b'1', b'1', 'Combo Gia Đình', 150000.00, 95, NULL, 1500, 10, 30, NULL, NULL),
(89, '2026-01-19 05:02:14.000000', '2026-01-28 23:12:18.000000', 4.9, 'Phiên bản giới hạn', 'https://images.pexels.com/photos/4040693/pexels-photo-4040693.jpeg?w=400', b'1', b'1', 'Kem Việt Quất Limited', 55000.00, 300, NULL, 5000, 7, 98, NULL, NULL),
(90, '2026-01-19 05:09:55.000000', '2026-01-21 00:59:21.000000', 4.8, 'Kem ly socola đậm đà với 70% cacao Bỉ', 'https://placehold.co/400x400/5D3A1A/white?text=🍫+Socola', b'0', b'1', 'Kem Ly Socola Premium', 35000.00, 156, NULL, 2100, 7, 0, 'S,M,L', NULL),
(91, '2026-01-19 05:36:41.000000', '2026-01-20 22:33:10.000000', 4.8, 'Kem ly socola đậm đà với 70% cacao Bỉ', 'https://placehold.co/400x400/5D3A1A/white?text=Socola', b'0', b'1', 'Kem Ly Socola Premium', 35000.00, 156, NULL, 2101, 7, 0, 'S,M,L', NULL),
(92, '2026-01-19 05:36:41.000000', '2026-01-29 00:40:54.000000', 4.7, 'Kem ly dâu tây tươi với miếng dâu thật', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768980454/wk1lvk5gpdpyee4lnvge.png', b'1', b'1', 'Kem Ly Dâu Tây Fresh', 32000.00, 120, NULL, 1816, 7, 187, '', NULL),
(93, '2026-01-19 05:36:41.000000', '2026-01-29 01:31:16.000000', 5, 'Kem trà xanh matcha nguyên chất từ Uji', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768980984/uflu263wqk8wyr4fth2a.png', b'1', b'1', 'Kem Ly Matcha Nhật Bản', 38000.00, 1, NULL, 3017, 7, 115, '', NULL),
(94, '2026-01-19 05:36:41.000000', '2026-01-30 01:42:22.000000', 5, 'Kem vani Madagascar với hạt vani thật', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768981218/yaqtlizjvi9bmjcp0chx.png', b'1', b'0', 'Kem Ly Vani Classic', 34000.00, 1, NULL, 1505, 7, 166, '', NULL),
(95, '2026-01-19 05:36:41.000000', '2026-01-21 00:41:00.000000', 4.9, 'Kem cuộn kiểu Thái với topping tự chọn', 'https://placehold.co/400x400/FFB6C1/333?text=Kem+Cuon', b'0', b'1', 'Kem Cuộn Thái Lan', 45000.00, 250, NULL, 4000, 5, 0, 'M,L', NULL),
(96, '2026-01-19 05:36:41.000000', '2026-01-29 23:35:44.000000', 4.7, 'Kem que phủ socola giòn tan', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768981351/h8fhscgjqbuoy9spg9wm.png', b'1', b'1', 'Kem Que Socola', 15000.00, 156, NULL, 2101, 6, 146, '', NULL),
(97, '2026-01-19 05:36:41.000000', '2026-01-30 01:43:29.000000', 4.5, 'Kem que dâu tây tươi mát', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768981411/undtiyt6et8ay9bqliba.png', b'1', b'0', 'Kem Que Dâu Tây', 14000.00, 120, NULL, 1803, 6, 174, '', NULL),
(98, '2026-01-19 05:36:41.000000', '2026-01-29 23:35:44.000000', 4.3, 'Kem ốc quế vani truyền thống', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768981504/f5boamt5k9t2wsoyvle1.png', b'1', b'0', 'Kem Ốc Quế Vani', 12000.00, 89, NULL, 1506, 16, 170, '', NULL),
(99, '2026-01-19 05:36:41.000000', '2026-01-21 00:53:28.000000', 4.4, 'Kem que xoài nhiệt đới', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768981587/m2ws8mfzwfjek2ohjyk0.png', b'1', b'1', 'Kem Que Xoài', 15000.00, 78, NULL, 1202, 6, 90, '', NULL),
(100, '2026-01-19 05:36:41.000000', '2026-01-23 18:31:33.000000', 4.8, 'Kem ốc quế trà xanh Nhật Bản', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768981661/glc7vvsegksj5zqkiuan.png', b'1', b'1', 'Kem Ốc Quế Matcha', 18000.00, 145, NULL, 2204, 16, 80, '', NULL),
(101, '2026-01-19 05:36:41.000000', '2026-01-28 22:59:52.000000', 4.6, 'Kem que dừa béo ngậy', 'https://placehold.co/400x400/FFFACD/333?text=Que+Dua', b'0', b'0', 'Kem Que Dừa', 16000.00, 95, NULL, 1600, 6, 140, NULL, NULL),
(102, '2026-01-19 05:36:41.000000', '2026-01-29 00:48:03.000000', 4.4, 'Hộp kem vani gia đình', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768981759/fzlleei5zdub3shttdyc.png', b'1', b'0', 'Kem Hộp Vani 1L', 95000.00, 80, NULL, 1001, 8, 54, '', NULL),
(103, '2026-01-19 05:36:41.000000', '2026-01-21 00:53:40.000000', 4.6, 'Hộp kem socola gia đình', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768981994/tbh2hab26qd4uinrfj0c.png', b'1', b'1', 'Kem Hộp Socola 1L', 98000.00, 95, NULL, 1202, 8, 35, '', NULL),
(104, '2026-01-19 05:36:41.000000', '2026-01-21 00:54:07.000000', 4.8, 'Combo Vani + Socola + Dâu', 'https://placehold.co/400x400/9370DB/white?text=Hop+3+Vi', b'0', b'1', 'Kem Hộp 3 Vị 1.5L', 145000.00, 150, NULL, 2000, 8, 25, NULL, NULL),
(105, '2026-01-19 05:36:41.000000', '2026-01-21 00:54:11.000000', 4.7, '2 kem ly tự chọn + topping', 'https://placehold.co/400x400/FF1493/white?text=Combo+Doi', b'0', b'1', 'Combo Kem Đôi', 60000.00, 180, NULL, 2500, 10, 100, NULL, NULL),
(106, '2026-01-19 05:36:41.000000', '2026-01-28 23:13:29.000000', 4.8, '4 kem ly + 1 hộp 500ml', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768982946/vwx3lzmyeiuapu3ddgub.jpg', b'1', b'1', 'Combo Gia Đình', 150000.00, 95, NULL, 1503, 10, 300, '', NULL),
(107, '2026-01-19 05:36:41.000000', '2026-01-30 00:15:44.000000', 5, 'Phiên bản giới hạn', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768982112/u3a1szztmhizn1bmntke.png', b'1', b'1', 'Kem Việt Quất Limited', 55000.00, 2, NULL, 5008, 7, 46, '', NULL),
(109, '2026-01-21 08:42:58.000000', '2026-01-29 23:34:28.000000', 5, 'Tuyệt tác bánh kem với lớp phủ socola ganache nguyên chất 70% cacao, điểm xuyết lá vàng thực phẩm 24K sang trọng. Hương vị đắng nhẹ sâu lắng hòa quyện cùng lớp kem tươi mềm mượt.', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768985040/hyc79pg3gqdja8urypml.webp', b'1', b'1', 'Bánh Kem Socola Luxury Gold', 450000.00, 12, NULL, 153, 15, 48, 'S,M,L', NULL),
(110, '2026-01-21 08:42:59.000000', '2026-01-29 01:39:38.000000', 5, '<p><strong><em>Chi&nbsp;tiết&nbsp;sản&nbsp;phẩm</em></strong></p><p>Sự&nbsp;kết&nbsp;hợp&nbsp;hoàn&nbsp;hảo&nbsp;giữa&nbsp;những&nbsp;trái&nbsp;dâu&nbsp;tây&nbsp;tươi&nbsp;mọng&nbsp;nước&nbsp;từ&nbsp;nông&nbsp;sản&nbsp;sạch&nbsp;và&nbsp;lớp&nbsp;kem&nbsp;tươi&nbsp;đánh&nbsp;bông&nbsp;nhẹ&nbsp;nhàng.&nbsp;Bánh&nbsp;mang&nbsp;vị&nbsp;chua&nbsp;ngọt&nbsp;tự&nbsp;nhiên,&nbsp;thanh&nbsp;khiết&nbsp;và&nbsp;cực&nbsp;kỳ&nbsp;được&nbsp;ưa&nbsp;chuộng.</p><p><img src=\"https://res.cloudinary.com/dfyrnocnr/image/upload/v1769588433/gnmhkmqahvddmxebdrxo.jpg\"></p>', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768985014/vgnnfghib5g7g2zzixuy.png', b'1', b'1', 'Bánh Kem Dâu Tây Organic', 380000.00, 1, NULL, 340, 15, 90, 'S,M,L', NULL),
(111, '2026-01-21 08:42:59.000000', '2026-01-30 01:44:19.000000', 4.9, 'Tinh hoa trà xanh Uji (Nhật Bản) rây mịn trên bề mặt, mang đến vị đắng đặc trưng và hương thơm thanh tao. Một lựa chọn tinh tế cho những tâm hồn yêu thích sự nhẹ nhàng và thiền định.', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768985028/bx4kasliq04wjwgvjivc.webp', b'1', b'0', 'Bánh Kem Matcha Trà Đạo', 420000.00, 18, NULL, 222, 15, 11, 'S,M', NULL),
(112, '2026-01-28 22:48:17.000000', '2026-01-28 22:49:02.000000', 0, '<p>ncxvn&nbsp;x&nbsp;xdfh</p>', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1769665700/sov8ymvwjtp6bx3qgjls.jpg', b'0', b'0', 'thêm xfh', 32000.00, 0, NULL, 1, 4, 68, 'XL', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_discounts`
--

CREATE TABLE `product_discounts` (
  `product_id` bigint(20) NOT NULL,
  `discount_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `product_discounts`
--

INSERT INTO `product_discounts` (`product_id`, `discount_id`) VALUES
(98, 5),
(97, 6),
(110, 7);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_reviews`
--

CREATE TABLE `product_reviews` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `rating` int(11) NOT NULL,
  `order_id` bigint(20) NOT NULL,
  `product_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `admin_reply` text DEFAULT NULL,
  `reply_date` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `product_reviews`
--

INSERT INTO `product_reviews` (`id`, `created_at`, `updated_at`, `comment`, `rating`, `order_id`, `product_id`, `user_id`, `admin_reply`, `reply_date`) VALUES
(1, '2026-01-28 06:58:26.000000', '2026-01-28 06:58:26.000000', 'ngon nha', 5, 52, 107, 8, NULL, NULL),
(2, '2026-01-28 06:59:12.000000', '2026-01-30 06:49:59.000000', 'Kem ngon', 5, 53, 107, 8, 'ngon thì ủng hộ nhìu nhìu nha\n', '2026-01-30 06:49:59.000000'),
(3, '2026-01-29 04:52:15.000000', '2026-01-29 04:52:15.000000', 'ngon quá trời luôn á', 5, 55, 110, 8, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_size_prices`
--

CREATE TABLE `product_size_prices` (
  `product_id` bigint(20) NOT NULL,
  `price` decimal(38,2) DEFAULT NULL,
  `size_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `product_size_prices`
--

INSERT INTO `product_size_prices` (`product_id`, `price`, `size_name`) VALUES
(20, 17000.00, 'L'),
(20, 13000.00, 'M'),
(20, 20000.00, 'XL'),
(112, 12000.00, 'XL');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_variants`
--

CREATE TABLE `product_variants` (
  `id` bigint(20) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `color` varchar(50) DEFAULT NULL,
  `color_image_url` varchar(500) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `product_size` varchar(20) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `stock_quantity` int(11) DEFAULT NULL,
  `product_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `product_variants`
--

INSERT INTO `product_variants` (`id`, `created_at`, `updated_at`, `color`, `color_image_url`, `image_url`, `price`, `product_size`, `sku`, `stock_quantity`, `product_id`) VALUES
(1, '2025-12-16 03:09:05.000000', '2026-01-28 22:59:52.000000', 'Trắng', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766801068/rjohkhlxdlbptcqvwmpc.jpg', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766800965/ruin1rvohl9wbvrjgtbv.jpg', NULL, 'N/A', 'AKKO-5075-WHT', 30, 1),
(2, '2025-12-16 03:09:05.000000', '2025-12-26 19:04:32.000000', 'Đen', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766801073/u5q0dj93icbusemtndpw.jpg', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766800984/rkdkawm2dpb7ldlkvfdo.jpg', NULL, 'N/A', 'AKKO-5075-BLK', 30, 1),
(3, '2025-12-16 03:09:05.000000', '2026-01-28 22:59:52.000000', 'Xám Đen', NULL, NULL, NULL, 'N/A', 'LOGI-MX3S-GRY', 30, 2),
(4, '2025-12-16 03:09:05.000000', '2025-12-16 03:09:05.000000', 'Trắng Xám', NULL, NULL, NULL, 'N/A', 'LOGI-MX3S-WHT', 15, 2),
(9, '2025-12-26 19:58:43.000000', '2026-01-18 01:53:26.000000', 'Kem', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766804304/k2t3zu9oftluyemwzg2t.jpg', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766804324/zsovqknblmfwt1b1abkb.jpg', 12000.00, 'M', '33', 12, 12),
(10, '2025-12-26 20:00:00.000000', '2026-01-28 23:13:55.000000', 'Xanh', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766804358/lant6jg1smaoadxjbzy7.jpg', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766804394/bsyu6k4yrc7h04tvhqtc.jpg', 15000.00, 'L', '23', 104, 13),
(11, '2025-12-26 20:02:16.000000', '2026-01-28 23:13:40.000000', 'Xanh', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766804501/v8jpejm5b754jpnhcn7a.jpg', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766804534/s2kkbe0qod2c4jamhwxi.jpg', 24000.00, 'M', '65', 123, 14),
(12, '2025-12-26 20:03:22.000000', '2026-01-28 22:02:38.000000', 'xdsgr', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766804572/aq9gnthqw6pdgqg3hwle.jpg', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766804602/tl0ui62sugwbpwtmrsls.jpg', 28000.00, 'M', '43', 23, 15),
(13, '2025-12-26 20:05:11.000000', '2025-12-27 03:02:44.000000', 'dxfnjr', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766804645/meweiowdxxifwzcdlavb.jpg', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1766804692/impkx4dspau8scxw1trd.jpg', 110000.00, 'L', 'cxf', 11, 16),
(15, '2026-01-09 18:11:52.000000', '2026-01-19 02:55:30.000000', 'Vị Dâu', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768007492/pkl0qmzxkbfedmefvy1w.jpg', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768007510/hfp9oepdeoysakalmjcv.jpg', 27000.00, 'M', '65432', 21, 18),
(16, '2026-01-09 20:07:33.000000', '2026-01-28 23:12:46.000000', 'Hương Dâu', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768036549/dpyhdmkt81kizgxmuzen.jpg', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768036572/sus6rkqrmtx3jpstbxzd.jpg', 32000.00, 'L', 'MST', 30, 19),
(17, '2026-01-10 02:20:40.000000', '2026-01-28 23:12:58.000000', 'Hương Matcha', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768036822/a1ibpx90tc86b9deljtn.jpg', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768036829/nfrrndeh1c3x2ylbvtyt.jpg', 32000.00, 'L', 'MAI', 112, 19),
(18, '2026-01-19 04:59:06.000000', '2026-01-19 04:59:06.000000', NULL, NULL, NULL, 35000.00, 'S', 'KEM-SOCOLA-S', 50, 51),
(19, '2026-01-19 04:59:06.000000', '2026-01-19 04:59:06.000000', NULL, NULL, NULL, 45000.00, 'M', 'KEM-SOCOLA-M', 80, 51),
(20, '2026-01-19 04:59:06.000000', '2026-01-19 04:59:06.000000', NULL, NULL, NULL, 55000.00, 'L', 'KEM-SOCOLA-L', 30, 51),
(21, '2026-01-19 04:59:07.000000', '2026-01-19 04:59:07.000000', NULL, NULL, NULL, 32000.00, 'S', 'KEM-DAU-S', 60, 52),
(22, '2026-01-19 04:59:07.000000', '2026-01-19 04:59:07.000000', NULL, NULL, NULL, 42000.00, 'M', 'KEM-DAU-M', 90, 52),
(23, '2026-01-19 04:59:07.000000', '2026-01-19 04:59:07.000000', NULL, NULL, NULL, 52000.00, 'L', 'KEM-DAU-L', 40, 52),
(24, '2026-01-19 04:59:07.000000', '2026-01-19 04:59:07.000000', NULL, NULL, NULL, 38000.00, 'S', 'KEM-MATCHA-S', 40, 53),
(25, '2026-01-19 04:59:07.000000', '2026-01-19 04:59:07.000000', NULL, NULL, NULL, 48000.00, 'M', 'KEM-MATCHA-M', 70, 53),
(26, '2026-01-19 04:59:07.000000', '2026-01-19 04:59:07.000000', NULL, NULL, NULL, 58000.00, 'L', 'KEM-MATCHA-L', 25, 53),
(27, '2026-01-19 04:59:07.000000', '2026-01-19 04:59:07.000000', NULL, NULL, NULL, 34000.00, 'S', 'KEM-VANI-S', 55, 54),
(28, '2026-01-19 04:59:07.000000', '2026-01-19 04:59:07.000000', NULL, NULL, NULL, 44000.00, 'M', 'KEM-VANI-M', 85, 54),
(29, '2026-01-19 04:59:07.000000', '2026-01-19 04:59:07.000000', NULL, NULL, NULL, 54000.00, 'L', 'KEM-VANI-L', 35, 54),
(30, '2026-01-19 04:59:07.000000', '2026-01-19 04:59:07.000000', NULL, NULL, NULL, 45000.00, 'M', 'KEM-CUON-OREO-M', 60, 55),
(31, '2026-01-19 04:59:07.000000', '2026-01-19 04:59:07.000000', NULL, NULL, NULL, 60000.00, 'L', 'KEM-CUON-OREO-L', 30, 55),
(32, '2026-01-19 04:59:07.000000', '2026-01-19 04:59:07.000000', NULL, NULL, NULL, 48000.00, 'M', 'KEM-CUON-DAU-M', 50, 56),
(33, '2026-01-19 04:59:07.000000', '2026-01-19 04:59:07.000000', NULL, NULL, NULL, 63000.00, 'L', 'KEM-CUON-DAU-L', 25, 56),
(34, '2026-01-19 05:02:13.000000', '2026-01-19 05:02:13.000000', NULL, NULL, NULL, 35000.00, 'S', 'SOCOLA-S', 50, 73),
(35, '2026-01-19 05:02:13.000000', '2026-01-19 05:02:13.000000', NULL, NULL, NULL, 45000.00, 'M', 'SOCOLA-M', 80, 73),
(36, '2026-01-19 05:02:13.000000', '2026-01-19 05:02:13.000000', NULL, NULL, NULL, 55000.00, 'L', 'SOCOLA-L', 30, 73),
(37, '2026-01-19 05:02:13.000000', '2026-01-19 05:02:13.000000', NULL, NULL, NULL, 32000.00, 'S', 'DAU-S', 60, 74),
(38, '2026-01-19 05:02:13.000000', '2026-01-19 05:02:13.000000', NULL, NULL, NULL, 42000.00, 'M', 'DAU-M', 90, 74),
(39, '2026-01-19 05:02:13.000000', '2026-01-19 05:02:13.000000', NULL, NULL, NULL, 52000.00, 'L', 'DAU-L', 40, 74),
(40, '2026-01-19 05:02:13.000000', '2026-01-19 05:02:13.000000', NULL, NULL, NULL, 38000.00, 'S', 'MATCHA-S', 40, 75),
(41, '2026-01-19 05:02:13.000000', '2026-01-19 05:02:13.000000', NULL, NULL, NULL, 48000.00, 'M', 'MATCHA-M', 70, 75),
(42, '2026-01-19 05:02:13.000000', '2026-01-19 05:02:13.000000', NULL, NULL, NULL, 58000.00, 'L', 'MATCHA-L', 25, 75),
(43, '2026-01-19 05:02:14.000000', '2026-01-19 05:02:14.000000', NULL, NULL, NULL, 34000.00, 'S', 'VANI-S', 55, 76),
(44, '2026-01-19 05:02:14.000000', '2026-01-19 05:02:14.000000', NULL, NULL, NULL, 44000.00, 'M', 'VANI-M', 85, 76),
(45, '2026-01-19 05:02:14.000000', '2026-01-19 05:02:14.000000', NULL, NULL, NULL, 54000.00, 'L', 'VANI-L', 35, 76),
(46, '2026-01-19 05:02:14.000000', '2026-01-21 00:59:17.000000', 'Trắng đen', NULL, NULL, 36000.00, 'S', 'COOKIES-S', 45, 77),
(47, '2026-01-19 05:02:14.000000', '2026-01-21 00:59:17.000000', 'Trắng đen', NULL, NULL, 45999.00, 'M', 'COOKIES-M', 75, 77),
(48, '2026-01-19 05:02:14.000000', '2026-01-21 00:59:17.000000', 'Trắng đen', NULL, NULL, 56000.00, 'L', 'COOKIES-L', 30, 77),
(49, '2026-01-19 05:02:14.000000', '2026-01-19 05:02:14.000000', NULL, NULL, NULL, 45000.00, 'M', 'CUON-M', 60, 78),
(50, '2026-01-19 05:02:14.000000', '2026-01-19 05:02:14.000000', NULL, NULL, NULL, 60000.00, 'L', 'CUON-L', 30, 78),
(54, '2026-01-19 05:36:41.000000', '2026-01-19 05:36:41.000000', NULL, NULL, NULL, 35000.00, 'S', 'SOCOLA-S-1768801001', 50, 91),
(55, '2026-01-19 05:36:41.000000', '2026-01-19 05:36:41.000000', NULL, NULL, NULL, 45000.00, 'M', 'SOCOLA-M-1768801001', 80, 91),
(56, '2026-01-19 05:36:41.000000', '2026-01-19 05:36:41.000000', NULL, NULL, NULL, 55000.00, 'L', 'SOCOLA-L-1768801001', 30, 91),
(57, '2026-01-19 05:36:41.000000', '2026-01-29 01:39:38.000000', 'Đỏ', NULL, NULL, 32000.00, 'S', 'DAU-S-1768801001', 45, 92),
(58, '2026-01-19 05:36:41.000000', '2026-01-21 00:27:35.000000', 'Đỏ', NULL, NULL, 42000.00, 'M', 'DAU-M-1768801001', 90, 92),
(59, '2026-01-19 05:36:41.000000', '2026-01-28 01:07:53.000000', 'Đỏ', NULL, NULL, 52000.00, 'L', 'DAU-L-1768801001', 36, 92),
(60, '2026-01-19 05:36:41.000000', '2026-01-29 01:39:38.000000', 'Xanh', NULL, NULL, 38000.00, 'S', 'MATCHA-S-1768801001', 19, 93),
(61, '2026-01-19 05:36:41.000000', '2026-01-21 00:36:06.000000', 'Xanh', NULL, NULL, 48000.00, 'M', 'MATCHA-M-1768801001', 61, 93),
(62, '2026-01-19 05:36:41.000000', '2026-01-21 00:36:06.000000', 'Xanh', NULL, NULL, 58000.00, 'L', 'MATCHA-L-1768801001', 25, 93),
(63, '2026-01-19 05:36:41.000000', '2026-01-30 01:43:29.000000', 'Trắng', NULL, NULL, 34000.00, 'S', 'VANI-S-1768801001', 40, 94),
(64, '2026-01-19 05:36:41.000000', '2026-01-21 00:40:20.000000', 'Trắng', NULL, NULL, 44000.00, 'M', 'VANI-M-1768801001', 85, 94),
(65, '2026-01-19 05:36:41.000000', '2026-01-21 00:40:20.000000', 'Trắng', NULL, NULL, 54000.00, 'L', 'VANI-L-1768801001', 35, 94),
(66, '2026-01-19 05:36:41.000000', '2026-01-19 05:36:41.000000', NULL, NULL, NULL, 45000.00, 'M', 'CUON-M-1768801001', 60, 95),
(67, '2026-01-19 05:36:41.000000', '2026-01-19 05:36:41.000000', NULL, NULL, NULL, 60000.00, 'L', 'CUON-L-1768801001', 30, 95);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `promotion_banners`
--

CREATE TABLE `promotion_banners` (
  `id` bigint(20) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `image_url` varchar(500) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `target_url` varchar(500) DEFAULT NULL,
  `title` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `promotion_banners`
--

INSERT INTO `promotion_banners` (`id`, `created_at`, `updated_at`, `image_url`, `is_active`, `target_url`, `title`) VALUES
(2, '2026-01-20 23:04:33.000000', '2026-01-20 23:22:19.000000', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768975471/oj0ucb9sdfoqwfzpe67u.jpg', b'1', '', '🍭 Thiên đường Kem Que & Gelato – Khám phá ngay công thức đặc biệt'),
(4, '2026-01-20 23:05:00.000000', '2026-01-20 23:22:01.000000', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768975498/f33dzgmffygnepnthsij.jpg', b'1', '', '✨ Nghệ thuật Kem Watercolor – Trải nghiệm vị giác mới lạ'),
(5, '2026-01-20 23:14:27.000000', '2026-01-20 23:17:19.000000', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768976065/ny84y7y7gdjfwvxuwytz.avif', b'1', '/category/4', '🍓 ICREAM Strawberry – Hương vị từ tình yêu'),
(6, '2026-01-20 23:15:16.000000', '2026-01-20 23:15:16.000000', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768976114/qpo4ukyiaod3kijkaud9.avif', b'1', '/menu', '🍦 Giải nhiệt mùa hè với Gelato 7 sắc cầu vồng'),
(7, '2026-01-20 23:16:04.000000', '2026-01-20 23:16:04.000000', 'https://res.cloudinary.com/dfyrnocnr/image/upload/v1768976162/mg63amfnumsromnjosap.avif', b'1', '/category/ chocolate', '🍫 Đắm chìm trong sự tan chảy của Socola Bỉ');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` bigint(20) NOT NULL,
  `expiry_date` datetime(6) NOT NULL,
  `token` varchar(255) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `expiry_date`, `token`, `user_id`) VALUES
(1, '2026-01-22 05:08:20.000000', '1c1d20a1-4512-4990-9ec8-aab38280df70', 6),
(4, '2026-01-25 01:30:38.000000', '0562ed2d-e2f9-4544-b291-52b5396ed025', 7),
(10, '2026-01-30 04:22:55.000000', '2b068bba-4750-42ad-8655-53188dc20628', 8),
(19, '2026-01-31 06:49:33.000000', '10b2f8e0-7140-49cf-ad36-a12135cf14de', 4),
(20, '2026-01-31 07:15:04.000000', 'c72f7b34-5e34-4b09-a51a-af1388ff38d1', 5);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `refund_items`
--

CREATE TABLE `refund_items` (
  `id` bigint(20) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `quantity` int(11) NOT NULL,
  `order_item_id` bigint(20) NOT NULL,
  `refund_request_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `refund_items`
--

INSERT INTO `refund_items` (`id`, `created_at`, `updated_at`, `quantity`, `order_item_id`, `refund_request_id`) VALUES
(1, '2026-01-19 02:54:00.000000', '2026-01-19 02:54:00.000000', 1, 32, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `refund_requests`
--

CREATE TABLE `refund_requests` (
  `id` bigint(20) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `admin_notes` text DEFAULT NULL,
  `reason` text NOT NULL,
  `status` enum('COMPLETED','PENDING','PROCESSING','REJECTED') NOT NULL,
  `total_refund_amount` decimal(10,2) NOT NULL,
  `order_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `refund_requests`
--

INSERT INTO `refund_requests` (`id`, `created_at`, `updated_at`, `admin_notes`, `reason`, `status`, `total_refund_amount`, `order_id`, `user_id`) VALUES
(1, '2026-01-19 02:54:00.000000', '2026-01-19 02:56:17.000000', 'ok', 'dsfsfd', 'REJECTED', 27000.00, 22, 5);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `comment` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `rating` int(11) NOT NULL,
  `product_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `order_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `reviews`
--

INSERT INTO `reviews` (`id`, `created_at`, `updated_at`, `comment`, `image_url`, `rating`, `product_id`, `user_id`, `order_id`) VALUES
(1, '2025-12-16 03:09:05.000000', '2025-12-16 03:09:05.000000', 'Bàn phím gõ êm, màu trắng rất đẹp!', NULL, 5, 1, 2, 0),
(2, '2026-01-19 01:48:31.000000', '2026-01-19 01:48:31.000000', 'nước ngon', '6100baea-b347-49a2-b0ec-902f9a2b7800.jpg', 5, 18, 5, 0),
(3, '2026-01-19 03:47:45.000000', '2026-01-19 03:47:45.000000', 'oghhggdff', NULL, 5, 93, 5, 0),
(4, '2026-01-19 03:47:53.000000', '2026-01-19 03:47:53.000000', 'dafssv', NULL, 5, 94, 5, 0),
(5, '2026-01-27 23:50:20.000000', '2026-01-27 23:50:20.000000', 'Kem không bị chảy', NULL, 5, 107, 8, 53);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `review_images`
--

CREATE TABLE `review_images` (
  `review_id` bigint(20) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `review_images`
--

INSERT INTO `review_images` (`review_id`, `image_url`) VALUES
(5, '9f0c38f1-fae3-46c3-941a-88b1f07c3cc0.jpg'),
(1, '30c3eb06-f336-4a41-af2f-9b20fdad5c86.jpg'),
(1, 'cfb09c91-024f-46c4-94b1-885b0c3225a4.jpg'),
(1, 'cfdaf8d7-a0a3-4f42-8de4-da2a6a17e2f6.webp'),
(2, 'ed885b90-edd2-4a0a-8ba1-bf396928f0d8.jpg'),
(3, '212b4289-05e4-45fc-b6d9-1c2d8473eccf.jpg'),
(3, 'dd9ef22d-da8e-4c76-b5ea-3a747f3c82a9.jpeg'),
(3, '38720314-faef-440b-a50d-5466c694faa7.jpg'),
(3, '1d22c5b6-de62-470b-8930-8d1a014cb4e4.jpg');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `search_history`
--

CREATE TABLE `search_history` (
  `id` bigint(20) NOT NULL,
  `query` varchar(255) NOT NULL,
  `timestamp` datetime(6) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `search_history`
--

INSERT INTO `search_history` (`id`, `query`, `timestamp`, `user_id`) VALUES
(1, 'akko', '2025-12-27 00:55:17.000000', 3),
(2, 'dâu', '2025-12-27 03:20:18.000000', 3),
(3, 'dâu', '2025-12-27 03:26:36.000000', 3),
(4, 'dâu=', '2025-12-27 03:27:05.000000', 3),
(5, 'dâ', '2025-12-27 03:27:06.000000', 3),
(6, 'd', '2025-12-27 03:27:06.000000', 3),
(7, 's', '2025-12-27 03:27:07.000000', 3),
(8, 'so', '2025-12-27 03:27:07.000000', 3),
(9, 'sol', '2025-12-27 03:27:07.000000', 3),
(10, 'soc', '2025-12-27 03:27:08.000000', 3),
(11, 'soco', '2025-12-27 03:27:11.000000', 3),
(12, 'l', '2025-12-27 03:27:15.000000', 3),
(13, 'ly', '2025-12-27 03:27:15.000000', 3),
(14, 'dâu', '2025-12-27 03:40:38.000000', 3),
(15, 'dâu', '2025-12-27 07:12:37.000000', 3),
(16, 'daua', '2025-12-27 10:26:56.000000', 4),
(17, 'dau', '2025-12-27 10:27:04.000000', 4),
(18, 'que', '2026-01-10 03:31:32.000000', 4),
(19, 'dâu', '2026-01-10 03:57:46.000000', 4),
(20, 'd', '2026-01-10 03:57:55.000000', 4),
(21, 'đ', '2026-01-10 03:57:56.000000', 4),
(22, 'k', '2026-01-10 06:55:59.000000', 4),
(23, 'kem', '2026-01-10 06:56:18.000000', 4),
(24, 'kem daau', '2026-01-10 06:56:19.000000', 4),
(25, 'kem da', '2026-01-10 06:56:20.000000', 4),
(26, 'kem dâu', '2026-01-10 06:56:23.000000', 4),
(27, 'kem d', '2026-01-10 06:56:40.000000', 4),
(28, 'ke', '2026-01-10 06:56:41.000000', 4),
(29, 'd', '2026-01-10 06:56:43.000000', 4),
(30, 'da', '2026-01-10 06:56:43.000000', 4),
(31, 'dâu', '2026-01-10 06:56:45.000000', 4),
(32, 'k', '2026-01-12 15:50:15.000000', 5),
(33, 'k', '2026-01-13 06:24:39.000000', 5),
(34, '1 Kem Việt Quất', '2026-01-28 07:00:03.000000', 8),
(35, 'Kem Việt Quất', '2026-01-28 07:00:07.000000', 8),
(36, 'Kem Việt Quất', '2026-01-28 07:18:01.000000', 8),
(37, 'Organic', '2026-01-28 08:19:03.000000', 8),
(38, 'việt ', '2026-01-28 08:45:02.000000', 8),
(39, 'việt quôca', '2026-01-28 08:45:04.000000', 8),
(40, 'việt quôc', '2026-01-28 08:45:05.000000', 8),
(41, 'Kem Ly Vani', '2026-01-29 07:11:44.000000', 4),
(42, 'Kem Ly Vani Classic', '2026-01-29 07:11:44.000000', 4),
(43, 'Va', '2026-01-29 07:12:56.000000', 4),
(44, 'Vani', '2026-01-29 07:14:03.000000', 4);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `toppings`
--

CREATE TABLE `toppings` (
  `id` bigint(20) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `toppings`
--

INSERT INTO `toppings` (`id`, `created_at`, `updated_at`, `image_url`, `is_active`, `name`, `price`) VALUES
(1, '2026-01-10 02:26:52.000000', '2026-01-10 00:21:27.000000', '69781feb-df95-433d-8b4e-587cf16e1b90.jpg', b'1', 'Trân châu đen', 5000.00),
(2, '2026-01-10 02:26:52.000000', '2026-01-10 00:21:52.000000', '01eed4e9-bee4-4b0a-8236-5aea97d31f48.jpg', b'1', 'Pudding trứng', 7000.00),
(3, '2026-01-10 02:26:52.000000', '2026-01-10 00:23:50.000000', '734bee31-3beb-4be3-ab59-136e68018cd9.jpg', b'1', 'Thạch phô mai', 8000.00),
(4, '2026-01-10 00:25:55.000000', '2026-01-30 01:01:34.000000', '6af5eaa7-269c-46db-86d9-342c3037b2c1.jpg', b'1', 'Bánh vụn', 5000.00),
(5, '2026-01-10 00:26:47.000000', '2026-01-30 01:01:00.000000', '5a47f255-a789-46e7-9fa5-5d50ea3cd5d6.webp', b'1', 'Hạt khô_tạo độ giòn', 5000.00),
(6, '2026-01-10 00:27:16.000000', '2026-01-30 01:01:13.000000', '179d9f53-434b-4b48-b7cc-ab230344820f.jpeg', b'1', 'Hạt cốm màu', 3000.00),
(7, '2026-01-10 00:27:56.000000', '2026-01-30 01:01:24.000000', '5f982eac-f6b7-4d0f-9be7-e9b544281557.jpg', b'1', 'Chocolate chips', 10000.00),
(8, '2026-01-10 00:28:33.000000', '2026-01-10 00:38:30.000000', '5eef1d1d-8a8e-487e-bb4d-ea17c12d7d64.jpg', b'1', 'Trân châu trắng', 5000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `email` varchar(100) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('ADMIN','CUSTOMER') NOT NULL,
  `loyalty_points` int(11) DEFAULT NULL,
  `membership_tier` enum('GOLD','LOYAL','MEMBER','NEW','SILVER','VIP') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `created_at`, `updated_at`, `email`, `first_name`, `is_active`, `last_name`, `password`, `phone`, `role`, `loyalty_points`, `membership_tier`) VALUES
(1, '2025-12-16 03:09:05.000000', '2025-12-16 03:09:05.000000', 'admin@ecommerce.com', 'Admin', b'1', 'Root', '$2a$10$Qul9YKTrl2eObRUCXRolYumBYmhLTbIYDgD1YcjO8bJg7EScNUV2a', '0123456789', 'ADMIN', NULL, NULL),
(2, '2025-12-16 03:09:05.000000', '2025-12-16 03:09:05.000000', 'customer@ecommerce.com', 'Hoàng', b'1', 'Lâm', '$2a$10$MuvaTy1cW2X3ErRcImOTNuLOL4/8QZzCYNqT5bQ/tV.ArJCR9DChu', '0987654321', 'CUSTOMER', NULL, NULL),
(3, '2025-12-18 04:42:32.000000', '2026-01-28 23:15:53.000000', 'javangan@gmail.com', 'Ngân', b'1', 'Admin', '$2a$10$bzTRoSDZpLdk8zKH9a7Z5.m9yqPNuqJVwylYxG0RelkN7upDukNbG', '0937976562', 'ADMIN', 44, 'NEW'),
(4, '2025-12-27 03:17:39.000000', '2026-01-28 23:16:54.000000', 'javaadmin@gmail.com', 'ngan', b'1', 'java', '$2a$10$Q94orC29fBdso/lu5jZ5G.ZcXyN9qTzq.vEL4rdleXWQ5HLaslVSS', '0937976542', 'ADMIN', 72, 'NEW'),
(5, '2026-01-11 00:08:03.000000', '2026-01-30 00:14:56.000000', 'nguyentruong23082005@gmail.com', 'NGUYỄN', b'1', 'TRƯỜNG', '$2a$10$QuwJ3Sq0AstXe2NNcIYV8epxOWN9MYksE/RV.B2QwicGvcCvSn5s6', '0337050902', 'CUSTOMER', 909, 'LOYAL'),
(6, '2026-01-20 22:07:23.000000', '2026-01-28 23:16:40.000000', 'truong@gmail.com', 'NGUYỄN', b'1', 'TRÚC TRƯỜNG', '$2a$10$GG0CMO3slPhatKsq.9we2uGHXRaRzII8foC6XAhrL0ox5X7pR39nS', '0337050902', 'CUSTOMER', 146, 'NEW'),
(7, '2026-01-23 18:30:02.000000', '2026-01-23 18:30:02.000000', 'mongngantran2005@gmail.com', 'NGUYỄN', b'1', 'NGÂN', '$2a$10$6G0UTLc.RtXH9VhIiPfOXejTziyof5u6sfxpxzBSj29fbxlrKDk9y', '01326479851', 'CUSTOMER', 0, NULL),
(8, '2026-01-27 21:21:56.000000', '2026-01-28 23:16:49.000000', 'kim@gmail.com', 'Kim', b'1', 'SeonHo', '$2a$10$gd5k15lbw9SqvoPxtpKc7u0kaMqQ1mvkectXyup4Ayj./urt51/82', '0937976789', 'ADMIN', 1870, 'GOLD');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `view_history`
--

CREATE TABLE `view_history` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `viewed_at` datetime(6) NOT NULL,
  `product_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `view_history`
--

INSERT INTO `view_history` (`id`, `created_at`, `updated_at`, `viewed_at`, `product_id`, `user_id`) VALUES
(1, '2026-01-18 14:43:30.000000', '2026-01-19 04:38:20.000000', '2026-01-19 04:38:20.000000', 19, 5),
(2, '2026-01-18 14:43:46.000000', '2026-01-19 04:36:00.000000', '2026-01-19 04:36:00.000000', 20, 5),
(3, '2026-01-18 17:39:17.000000', '2026-01-19 10:49:35.000000', '2026-01-19 10:49:35.000000', 18, 5),
(4, '2026-01-18 18:03:16.000000', '2026-01-18 18:03:16.000000', '2026-01-18 18:03:16.000000', 14, 5),
(5, '2026-01-19 04:50:10.000000', '2026-01-19 04:50:10.000000', '2026-01-19 04:50:10.000000', 22, 5),
(6, '2026-01-19 04:50:18.000000', '2026-01-19 04:50:18.000000', '2026-01-19 04:50:18.000000', 21, 5),
(7, '2026-01-19 04:50:33.000000', '2026-01-19 04:50:33.000000', '2026-01-19 04:50:33.000000', 23, 5),
(8, '2026-01-19 04:50:43.000000', '2026-01-19 04:50:43.000000', '2026-01-19 04:50:43.000000', 24, 5),
(9, '2026-01-19 04:50:53.000000', '2026-01-19 04:50:53.000000', '2026-01-19 04:50:53.000000', 25, 5),
(10, '2026-01-19 04:59:58.000000', '2026-01-19 04:59:58.000000', '2026-01-19 04:59:58.000000', 55, 5),
(11, '2026-01-19 05:00:04.000000', '2026-01-19 05:00:04.000000', '2026-01-19 05:00:04.000000', 53, 5),
(12, '2026-01-19 05:02:31.000000', '2026-01-19 05:02:31.000000', '2026-01-19 05:02:31.000000', 81, 5),
(13, '2026-01-19 05:38:16.000000', '2026-01-30 08:42:22.000000', '2026-01-30 08:42:22.000000', 94, 5),
(14, '2026-01-19 05:44:28.000000', '2026-01-19 05:44:28.000000', '2026-01-19 05:44:28.000000', 91, 5),
(15, '2026-01-19 06:18:36.000000', '2026-01-19 08:47:39.000000', '2026-01-19 08:47:39.000000', 92, 5),
(16, '2026-01-19 06:18:49.000000', '2026-01-19 06:18:49.000000', '2026-01-19 06:18:49.000000', 28, 5),
(17, '2026-01-19 06:21:36.000000', '2026-01-29 08:31:16.000000', '2026-01-29 08:31:16.000000', 93, 5),
(18, '2026-01-21 05:08:28.000000', '2026-01-21 07:37:28.000000', '2026-01-21 07:37:28.000000', 92, 6),
(19, '2026-01-21 06:50:26.000000', '2026-01-21 08:27:33.000000', '2026-01-21 08:27:33.000000', 93, 6),
(20, '2026-01-21 06:50:36.000000', '2026-01-21 06:50:36.000000', '2026-01-21 06:50:36.000000', 19, 6),
(21, '2026-01-21 06:50:44.000000', '2026-01-21 06:50:44.000000', '2026-01-21 06:50:44.000000', 94, 6),
(22, '2026-01-21 06:50:57.000000', '2026-01-21 06:51:09.000000', '2026-01-21 06:51:09.000000', 97, 6),
(23, '2026-01-21 06:51:00.000000', '2026-01-21 06:51:00.000000', '2026-01-21 06:51:00.000000', 18, 6),
(24, '2026-01-21 07:53:28.000000', '2026-01-21 07:53:28.000000', '2026-01-21 07:53:28.000000', 99, 6),
(25, '2026-01-21 07:53:35.000000', '2026-01-21 07:53:35.000000', '2026-01-21 07:53:35.000000', 98, 6),
(26, '2026-01-21 07:53:41.000000', '2026-01-21 07:53:41.000000', '2026-01-21 07:53:41.000000', 103, 6),
(27, '2026-01-21 08:44:11.000000', '2026-01-21 08:44:47.000000', '2026-01-21 08:44:47.000000', 110, 6),
(28, '2026-01-21 08:44:18.000000', '2026-01-21 08:44:51.000000', '2026-01-21 08:44:51.000000', 111, 6),
(29, '2026-01-21 08:44:43.000000', '2026-01-21 08:44:43.000000', '2026-01-21 08:44:43.000000', 109, 6),
(30, '2026-01-24 01:31:16.000000', '2026-01-24 01:31:33.000000', '2026-01-24 01:31:33.000000', 100, 7),
(31, '2026-01-24 01:34:22.000000', '2026-01-24 01:34:22.000000', '2026-01-24 01:34:22.000000', 18, 7),
(32, '2026-01-28 05:04:28.000000', '2026-01-28 08:45:27.000000', '2026-01-28 08:45:27.000000', 107, 8),
(33, '2026-01-28 05:18:47.000000', '2026-01-28 08:42:20.000000', '2026-01-28 08:42:20.000000', 111, 8),
(34, '2026-01-28 05:57:36.000000', '2026-01-28 08:42:33.000000', '2026-01-28 08:42:33.000000', 110, 8),
(35, '2026-01-28 07:21:11.000000', '2026-01-28 07:21:11.000000', '2026-01-28 07:21:11.000000', 92, 8),
(36, '2026-01-28 08:19:57.000000', '2026-01-28 08:19:57.000000', '2026-01-28 08:19:57.000000', 109, 8),
(37, '2026-01-29 07:27:57.000000', '2026-01-29 07:32:24.000000', '2026-01-29 07:32:24.000000', 98, 4),
(38, '2026-01-29 07:40:54.000000', '2026-01-29 07:40:54.000000', '2026-01-29 07:40:54.000000', 92, 4),
(39, '2026-01-29 08:30:25.000000', '2026-01-29 08:30:25.000000', '2026-01-29 08:30:25.000000', 98, 5),
(40, '2026-01-30 06:42:43.000000', '2026-01-30 08:44:19.000000', '2026-01-30 08:44:19.000000', 111, 5),
(41, '2026-01-30 07:15:44.000000', '2026-01-30 07:15:44.000000', '2026-01-30 07:15:44.000000', 107, 5),
(42, '2026-01-30 08:39:46.000000', '2026-01-30 08:39:46.000000', '2026-01-30 08:39:46.000000', 87, 5);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `wishlist_items`
--

CREATE TABLE `wishlist_items` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `product_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `wishlist_items`
--

INSERT INTO `wishlist_items` (`id`, `created_at`, `updated_at`, `product_id`, `user_id`) VALUES
(2, '2026-01-10 03:14:21.000000', '2026-01-10 03:14:21.000000', 16, 4),
(4, '2026-01-10 03:27:14.000000', '2026-01-10 03:27:14.000000', 15, 4),
(5, '2026-01-19 04:32:12.000000', '2026-01-19 04:32:12.000000', 19, 5),
(6, '2026-01-19 04:32:13.000000', '2026-01-19 04:32:13.000000', 18, 5),
(7, '2026-01-19 04:32:15.000000', '2026-01-19 04:32:15.000000', 20, 5),
(8, '2026-01-29 04:58:15.000000', '2026-01-29 04:58:15.000000', 92, 8);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK1fa36y2oqhao3wgg2rw1pi459` (`user_id`);

--
-- Chỉ mục cho bảng `blocked_tokens`
--
ALTER TABLE `blocked_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKs9kg5eu0ii84545pxq9gbn1no` (`token`) USING HASH;

--
-- Chỉ mục cho bảng `blogs`
--
ALTER TABLE `blogs`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cartitem_user_id` (`user_id`),
  ADD KEY `idx_cartitem_temp_cart_id` (`temp_cart_id`),
  ADD KEY `FKn1s4l7h0vm4o259wpu7ft0y2y` (`product_variant_id`),
  ADD KEY `FK1re40cjegsfvw58xrkdp6bac6` (`product_id`);

--
-- Chỉ mục cho bảng `cart_item_toppings`
--
ALTER TABLE `cart_item_toppings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK7qpc6ofhbvkroff8h1aexla8p` (`cart_item_id`),
  ADD KEY `FKllaqbllrqscijq2qhlav8woqk` (`topping_id`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `discounts`
--
ALTER TABLE `discounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKbc29q3wh0lqhy0k84bx3afk08` (`code`),
  ADD KEY `FKspsy31khx7qwt8hxwhi3vatad` (`gift_product_id`);

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKhlglkvf5i60dv6dn397ethgpt` (`address_id`),
  ADD KEY `FK32ql8ubntj5uh44ph9659tiih` (`user_id`);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKbioxgbv59vetrxe0ejfubep1w` (`order_id`),
  ADD KEY `FKltmtlue0wixrg1cf0xo7x0l4d` (`product_variant_id`),
  ADD KEY `FKocimc7dtr037rh4ls4l95nlfi` (`product_id`);

--
-- Chỉ mục cho bảng `order_item_toppings`
--
ALTER TABLE `order_item_toppings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKqonqgw2q2blcduhtbkekq27wr` (`order_item_id`),
  ADD KEY `FK3xmmr76snfleub6gara1po23b` (`topping_id`);

--
-- Chỉ mục cho bảng `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK71lqwbwtklmljk3qlsugr1mig` (`token`),
  ADD KEY `FKk3ndxg5xp6v7wd4gjyusp15gq` (`user_id`);

--
-- Chỉ mục cho bảng `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKlsp8jh693lih2txq7dl4bdnpx` (`transaction_id`),
  ADD KEY `FKnsous9qyrjv5ss8que6o6617` (`order_id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKog2rp4qthbtt2lfyhfo32lsw9` (`category_id`);

--
-- Chỉ mục cho bảng `product_discounts`
--
ALTER TABLE `product_discounts`
  ADD KEY `FKe9dwb270kgeg654tlm792m16e` (`discount_id`),
  ADD KEY `FK569m0j2bdds7b29fmo0i9jmvl` (`product_id`);

--
-- Chỉ mục cho bảng `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK1k3tfy1vq1imta5h7yhpxcc9n` (`user_id`,`product_id`,`order_id`),
  ADD KEY `FKkpu8o8nqopc4lcqcfnnlpq5vg` (`order_id`),
  ADD KEY `FK35kxxqe2g9r4mww80w9e3tnw9` (`product_id`);

--
-- Chỉ mục cho bảng `product_size_prices`
--
ALTER TABLE `product_size_prices`
  ADD PRIMARY KEY (`product_id`,`size_name`);

--
-- Chỉ mục cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKq935p2d1pbjm39n0063ghnfgn` (`sku`),
  ADD KEY `FKosqitn4s405cynmhb87lkvuau` (`product_id`);

--
-- Chỉ mục cho bảng `promotion_banners`
--
ALTER TABLE `promotion_banners`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKghpmfn23vmxfu3spu3lfg4r2d` (`token`),
  ADD UNIQUE KEY `UK7tdcd6ab5wsgoudnvj7xf1b7l` (`user_id`);

--
-- Chỉ mục cho bảng `refund_items`
--
ALTER TABLE `refund_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK66ijpa0t6ylg2uef0xq6mynj0` (`order_item_id`),
  ADD KEY `FKdyk5uaocrvggxbx3ph0t9qvtq` (`refund_request_id`);

--
-- Chỉ mục cho bảng `refund_requests`
--
ALTER TABLE `refund_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK452xm7hwgngbanwkdgs3601b1` (`order_id`),
  ADD KEY `FKh2s2m4dt9mnx896s9uccsguib` (`user_id`);

--
-- Chỉ mục cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK1nv3auyahyyy79hvtrcqgtfo9` (`user_id`,`product_id`),
  ADD UNIQUE KEY `UKr8vcm6neix10qorxt37o37kd8` (`user_id`,`product_id`,`order_id`),
  ADD KEY `FKpl51cejpw4gy5swfar8br9ngi` (`product_id`);

--
-- Chỉ mục cho bảng `review_images`
--
ALTER TABLE `review_images`
  ADD KEY `FK3aayo5bjciyemf3bvvt987hkr` (`review_id`);

--
-- Chỉ mục cho bảng `search_history`
--
ALTER TABLE `search_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDXkbceo892cwbqkxtcubvmjg3hj` (`user_id`,`query`);

--
-- Chỉ mục cho bảng `toppings`
--
ALTER TABLE `toppings`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`);

--
-- Chỉ mục cho bảng `view_history`
--
ALTER TABLE `view_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_view_history_user` (`user_id`),
  ADD KEY `idx_view_history_viewed_at` (`viewed_at`),
  ADD KEY `FKktby7k3hek0l49pgrjonpx4f6` (`product_id`);

--
-- Chỉ mục cho bảng `wishlist_items`
--
ALTER TABLE `wishlist_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKtp53unkks741xiqi6m620i7mx` (`user_id`,`product_id`),
  ADD KEY `FKqxj7lncd242b59fb78rqegyxj` (`product_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `blocked_tokens`
--
ALTER TABLE `blocked_tokens`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `blogs`
--
ALTER TABLE `blogs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;

--
-- AUTO_INCREMENT cho bảng `cart_item_toppings`
--
ALTER TABLE `cart_item_toppings`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT cho bảng `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `discounts`
--
ALTER TABLE `discounts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;

--
-- AUTO_INCREMENT cho bảng `order_item_toppings`
--
ALTER TABLE `order_item_toppings`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;

--
-- AUTO_INCREMENT cho bảng `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT cho bảng `product_reviews`
--
ALTER TABLE `product_reviews`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT cho bảng `promotion_banners`
--
ALTER TABLE `promotion_banners`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT cho bảng `refund_items`
--
ALTER TABLE `refund_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `refund_requests`
--
ALTER TABLE `refund_requests`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `search_history`
--
ALTER TABLE `search_history`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT cho bảng `toppings`
--
ALTER TABLE `toppings`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `view_history`
--
ALTER TABLE `view_history`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT cho bảng `wishlist_items`
--
ALTER TABLE `wishlist_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `FK1fa36y2oqhao3wgg2rw1pi459` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `FK1re40cjegsfvw58xrkdp6bac6` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `FK709eickf3kc0dujx3ub9i7btf` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKn1s4l7h0vm4o259wpu7ft0y2y` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`);

--
-- Các ràng buộc cho bảng `cart_item_toppings`
--
ALTER TABLE `cart_item_toppings`
  ADD CONSTRAINT `FK7qpc6ofhbvkroff8h1aexla8p` FOREIGN KEY (`cart_item_id`) REFERENCES `cart_items` (`id`),
  ADD CONSTRAINT `FKllaqbllrqscijq2qhlav8woqk` FOREIGN KEY (`topping_id`) REFERENCES `toppings` (`id`);

--
-- Các ràng buộc cho bảng `discounts`
--
ALTER TABLE `discounts`
  ADD CONSTRAINT `FKspsy31khx7qwt8hxwhi3vatad` FOREIGN KEY (`gift_product_id`) REFERENCES `products` (`id`);

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `FK32ql8ubntj5uh44ph9659tiih` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKhlglkvf5i60dv6dn397ethgpt` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`);

--
-- Các ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `FKbioxgbv59vetrxe0ejfubep1w` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `FKltmtlue0wixrg1cf0xo7x0l4d` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`),
  ADD CONSTRAINT `FKocimc7dtr037rh4ls4l95nlfi` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Các ràng buộc cho bảng `order_item_toppings`
--
ALTER TABLE `order_item_toppings`
  ADD CONSTRAINT `FK3xmmr76snfleub6gara1po23b` FOREIGN KEY (`topping_id`) REFERENCES `toppings` (`id`),
  ADD CONSTRAINT `FKqonqgw2q2blcduhtbkekq27wr` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`);

--
-- Các ràng buộc cho bảng `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `FKk3ndxg5xp6v7wd4gjyusp15gq` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD CONSTRAINT `FKnsous9qyrjv5ss8que6o6617` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `FKog2rp4qthbtt2lfyhfo32lsw9` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Các ràng buộc cho bảng `product_discounts`
--
ALTER TABLE `product_discounts`
  ADD CONSTRAINT `FK569m0j2bdds7b29fmo0i9jmvl` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `FKe9dwb270kgeg654tlm792m16e` FOREIGN KEY (`discount_id`) REFERENCES `discounts` (`id`);

--
-- Các ràng buộc cho bảng `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD CONSTRAINT `FK35kxxqe2g9r4mww80w9e3tnw9` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `FK58i39bhws2hss3tbcvdmrm60f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKkpu8o8nqopc4lcqcfnnlpq5vg` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

--
-- Các ràng buộc cho bảng `product_size_prices`
--
ALTER TABLE `product_size_prices`
  ADD CONSTRAINT `FKf0i3qrpcnqkrf532o0s7fgp41` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Các ràng buộc cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `FKosqitn4s405cynmhb87lkvuau` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Các ràng buộc cho bảng `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `FK1lih5y2npsf8u5o3vhdb9y0os` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `refund_items`
--
ALTER TABLE `refund_items`
  ADD CONSTRAINT `FKdyk5uaocrvggxbx3ph0t9qvtq` FOREIGN KEY (`refund_request_id`) REFERENCES `refund_requests` (`id`),
  ADD CONSTRAINT `FKt30eqahpu8nehh4y98ik6c4i2` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`);

--
-- Các ràng buộc cho bảng `refund_requests`
--
ALTER TABLE `refund_requests`
  ADD CONSTRAINT `FK452xm7hwgngbanwkdgs3601b1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `FKh2s2m4dt9mnx896s9uccsguib` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `FKcgy7qjc1r99dp117y9en6lxye` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKpl51cejpw4gy5swfar8br9ngi` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Các ràng buộc cho bảng `review_images`
--
ALTER TABLE `review_images`
  ADD CONSTRAINT `FK3aayo5bjciyemf3bvvt987hkr` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`);

--
-- Các ràng buộc cho bảng `search_history`
--
ALTER TABLE `search_history`
  ADD CONSTRAINT `FK8ll2cxj6i83mnrcyxrxl4b7dm` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `view_history`
--
ALTER TABLE `view_history`
  ADD CONSTRAINT `FKd8qhxyfxcdueyy3f5xdju7oj5` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKktby7k3hek0l49pgrjonpx4f6` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Các ràng buộc cho bảng `wishlist_items`
--
ALTER TABLE `wishlist_items`
  ADD CONSTRAINT `FKmmj2k1i459yu449k3h1vx5abp` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKqxj7lncd242b59fb78rqegyxj` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
