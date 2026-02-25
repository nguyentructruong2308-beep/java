package com.nhom25.ecommerce.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nhom25.ecommerce.dto.ProductDTO;
import com.nhom25.ecommerce.dto.ProductVariantDTO;
import com.nhom25.ecommerce.entity.Category;
import com.nhom25.ecommerce.entity.Product;
import com.nhom25.ecommerce.entity.ProductVariant;
import com.nhom25.ecommerce.exception.BadRequestException;
import com.nhom25.ecommerce.exception.ResourceNotFoundException;
import com.nhom25.ecommerce.repository.CategoryRepository;
import com.nhom25.ecommerce.repository.ProductRepository;
import com.nhom25.ecommerce.repository.ProductVariantRepository;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository productVariantRepository;

    @Transactional
    public ProductDTO createProduct(ProductDTO productDTO) {
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + productDTO.getCategoryId()));

        Product product = new Product();
        mapDtoToEntity(productDTO, product);
        product.setCategory(category);
        product.setIsActive(true);
        product.setIsFeatured(productDTO.getIsFeatured() != null ? productDTO.getIsFeatured() : false);
        product.setAverageRating(0.0);
        product.setReviewCount(0);
        product.setViewCount(0L);

        Product savedProduct = productRepository.save(product);

        // Xử lý variants nếu có (không bắt buộc)
        if (productDTO.getVariants() != null && !productDTO.getVariants().isEmpty()) {
            for (ProductVariantDTO variantDTO : productDTO.getVariants()) {

                if (variantDTO.getSku() == null || variantDTO.getSku().isBlank()) {
                    throw new BadRequestException("SKU is required for all variants.");
                }

                if (productVariantRepository.existsBySku(variantDTO.getSku())) {
                    throw new BadRequestException("SKU '" + variantDTO.getSku() + "' already exists.");
                }

                ProductVariant variant = new ProductVariant();
                mapVariantDtoToEntity(variantDTO, variant);
                variant.setProduct(savedProduct);

                // ✅ CHỈ add vào collection, KHÔNG setVariants
                savedProduct.getVariants().add(variant);
            }
        }

        // cascade = ALL → tự save variant
        return convertToDTO(savedProduct);
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id: " + id));

        if (!product.getCategory().getId().equals(productDTO.getCategoryId())) {
            Category newCategory = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found with id: " + productDTO.getCategoryId()));
            product.setCategory(newCategory);
        }

        mapDtoToEntity(productDTO, product);

        // Xử lý variants (có thể rỗng - sản phẩm không có biến thể)
        List<ProductVariantDTO> dtoVariants = productDTO.getVariants() != null ? productDTO.getVariants()
                : new ArrayList<>();

        // ==== THU THẬP VARIANT IDs VÀ SKUs SẼ BỊ XÓA ====
        Set<Long> dtoVariantIds = dtoVariants.stream()
                .map(ProductVariantDTO::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Thu thập SKU của các variant sẽ bị xóa (để cho phép reuse trong cùng request)
        Set<String> skusBeingDeleted = product.getVariants().stream()
                .filter(v -> !dtoVariantIds.contains(v.getId()))
                .map(ProductVariant::getSku)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // ==== XÓA VARIANT KHÔNG CÒN TRONG DTO ====
        Iterator<ProductVariant> iterator = product.getVariants().iterator();
        while (iterator.hasNext()) {
            ProductVariant existing = iterator.next();
            if (!dtoVariantIds.contains(existing.getId())) {
                iterator.remove(); // orphanRemoval tự delete
            }
        }

        // ==== UPDATE / ADD VARIANT ====
        for (ProductVariantDTO variantDTO : dtoVariants) {

            if (variantDTO.getSku() == null || variantDTO.getSku().isBlank()) {
                throw new BadRequestException("SKU is required for all variants.");
            }

            Optional<ProductVariant> bySku = productVariantRepository.findBySku(variantDTO.getSku());
            // Cho phép SKU nếu: không tồn tại, hoặc thuộc về variant đang update, hoặc
            // thuộc variant sắp xóa
            if (bySku.isPresent() &&
                    (variantDTO.getId() == null || !bySku.get().getId().equals(variantDTO.getId())) &&
                    !skusBeingDeleted.contains(variantDTO.getSku())) {
                throw new BadRequestException(
                        "SKU '" + variantDTO.getSku() + "' is already in use.");
            }

            if (variantDTO.getId() != null) {
                // UPDATE
                ProductVariant existingVariant = product.getVariants().stream()
                        .filter(v -> v.getId().equals(variantDTO.getId()))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Variant not found with id: " + variantDTO.getId()));

                mapVariantDtoToEntity(variantDTO, existingVariant);

            } else {
                // ADD NEW
                ProductVariant newVariant = new ProductVariant();
                mapVariantDtoToEntity(variantDTO, newVariant);
                newVariant.setProduct(product);
                product.getVariants().add(newVariant);
            }
        }

        return convertToDTO(productRepository.save(product));
    }

    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return convertToDTO(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findAllActiveProducts(pageable).map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> searchProducts(String name, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice,
            Double minRating, Pageable pageable) {
        return productRepository.findProductsWithFilters(name, categoryId, minPrice, maxPrice, minRating, pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> getLowStockProducts(Integer threshold, Pageable pageable) {
        return productRepository.findLowStockProducts(threshold, pageable).map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> getStagnantProducts(Integer minStock, Long maxSold, Long maxViews, Pageable pageable) {
        // Mặc định: Tồn >= 50, Bán <= 10, Xem <= 1000
        int stock = minStock != null ? minStock : 50;
        long sold = maxSold != null ? maxSold : 10;
        long views = maxViews != null ? maxViews : 1000;

        Page<Product> products = productRepository.findStagnantProducts(stock, sold, views, pageable);
        return products.map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryIdAndIsActiveTrue(categoryId).stream().map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrueAndIsActiveTrue().stream().map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        product.setIsActive(false);
        productRepository.save(product);
    }

    public void updateVariantStock(Long variantId, Integer quantity) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant not found with id: " + variantId));
        int newStock = variant.getStockQuantity() - quantity;
        if (newStock < 0) {
            throw new BadRequestException("Insufficient stock for product: " + variant.getProduct().getName());
        }
        variant.setStockQuantity(newStock);
        productVariantRepository.save(variant);
    }

    public void restoreVariantStock(Long variantId, Integer quantity) {
        if (quantity <= 0) {
            return;
        }
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant not found with id: " + variantId));
        variant.setStockQuantity(variant.getStockQuantity() + quantity);
        productVariantRepository.save(variant);
    }

    public void updateProductStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        int newStock = currentStock - quantity;
        if (newStock < 0) {
            throw new BadRequestException("Insufficient stock for product: " + product.getName());
        }
        product.setStockQuantity(newStock);
        productRepository.save(product);
    }

    public void restoreProductStock(Long productId, Integer quantity) {
        if (quantity <= 0) {
            return;
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        product.setStockQuantity(currentStock + quantity);
        productRepository.save(product);
    }

    public void setProductStock(Long productId, Integer quantity) {
        if (quantity < 0) {
            throw new BadRequestException("Stock quantity cannot be negative.");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        product.setStockQuantity(quantity);
        productRepository.save(product);
    }

    public void setVariantStock(Long variantId, Integer quantity) {
        if (quantity < 0) {
            throw new BadRequestException("Stock quantity cannot be negative.");
        }
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant not found with id: " + variantId));
        variant.setStockQuantity(quantity);
        productVariantRepository.save(variant);
    }

    public void incrementViewCount(Long productId) {
        productRepository.findById(productId).ifPresent(p -> {
            if (p.getViewCount() == null) {
                p.setViewCount(1L);
            } else {
                p.setViewCount(p.getViewCount() + 1);
            }
            productRepository.save(p);
        });
    }

    // ====================== Variant CRUD ======================
    public ProductVariantDTO addVariantToProduct(Long productId, ProductVariantDTO variantDTO) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (variantDTO.getSku() == null || variantDTO.getSku().isBlank()) {
            throw new BadRequestException("SKU is required for variant.");
        }
        if (productVariantRepository.existsBySku(variantDTO.getSku())) {
            throw new BadRequestException("SKU '" + variantDTO.getSku() + "' already exists.");
        }

        ProductVariant variant = new ProductVariant();
        mapVariantDtoToEntity(variantDTO, variant);
        variant.setProduct(product);
        ProductVariant savedVariant = productVariantRepository.save(variant);

        if (product.getVariants() == null) {
            product.setVariants(new ArrayList<>());
        }
        product.getVariants().add(savedVariant);
        productRepository.save(product);

        return convertVariantToDTO(savedVariant);
    }

    public ProductVariantDTO updateVariant(Long productId, Long variantId, ProductVariantDTO variantDTO) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        ProductVariant existingVariant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found with id: " + variantId));

        if (!existingVariant.getProduct().getId().equals(product.getId())) {
            throw new BadRequestException("Variant does not belong to the specified product.");
        }

        if (variantDTO.getSku() == null || variantDTO.getSku().isBlank()) {
            throw new BadRequestException("SKU is required for variant.");
        }
        Optional<ProductVariant> bySku = productVariantRepository.findBySku(variantDTO.getSku());
        if (bySku.isPresent() && !bySku.get().getId().equals(variantId)) {
            throw new BadRequestException("SKU '" + variantDTO.getSku() + "' is already in use by another variant.");
        }

        mapVariantDtoToEntity(variantDTO, existingVariant);
        existingVariant.setProduct(product);

        ProductVariant saved = productVariantRepository.save(existingVariant);

        if (product.getVariants() == null) {
            product.setVariants(new ArrayList<>());
        }
        product.getVariants().removeIf(v -> v.getId().equals(saved.getId()));
        product.getVariants().add(saved);
        productRepository.save(product);

        return convertVariantToDTO(saved);
    }

    public void deleteVariant(Long productId, Long variantId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found with id: " + variantId));

        if (!variant.getProduct().getId().equals(product.getId())) {
            throw new BadRequestException("Variant does not belong to the specified product.");
        }

        if (product.getVariants() != null) {
            product.getVariants().removeIf(v -> v.getId().equals(variantId));
            productRepository.save(product);
        }

        productVariantRepository.delete(variant);
    }

    // ====================== Mappers ======================
    private void mapDtoToEntity(ProductDTO dto, Product product) {
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setImageUrl(dto.getImageUrl());
        product.setSpecifications(dto.getSpecifications());
        if (dto.getIsFeatured() != null) {
            product.setIsFeatured(dto.getIsFeatured());
        }
        // Lưu stockQuantity ở cấp product (dùng khi không có variant)
        if (dto.getStockQuantity() != null) {
            product.setStockQuantity(dto.getStockQuantity());
        }
        // Lưu availableSizes (các size có sẵn cho sản phẩm không có biến thể)
        product.setAvailableSizes(dto.getAvailableSizes());
        // [MỚI] Lưu giá theo size
        product.setSizePrices(dto.getSizePrices());
    }

    private void mapVariantDtoToEntity(ProductVariantDTO dto, ProductVariant entity) {
        entity.setColor(dto.getColor());
        entity.setColorImageUrl(dto.getColorImageUrl());
        entity.setProductSize(dto.getProductSize());
        entity.setSku(dto.getSku());
        entity.setStockQuantity(dto.getStockQuantity());
        entity.setPrice(
                dto.getPrice() != null && dto.getPrice().compareTo(BigDecimal.ZERO) > 0 ? dto.getPrice() : null);
        entity.setImageUrl(dto.getImageUrl());
    }

    public ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }
        dto.setImageUrl(product.getImageUrl());
        dto.setIsActive(product.getIsActive());
        dto.setAverageRating(product.getAverageRating());
        dto.setReviewCount(product.getReviewCount());
        dto.setSpecifications(product.getSpecifications());
        dto.setIsFeatured(product.getIsFeatured());
        dto.setViewCount(product.getViewCount());

        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            dto.setVariants(product.getVariants().stream().map(this::convertVariantToDTO).collect(Collectors.toList()));
            // Tính tổng tồn kho từ các biến thể
            dto.setStockQuantity(product.getVariants().stream().mapToInt(ProductVariant::getStockQuantity).sum());
        } else {
            dto.setVariants(new ArrayList<>());
            // Dùng stockQuantity của product khi không có biến thể
            dto.setStockQuantity(product.getStockQuantity() != null ? product.getStockQuantity() : 0);
        }
        // Các size có sẵn (cho sản phẩm không có biến thể)
        dto.setAvailableSizes(product.getAvailableSizes());
        // [MỚI] Giá theo size
        dto.setSizePrices(product.getSizePrices());
        return dto;
    }

    private ProductVariantDTO convertVariantToDTO(ProductVariant variant) {
        ProductVariantDTO dto = new ProductVariantDTO();
        dto.setId(variant.getId());
        dto.setProductId(variant.getProduct() != null ? variant.getProduct().getId() : null);
        dto.setColor(variant.getColor());
        dto.setColorImageUrl(variant.getColorImageUrl());
        dto.setProductSize(variant.getProductSize());
        dto.setSku(variant.getSku());
        dto.setStockQuantity(variant.getStockQuantity());
        dto.setPrice(variant.getPrice());
        dto.setImageUrl(variant.getImageUrl());
        return dto;
    }
}
