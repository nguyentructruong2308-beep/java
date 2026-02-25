package com.nhom25.ecommerce.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class StatisticsDTO {
    private Long totalUsers;
    private Long totalProducts;
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private Map<String, Long> ordersByStatus;

    // Advanced metrics
    private Double revenueGrowth;
    private Double orderGrowth;

    // Trends
    private Map<String, BigDecimal> revenueTrend;
    private Map<String, Long> orderTrend;

    // Top lists
    private List<TopProductDTO> topSellingProducts;
    private Map<String, BigDecimal> revenueByCategory;

    // Low stock alerts
    private List<LowStockDTO> lowStockItems;
}
