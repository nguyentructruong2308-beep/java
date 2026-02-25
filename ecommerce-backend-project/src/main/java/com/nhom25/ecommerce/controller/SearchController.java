package com.nhom25.ecommerce.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.nhom25.ecommerce.dto.ProductDTO;
import com.nhom25.ecommerce.dto.SearchResultDTO;
import com.nhom25.ecommerce.service.SearchService;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<SearchResultDTO> searchProducts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        SearchResultDTO result = searchService.searchProducts(
                q, categoryId, minPrice, maxPrice, minRating, sortBy, sortDir, page, size);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/recommendations/{productId}")
    public ResponseEntity<List<ProductDTO>> getRecommendations(@PathVariable Long productId) {
        List<ProductDTO> recommendations = searchService.getRecommendedProducts(productId, 4);
        return ResponseEntity.ok(recommendations);
    }
}