package com.nhom25.ecommerce.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nhom25.ecommerce.dto.PromotionBannerDTO;
import com.nhom25.ecommerce.entity.PromotionBanner;
import com.nhom25.ecommerce.exception.ResourceNotFoundException;
import com.nhom25.ecommerce.repository.PromotionBannerRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PromotionBannerService {

    private final PromotionBannerRepository bannerRepository;

    @Transactional(readOnly = true)
    public List<PromotionBannerDTO> getActiveBanners() {
        return bannerRepository.findAllByIsActiveTrueOrderByCreatedAtDesc()
           .stream()
           .map(this::convertToDTO)
           .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PromotionBannerDTO> getAllBanners() {
        return bannerRepository.findAll()
           .stream()
           .map(this::convertToDTO)
           .collect(Collectors.toList());
    }

    public PromotionBannerDTO createBanner(PromotionBannerDTO dto) {
        PromotionBanner banner = new PromotionBanner();
        mapDtoToEntity(dto, banner);
        PromotionBanner savedBanner = bannerRepository.save(banner);
        return convertToDTO(savedBanner);
    }

    public PromotionBannerDTO updateBanner(Long id, PromotionBannerDTO dto) {
        PromotionBanner banner = bannerRepository.findById(id)
           .orElseThrow(() -> new ResourceNotFoundException("Banner not found"));
        mapDtoToEntity(dto, banner);
        PromotionBanner updatedBanner = bannerRepository.save(banner);
        return convertToDTO(updatedBanner);
    }

    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }

    // Mappers
    private PromotionBannerDTO convertToDTO(PromotionBanner entity) {
        PromotionBannerDTO dto = new PromotionBannerDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setImageUrl(entity.getImageUrl());
        dto.setTargetUrl(entity.getTargetUrl());
        dto.setIsActive(entity.getIsActive());
        return dto;
    }

    private void mapDtoToEntity(PromotionBannerDTO dto, PromotionBanner entity) {
        entity.setTitle(dto.getTitle());
        entity.setImageUrl(dto.getImageUrl());
        entity.setTargetUrl(dto.getTargetUrl());
        if (dto.getIsActive()!= null) {
            entity.setIsActive(dto.getIsActive());
        }
    }
}