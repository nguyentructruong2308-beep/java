package com.nhom25.ecommerce.service;

import com.nhom25.ecommerce.dto.ChatMessageDTO;
import com.nhom25.ecommerce.entity.Category;
import com.nhom25.ecommerce.entity.Product;
import com.nhom25.ecommerce.repository.CategoryRepository;
import com.nhom25.ecommerce.repository.OrderRepository;
import com.nhom25.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIChatService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;

    // Các pattern để nhận diện ý định người dùng
    private static final Pattern GREETING_PATTERN = Pattern.compile(
            "(?i)(xin chào|chào|hello|hi|hey|alo|chào bạn|xin chao)");
    private static final Pattern PRODUCT_SEARCH_PATTERN = Pattern.compile(
            "(?i)(tìm|kiếm|search|có|bán|muốn mua|cho xem|gợi ý|recommend|đề xuất)\\s*(.+?)(?:\\s*(?:không|ko|nào|đi|nhé|ạ|ơi|với|giá|dưới|trên))?$");
    private static final Pattern PRICE_PATTERN = Pattern.compile(
            "(?i)(giá|price|bao nhiêu|mấy tiền|giá cả|giá bao nhiêu)");
    private static final Pattern CATEGORY_PATTERN = Pattern.compile(
            "(?i)(danh mục|loại|category|menu|thực đơn|có gì)");
    private static final Pattern ORDER_PATTERN = Pattern.compile(
            "(?i)(đơn hàng|order|giao hàng|ship|vận chuyển|delivery|theo dõi|tracking)");
    private static final Pattern PROMOTION_PATTERN = Pattern.compile(
            "(?i)(khuyến mãi|giảm giá|sale|discount|voucher|mã giảm|coupon|ưu đãi)");
    private static final Pattern HELP_PATTERN = Pattern.compile(
            "(?i)(giúp|help|hướng dẫn|cách|làm sao|how to|hỗ trợ|support)");
    private static final Pattern THANK_PATTERN = Pattern.compile(
            "(?i)(cảm ơn|cám ơn|thank|thanks|tks)");
    private static final Pattern GOODBYE_PATTERN = Pattern.compile(
            "(?i)(tạm biệt|bye|goodbye|bái bai|hẹn gặp lại)");
    private static final Pattern PRICE_RANGE_PATTERN = Pattern.compile(
            "(?i)(dưới|under|below|<)\\s*(\\d+)|(trên|over|above|>)\\s*(\\d+)|(từ|from)\\s*(\\d+)\\s*(đến|to|-|tới)\\s*(\\d+)");

    /**
     * Xử lý tin nhắn từ người dùng và trả về phản hồi AI
     */
    public ChatMessageDTO processMessage(String userMessage, List<ChatMessageDTO> conversationHistory) {
        String response = generateResponse(userMessage.trim(), conversationHistory);

        return ChatMessageDTO.builder()
                .role("assistant")
                .content(response)
                .timestamp(LocalDateTime.now())
                .build();
    }

    private String generateResponse(String message, List<ChatMessageDTO> history) {
        // Kiểm tra các pattern theo thứ tự ưu tiên

        // 1. Chào hỏi
        if (GREETING_PATTERN.matcher(message).find()) {
            return getGreetingResponse();
        }

        // 2. Cảm ơn
        if (THANK_PATTERN.matcher(message).find()) {
            return getThankResponse();
        }

        // 3. Tạm biệt
        if (GOODBYE_PATTERN.matcher(message).find()) {
            return getGoodbyeResponse();
        }

        // 4. Hỏi về danh mục
        if (CATEGORY_PATTERN.matcher(message).find()) {
            return getCategoryResponse();
        }

        // 5. Hỏi về đơn hàng
        if (ORDER_PATTERN.matcher(message).find()) {
            return getOrderResponse();
        }

        // 6. Hỏi về khuyến mãi
        if (PROMOTION_PATTERN.matcher(message).find()) {
            return getPromotionResponse();
        }

        // 7. Cần hỗ trợ
        if (HELP_PATTERN.matcher(message).find()) {
            return getHelpResponse();
        }

        // 8. Tìm sản phẩm theo giá
        Matcher priceMatcher = PRICE_RANGE_PATTERN.matcher(message);
        if (priceMatcher.find()) {
            return getProductsByPriceRange(message);
        }

        // 9. Tìm sản phẩm (mặc định)
        return searchProducts(message);
    }

    private String getGreetingResponse() {
        String[] greetings = {
                "🍦 Xin chào! Tôi là trợ lý AI của ICREAM. Tôi có thể giúp bạn:\n" +
                        "• Tìm kiếm sản phẩm\n" +
                        "• Xem danh mục sản phẩm\n" +
                        "• Thông tin đơn hàng\n" +
                        "• Khuyến mãi hiện có\n\n" +
                        "Bạn muốn tìm hiểu gì hôm nay?",

                "👋 Chào bạn! Rất vui được hỗ trợ bạn tại ICREAM. Bạn đang tìm kiếm món gì nhỉ?",

                "🎉 Hello! Tôi là AI của ICREAM. Hãy cho tôi biết bạn cần gì nhé!"
        };
        return greetings[new Random().nextInt(greetings.length)];
    }

    private String getThankResponse() {
        String[] thanks = {
                "🙏 Không có gì ạ! Rất vui được hỗ trợ bạn. Có gì cần thêm cứ hỏi nhé!",
                "😊 Cảm ơn bạn đã ghé thăm ICREAM! Chúc bạn ngày tốt lành!",
                "💕 Rất hân hạnh được phục vụ bạn! Có gì thắc mắc cứ liên hệ nhé!"
        };
        return thanks[new Random().nextInt(thanks.length)];
    }

    private String getGoodbyeResponse() {
        String[] goodbyes = {
                "👋 Tạm biệt bạn! Hẹn gặp lại tại ICREAM nhé! 🍦",
                "😊 Bye bye! Cảm ơn bạn đã ghé thăm. Chúc bạn ngon miệng!",
                "🌟 Hẹn gặp lại! Đừng quên ghé ICREAM để thưởng thức kem ngon nhé!"
        };
        return goodbyes[new Random().nextInt(goodbyes.length)];
    }

    private String getCategoryResponse() {
        List<Category> categories = categoryRepository.findAll();
        if (categories.isEmpty()) {
            return "📋 Hiện tại chưa có danh mục nào. Vui lòng quay lại sau!";
        }

        StringBuilder sb = new StringBuilder("📋 **Danh mục sản phẩm tại ICREAM:**\n\n");
        for (Category cat : categories) {
            sb.append("• ").append(cat.getName()).append("\n");
        }
        sb.append("\n💡 Gõ tên danh mục để xem sản phẩm nhé!");
        return sb.toString();
    }

    private String getOrderResponse() {
        return "📦 **Thông tin về đơn hàng:**\n\n" +
                "• Để xem đơn hàng của bạn, hãy đăng nhập và vào mục **Đơn mua** trong trang cá nhân.\n\n" +
                "• **Thời gian giao hàng:** 1-3 ngày làm việc\n" +
                "• **Phí ship:** Miễn phí cho đơn từ 500.000đ\n" +
                "• **Hotline hỗ trợ:** 1900 2812\n\n" +
                "Bạn có câu hỏi khác về đơn hàng không?";
    }

    private String getPromotionResponse() {
        return "🎁 **Khuyến mãi đang diễn ra:**\n\n" +
                "• 🚚 **Miễn phí ship** cho đơn hàng từ 500.000đ\n" +
                "• 🎉 **Giảm 10%** cho lần mua thứ 2 trong tháng\n" +
                "• 🍦 **Combo tiết kiệm** - Mua 3 tặng 1\n\n" +
                "💡 Nhập mã **NEWBIE10** để giảm 10% cho khách hàng mới!\n\n" +
                "Bạn muốn xem sản phẩm nào?";
    }

    private String getHelpResponse() {
        return "❓ **Tôi có thể giúp bạn với:**\n\n" +
                "1️⃣ **Tìm sản phẩm** - Gõ tên hoặc mô tả sản phẩm\n" +
                "2️⃣ **Xem danh mục** - Gõ \"danh mục\" hoặc \"menu\"\n" +
                "3️⃣ **Thông tin đơn hàng** - Gõ \"đơn hàng\"\n" +
                "4️⃣ **Khuyến mãi** - Gõ \"khuyến mãi\" hoặc \"sale\"\n" +
                "5️⃣ **Tìm theo giá** - Gõ \"dưới 50k\" hoặc \"từ 30k đến 100k\"\n\n" +
                "💬 Hãy thử hỏi tôi điều gì đó!";
    }

    private String getProductsByPriceRange(String message) {
        BigDecimal minPrice = null;
        BigDecimal maxPrice = null;

        // Parse price from message
        Pattern numPattern = Pattern.compile("(\\d+)");
        Matcher matcher = numPattern.matcher(message.replaceAll("[,.]", ""));
        List<Integer> numbers = new ArrayList<>();
        while (matcher.find()) {
            numbers.add(Integer.parseInt(matcher.group(1)));
        }

        if (message.toLowerCase().contains("dưới") || message.toLowerCase().contains("under")) {
            if (!numbers.isEmpty()) {
                maxPrice = BigDecimal.valueOf(numbers.get(0) * (numbers.get(0) < 1000 ? 1000 : 1));
            }
        } else if (message.toLowerCase().contains("trên") || message.toLowerCase().contains("over")) {
            if (!numbers.isEmpty()) {
                minPrice = BigDecimal.valueOf(numbers.get(0) * (numbers.get(0) < 1000 ? 1000 : 1));
            }
        } else if (numbers.size() >= 2) {
            minPrice = BigDecimal.valueOf(numbers.get(0) * (numbers.get(0) < 1000 ? 1000 : 1));
            maxPrice = BigDecimal.valueOf(numbers.get(1) * (numbers.get(1) < 1000 ? 1000 : 1));
        }

        List<Product> products = productRepository.findAll();

        final BigDecimal min = minPrice;
        final BigDecimal max = maxPrice;

        List<Product> filtered = products.stream()
                .filter(p -> {
                    if (min != null && p.getPrice().compareTo(min) < 0)
                        return false;
                    if (max != null && p.getPrice().compareTo(max) > 0)
                        return false;
                    return true;
                })
                .limit(5)
                .collect(Collectors.toList());

        if (filtered.isEmpty()) {
            return "😔 Không tìm thấy sản phẩm nào trong khoảng giá này. Thử mức giá khác nhé!";
        }

        return formatProductList(filtered, "Sản phẩm theo giá bạn yêu cầu");
    }

    private String searchProducts(String query) {
        // Tìm kiếm sản phẩm theo tên hoặc mô tả
        List<Product> products = productRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                query, query, PageRequest.of(0, 5)).getContent();

        // Nếu không tìm thấy, thử tìm theo category
        if (products.isEmpty()) {
            Optional<Category> category = categoryRepository.findAll().stream()
                    .filter(c -> c.getName().toLowerCase().contains(query.toLowerCase()))
                    .findFirst();

            if (category.isPresent()) {
                products = productRepository.findByCategoryId(category.get().getId(), PageRequest.of(0, 5))
                        .getContent();
            }
        }

        if (products.isEmpty()) {
            // Gợi ý sản phẩm phổ biến
            products = productRepository.findAll(PageRequest.of(0, 3)).getContent();
            if (!products.isEmpty()) {
                return "🔍 Không tìm thấy kết quả cho \"" + query + "\"\n\n" +
                        "💡 **Có thể bạn quan tâm:**\n\n" +
                        formatProductListShort(products);
            }
            return "🔍 Không tìm thấy sản phẩm nào phù hợp với \"" + query + "\".\n\n" +
                    "💡 Thử gõ: \"danh mục\" để xem tất cả loại sản phẩm!";
        }

        return formatProductList(products, "Kết quả tìm kiếm cho \"" + query + "\"");
    }

    private String formatProductList(List<Product> products, String title) {
        StringBuilder sb = new StringBuilder("🍦 **" + title + ":**\n\n");

        for (Product p : products) {
            sb.append("📍 **").append(p.getName()).append("**\n");
            sb.append("   💰 ").append(formatPrice(p.getPrice())).append("\n");
            if (p.getDescription() != null && !p.getDescription().isEmpty()) {
                String desc = p.getDescription().length() > 50
                        ? p.getDescription().substring(0, 50) + "..."
                        : p.getDescription();
                sb.append("   📝 ").append(desc).append("\n");
            }
            sb.append("\n");
        }

        sb.append("👉 Click vào sản phẩm trên website để xem chi tiết và đặt hàng!");
        return sb.toString();
    }

    private String formatProductListShort(List<Product> products) {
        StringBuilder sb = new StringBuilder();
        for (Product p : products) {
            sb.append("• ").append(p.getName()).append(" - ").append(formatPrice(p.getPrice())).append("\n");
        }
        return sb.toString();
    }

    private String formatPrice(BigDecimal price) {
        return String.format("%,.0f₫", price);
    }
}
