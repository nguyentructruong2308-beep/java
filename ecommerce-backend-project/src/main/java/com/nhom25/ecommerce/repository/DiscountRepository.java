package com.nhom25.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nhom25.ecommerce.entity.Discount;

import java.util.Optional;
import java.util.List;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, Long> {

    Optional<Discount> findByCode(String code);

    Optional<Discount> findByCodeAndIsActiveTrue(String code);

    List<Discount> findByIsActiveTrue();

    boolean existsByCode(String code);
}