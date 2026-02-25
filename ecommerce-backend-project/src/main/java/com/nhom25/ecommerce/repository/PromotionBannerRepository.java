package com.nhom25.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nhom25.ecommerce.entity.PromotionBanner;

import java.util.List;

@Repository
public interface PromotionBannerRepository extends JpaRepository<PromotionBanner, Long> {
    List<PromotionBanner> findAllByIsActiveTrueOrderByCreatedAtDesc();
}