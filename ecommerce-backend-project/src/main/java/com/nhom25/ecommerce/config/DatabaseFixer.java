package com.nhom25.ecommerce.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting DEEP database constraints fix (v3 - Nullability & Auditing)...");

        String[] tables = {
                "users", "addresses", "categories", "products", "product_variants",
                "toppings", "cart_items", "cart_item_toppings", "orders",
                "order_items", "order_item_toppings", "payment_transactions",
                "discounts", "promotion_banners", "reviews", "refund_requests", "refund_items"
        };

        for (String table : tables) {
            fixTableAuditingColumns(table);
        }

        // Special fix for cart_items - allow simple products
        try {
            jdbcTemplate.execute("ALTER TABLE cart_items MODIFY product_variant_id BIGINT NULL");
            jdbcTemplate.execute("ALTER TABLE cart_items MODIFY product_id BIGINT NULL");
            log.info("Fixed cart_items nullability for simple products");
        } catch (Exception e) {
            log.debug("Skip cart_items nullability fix: {}", e.getMessage());
        }

        // Special fix for order_items - allow simple products
        try {
            jdbcTemplate.execute("ALTER TABLE order_items MODIFY product_variant_id BIGINT NULL");
            jdbcTemplate.execute("ALTER TABLE order_items MODIFY product_id BIGINT NULL");
            log.info("Fixed order_items nullability for simple products");
        } catch (Exception e) {
            log.debug("Skip order_items nullability fix: {}", e.getMessage());
        }

        log.info("Database deep fix v3 completed.");
    }

    private void fixTableAuditingColumns(String table) {
        // Fix for created_at
        try {
            jdbcTemplate.execute("ALTER TABLE " + table
                    + " ADD COLUMN created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
            log.info("Added missing created_at to table: {}", table);
        } catch (Exception e) {
            try {
                jdbcTemplate.execute("ALTER TABLE " + table
                        + " MODIFY created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
                log.info("Modified created_at for table: {}", table);
            } catch (Exception e2) {
                log.debug("Table {} skip created_at: {}", table, e2.getMessage());
            }
        }

        // Fix for updated_at
        try {
            jdbcTemplate.execute("ALTER TABLE " + table
                    + " ADD COLUMN updated_at TIMESTAMP(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)");
            log.info("Added missing updated_at to table: {}", table);
        } catch (Exception e) {
            try {
                jdbcTemplate.execute("ALTER TABLE " + table
                        + " MODIFY updated_at TIMESTAMP(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)");
                log.info("Modified updated_at for table: {}", table);
            } catch (Exception e2) {
                log.debug("Table {} skip updated_at: {}", table, e2.getMessage());
            }
        }
    }
}
