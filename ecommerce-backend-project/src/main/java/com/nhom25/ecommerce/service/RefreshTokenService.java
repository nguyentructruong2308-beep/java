package com.nhom25.ecommerce.service;

import com.nhom25.ecommerce.entity.RefreshToken;
import com.nhom25.ecommerce.entity.User;
import com.nhom25.ecommerce.exception.BadRequestException;
import com.nhom25.ecommerce.repository.RefreshTokenRepository;
import com.nhom25.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    @Value("${app.jwt.refresh-expiration-ms:86400000}")
    private Long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    public RefreshToken createRefreshToken(Long userId) {
        if (userId == null)
            throw new BadRequestException("User ID must not be null");
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        // Xóa token cũ của user nếu có
        refreshTokenRepository.deleteByUser(user);
        refreshTokenRepository.flush();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        refreshToken.setToken(UUID.randomUUID().toString());

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new BadRequestException("Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    public java.util.Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public void deleteByUserId(Long userId) {
        if (userId != null) {
            userRepository.findById(userId).ifPresent(refreshTokenRepository::deleteByUser);
        }
    }
}
