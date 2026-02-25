package com.nhom25.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nhom25.ecommerce.entity.Topping;

import java.util.List;

public interface ToppingRepository extends JpaRepository<Topping, Long> {

    List<Topping> findByIsActiveTrue();
}
