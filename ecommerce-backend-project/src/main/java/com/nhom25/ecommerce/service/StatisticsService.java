package com.nhom25.ecommerce.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nhom25.ecommerce.dto.LowStockDTO;
import com.nhom25.ecommerce.dto.StatisticsDTO;
import com.nhom25.ecommerce.dto.TopProductDTO;

import com.nhom25.ecommerce.entity.OrderStatus;
import com.nhom25.ecommerce.repository.OrderItemRepository;
import com.nhom25.ecommerce.repository.OrderRepository;
import com.nhom25.ecommerce.repository.ProductRepository;
import com.nhom25.ecommerce.repository.ProductVariantRepository;
import com.nhom25.ecommerce.repository.UserRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatisticsService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository productVariantRepository;

    public StatisticsDTO getStatistics() {
        StatisticsDTO stats = new StatisticsDTO();

        // 1. Basic counts
        stats.setTotalUsers(userRepository.count());
        stats.setTotalProducts(productRepository.count());
        stats.setTotalOrders(orderRepository.count());

        // 2. Revenue calculation (All time)
        BigDecimal totalRevenue = orderRepository.findAll().stream()
                .filter(order -> order.getStatus() == OrderStatus.DELIVERED)
                .map(order -> order.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalRevenue(totalRevenue);

        // 3. Orders by status (Simplified to Map<String, Long>)
        Map<String, Long> ordersByStatus = new HashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            long count = orderRepository.findByStatus(status).size();
            ordersByStatus.put(status.name(), count);
        }
        stats.setOrdersByStatus(ordersByStatus);

        // 4. GROWTH RATES (Compare last 30 days vs previous 30 days)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyDaysAgo = now.minusDays(30);
        LocalDateTime sixtyDaysAgo = now.minusDays(60);

        BigDecimal revenueThisMonth = orderRepository.calculateRevenueInRange(thirtyDaysAgo, now);
        BigDecimal revenueLastMonth = orderRepository.calculateRevenueInRange(sixtyDaysAgo, thirtyDaysAgo);

        if (revenueThisMonth == null)
            revenueThisMonth = BigDecimal.ZERO;
        if (revenueLastMonth == null || revenueLastMonth.compareTo(BigDecimal.ZERO) == 0) {
            stats.setRevenueGrowth(revenueThisMonth.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0);
        } else {
            double growth = (revenueThisMonth.subtract(revenueLastMonth))
                    .divide(revenueLastMonth, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
            stats.setRevenueGrowth(growth);
        }

        long ordersThisMonth = orderRepository.countOrdersInRange(thirtyDaysAgo, now);
        long ordersLastMonth = orderRepository.countOrdersInRange(sixtyDaysAgo, thirtyDaysAgo);
        if (ordersLastMonth == 0) {
            stats.setOrderGrowth(ordersThisMonth > 0 ? 100.0 : 0.0);
        } else {
            stats.setOrderGrowth(((double) (ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100);
        }

        // 5. TRENDS (Last 7 days)
        Map<String, BigDecimal> revenueTrend = new TreeMap<>();
        Map<String, Long> orderTrend = new TreeMap<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(LocalTime.MAX);

            BigDecimal dayRev = orderRepository.calculateRevenueInRange(start, end);
            long dayOrders = orderRepository.countOrdersInRange(start, end);

            revenueTrend.put(date.toString(), dayRev != null ? dayRev : BigDecimal.ZERO);
            orderTrend.put(date.toString(), dayOrders);
        }
        stats.setRevenueTrend(revenueTrend);
        stats.setOrderTrend(orderTrend);

        // 6. TOP LISTS
        List<Object[]> topItems = orderItemRepository.findTopSellingProducts(PageRequest.of(0, 5));
        List<TopProductDTO> topProducts = topItems.stream().map(obj -> {
            TopProductDTO dto = new TopProductDTO();
            dto.setProductId((Long) obj[0]);
            dto.setName((String) obj[1]);
            dto.setSalesCount((Long) obj[2]);
            dto.setTotalRevenue((BigDecimal) obj[3]);
            dto.setImageUrl((String) obj[4]);
            return dto;
        }).collect(Collectors.toList());
        stats.setTopSellingProducts(topProducts);

        // 7. CATEGORY REVENUE
        List<Object[]> catRevItems = orderItemRepository.findRevenueByCategory();
        Map<String, BigDecimal> revByCat = new HashMap<>();
        catRevItems.forEach(obj -> revByCat.put((String) obj[0], (BigDecimal) obj[1]));
        stats.setRevenueByCategory(revByCat);

        // 8. LOW STOCK ALERTS (Threshold: 10)
        List<LowStockDTO> lowStock = new ArrayList<>();

        // Products without variants
        productRepository.findByVariantsIsEmptyAndStockQuantityLessThan(10).forEach(p -> {
            LowStockDTO dto = new LowStockDTO();
            dto.setName(p.getName());
            dto.setVariantInfo("N/A");
            dto.setCurrentStock(p.getStockQuantity());
            dto.setProductId(p.getId());
            lowStock.add(dto);
        });

        // Product variants
        productVariantRepository.findByStockQuantityLessThan(10).forEach(v -> {
            LowStockDTO dto = new LowStockDTO();
            dto.setName(v.getProduct().getName());
            dto.setVariantInfo("Size: " + v.getProductSize() + ", Color: " + v.getColor());
            dto.setCurrentStock(v.getStockQuantity());
            dto.setProductId(v.getProduct().getId());
            lowStock.add(dto);
        });
        stats.setLowStockItems(lowStock);

        return stats;
    }

    public StatisticsDTO getMonthlyStatistics(int year, int month) {
        LocalDateTime startDate = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime endDate = startDate.plusMonths(1).minusSeconds(1);

        StatisticsDTO stats = new StatisticsDTO();

        var monthlyOrders = orderRepository.findOrdersByDateRange(startDate, endDate);
        stats.setTotalOrders((long) monthlyOrders.size());

        BigDecimal monthlyRevenue = monthlyOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.DELIVERED)
                .map(order -> order.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalRevenue(monthlyRevenue);

        return stats;
    }
}
