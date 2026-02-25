package com.nhom25.ecommerce.service;

import com.nhom25.ecommerce.entity.Order;
import com.nhom25.ecommerce.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    public void sendOrderConfirmation(Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable("user", order.getUser());

            String html = templateEngine.process("mail/order-confirmation", context);

            String to = order.getUser().getEmail();
            if (to == null)
                throw new RuntimeException("Email recipient is null");

            helper.setTo(to);
            helper.setText(html, true);
            helper.setSubject("Xác nhận đơn hàng #" + order.getId());
            helper.setFrom("no-reply@ecommerce.com");

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Lỗi gửi email xác nhận đơn hàng", e);
        }
    }

    public void sendWelcomeEmail(User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            Context context = new Context();
            context.setVariable("user", user);

            String html = templateEngine.process("mail/welcome", context);

            String to = user.getEmail();
            if (to == null)
                throw new RuntimeException("Email recipient is null");

            helper.setTo(to);
            helper.setText(html, true);
            helper.setSubject("Chào mừng bạn đến với Ecommerce Store");
            helper.setFrom("no-reply@ecommerce.com");

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Lỗi gửi email chào mừng", e);
        }
    }

    public void sendPasswordResetEmail(String email, String token) {

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            Context context = new Context();
            context.setVariable("token", token);
            // Link thực tế nên cấu hình ở application.yml
            context.setVariable("resetUrl", "http://localhost:5173/reset-password?token=" + token);

            String html = templateEngine.process("mail/password-reset", context);

            if (email == null)
                throw new RuntimeException("Email recipient is null");

            helper.setTo(email);
            helper.setText(html, true);
            helper.setSubject("Yêu cầu đặt lại mật khẩu");
            helper.setFrom("no-reply@ecommerce.com");

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Lỗi gửi email khôi phục mật khẩu", e);
        }
    }

    public void sendRefundConfirmation(com.nhom25.ecommerce.entity.RefundRequest refundRequest) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            Context context = new Context();
            context.setVariable("refund", refundRequest);
            context.setVariable("user", refundRequest.getUser());

            String html = templateEngine.process("mail/refund-confirmation", context);

            helper.setTo(refundRequest.getUser().getEmail());
            helper.setText(html, true);
            helper.setSubject("Xác nhận yêu cầu hoàn tiền #" + refundRequest.getId());
            helper.setFrom("no-reply@ecommerce.com");

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Lỗi gửi email xác nhận hoàn tiền", e);
        }
    }

    public void sendRefundStatusUpdate(com.nhom25.ecommerce.entity.RefundRequest refundRequest) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            Context context = new Context();
            context.setVariable("refund", refundRequest);
            context.setVariable("user", refundRequest.getUser());

            String html = templateEngine.process("mail/refund-status", context);

            helper.setTo(refundRequest.getUser().getEmail());
            helper.setText(html, true);
            helper.setSubject("Cập nhật trạng thái yêu cầu hoàn tiền #" + refundRequest.getId());
            helper.setFrom("no-reply@ecommerce.com");

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Lỗi gửi email cập nhật trạng thái hoàn tiền", e);
        }
    }
}
