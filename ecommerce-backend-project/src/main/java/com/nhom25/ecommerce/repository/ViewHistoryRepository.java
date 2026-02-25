package com.nhom25.ecommerce.repository;

import com.nhom25.ecommerce.entity.ViewHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ViewHistoryRepository extends JpaRepository<ViewHistory, Long> {

    /**
     * Lấy lịch sử xem sản phẩm của user, sắp xếp theo thời gian mới nhất
     */
    @Query("SELECT vh FROM ViewHistory vh WHERE vh.user.id = :userId ORDER BY vh.viewedAt DESC")
    List<ViewHistory> findByUserIdOrderByViewedAtDesc(@Param("userId") Long userId, Pageable pageable);

    /**
     * Tìm bản ghi xem sản phẩm cụ thể của user
     */
    Optional<ViewHistory> findByUserIdAndProductId(Long userId, Long productId);

    /**
     * Đếm số sản phẩm đã xem của user
     */
    long countByUserId(Long userId);

    /**
     * Lấy các bản ghi cũ nhất để xóa
     */
    @Query("SELECT vh FROM ViewHistory vh WHERE vh.user.id = :userId ORDER BY vh.viewedAt ASC")
    List<ViewHistory> findOldestByUserId(@Param("userId") Long userId, Pageable pageable);
}
