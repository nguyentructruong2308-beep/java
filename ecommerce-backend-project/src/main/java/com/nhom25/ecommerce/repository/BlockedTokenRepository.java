package com.nhom25.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nhom25.ecommerce.entity.BlockedToken;

import java.time.LocalDateTime;

@Repository
public interface BlockedTokenRepository extends JpaRepository<BlockedToken, Long> {
    boolean existsByToken(String token);
    void deleteAllByExpiryDateBefore(LocalDateTime now);
}