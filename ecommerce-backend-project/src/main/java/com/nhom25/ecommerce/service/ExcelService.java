package com.nhom25.ecommerce.service;

import com.nhom25.ecommerce.entity.Product;
import com.nhom25.ecommerce.entity.ProductVariant;
import com.nhom25.ecommerce.exception.BadRequestException;
import com.nhom25.ecommerce.exception.ResourceNotFoundException;

import com.nhom25.ecommerce.repository.ProductRepository;
import com.nhom25.ecommerce.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExcelService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    @Transactional
    public void importStockFromExcel(MultipartFile file) {
        if (!isExcelFile(file)) {
            throw new BadRequestException("Please upload an Excel file!");
        }

        try (InputStream inputStream = file.getInputStream();
                Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            int rowNumber = 0;
            List<String> errors = new ArrayList<>();

            while (rows.hasNext()) {
                Row currentRow = rows.next();

                // Skip header row
                if (rowNumber == 0) {
                    rowNumber++;
                    continue;
                }

                try {
                    processRow(currentRow);
                } catch (Exception e) {
                    errors.add("Row " + (rowNumber + 1) + ": " + e.getMessage());
                }

                rowNumber++;
            }

            if (!errors.isEmpty()) {
                throw new BadRequestException("Import completed with errors: " + String.join("; ", errors));
            }

        } catch (IOException e) {
            throw new RuntimeException("Fail to parse Excel file: " + e.getMessage());
        }
    }

    private void processRow(Row row) {
        // NEW FORMAT:
        // Column 0: Identifier (SKU Link or Product ID)
        // Column 1: Quantity

        Cell identifierCell = row.getCell(0);
        Cell quantityCell = row.getCell(1);

        String identifier = getStringCellValue(identifierCell);
        Integer quantity = getIntegerCellValue(quantityCell);

        if (identifier == null || quantity == null) {
            // Skip empty rows
            return;
        }

        if (quantity < 0) {
            throw new BadRequestException("Số lượng nhập kho không được âm (Mã: " + identifier + ")");
        }

        // 1. Prioritize finding by SKU (Variant)
        var variantOpt = productVariantRepository.findBySku(identifier);
        if (variantOpt.isPresent()) {
            ProductVariant variant = variantOpt.get();
            variant.setStockQuantity(variant.getStockQuantity() + quantity);
            productVariantRepository.save(variant);
            return;
        }

        // 2. Fallback to finding by ID (Simple Product)
        long productId; // primitive implicit, but effective final if only assigned once? No, it's
                        // assigned in try.

        // Refactoring to avoid effectively final issue: parse first, then use.
        try {
            productId = Long.parseLong(identifier);
        } catch (NumberFormatException e) {
            // Not a number, and not a found SKU -> Error
            throw new BadRequestException("Không tìm thấy sản phẩm hoặc biến thể nào với mã: " + identifier);
        }

        final Long finalProductId = productId; // Make it explicit final

        Product product = productRepository.findById(finalProductId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + finalProductId));

        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            throw new BadRequestException("Sản phẩm ID " + productId
                    + " có nhiều biến thể. Vui lòng nhập cụ thể mã SKU của từng biến thể (VD: "
                    + product.getVariants().get(0).getSku() + ")");
        }

        int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        product.setStockQuantity(currentStock + quantity);
        productRepository.save(product);
    }

    private String getStringCellValue(Cell cell) {
        if (cell == null)
            return null;
        try {
            switch (cell.getCellType()) {
                case STRING:
                    String value = cell.getStringCellValue().trim();
                    return value.isEmpty() ? null : value;
                case NUMERIC:
                    // Handle integers (1.0 -> "1")
                    double numVal = cell.getNumericCellValue();
                    if (numVal == (long) numVal) {
                        return String.valueOf((long) numVal);
                    }
                    return String.valueOf(numVal);
                case BOOLEAN:
                    return String.valueOf(cell.getBooleanCellValue());
                default:
                    return null;
            }
        } catch (Exception e) {
            return null;
        }
    }

    private Integer getIntegerCellValue(Cell cell) {
        if (cell == null)
            return null;
        try {
            switch (cell.getCellType()) {
                case NUMERIC:
                    return (int) cell.getNumericCellValue();
                case STRING:
                    String value = cell.getStringCellValue().trim();
                    return value.isEmpty() ? null : Integer.parseInt(value);
                default:
                    return null;
            }
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public java.io.ByteArrayInputStream exportProductStockToExcel() {
        try (Workbook workbook = new XSSFWorkbook();
                java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Stock Import Template");

            // Header Row
            Row headerRow = sheet.createRow(0);
            String[] columns = { "Mã (SKU hoặc ID)", "Số lượng nhập thêm", "Tên Sản phẩm (Tham khảo)",
                    "Phân loại (Tham khảo)", "Tồn kho hiện tại (Tham khảo)" };

            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data Rows
            int rowIdx = 1;
            List<Product> products = productRepository.findAll();

            for (Product product : products) {
                if (product.getVariants() != null && !product.getVariants().isEmpty()) {
                    // Has variants -> List each variant
                    for (ProductVariant variant : product.getVariants()) {
                        Row row = sheet.createRow(rowIdx++);
                        row.createCell(0).setCellValue(variant.getSku()); // SKU
                        row.createCell(1).setCellValue(""); // Empty for input
                        row.createCell(2).setCellValue(product.getName());
                        row.createCell(3).setCellValue(variant.getColor() + " - " + variant.getProductSize());
                        row.createCell(4).setCellValue(variant.getStockQuantity());
                    }
                } else {
                    // Simple product -> Use ID
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(String.valueOf(product.getId())); // ID
                    row.createCell(1).setCellValue(""); // Empty for input
                    row.createCell(2).setCellValue(product.getName());
                    row.createCell(3).setCellValue("Đơn thể");
                    row.createCell(4)
                            .setCellValue(product.getStockQuantity() != null ? product.getStockQuantity() : 0);
                }
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new java.io.ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Fail to import data to Excel file: " + e.getMessage());
        }
    }

    private boolean isExcelFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null
                && (contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                        || contentType.equals("application/vnd.ms-excel"));
    }
}
