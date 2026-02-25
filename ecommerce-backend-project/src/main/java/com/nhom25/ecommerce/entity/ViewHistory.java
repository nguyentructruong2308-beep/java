package com.nhom25.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "view_history", indexes = {
        @Index(name = "idx_view_history_user", columnList = "user_id"),
        @Index(name = "idx_view_history_viewed_at", columnList = "viewedAt DESC")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ViewHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private LocalDateTime viewedAt;
}
