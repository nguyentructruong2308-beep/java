package com.nhom25.ecommerce.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.nhom25.ecommerce.dto.ToppingDTO;
import com.nhom25.ecommerce.entity.Topping;
import com.nhom25.ecommerce.repository.ToppingRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ToppingService {

    private final ToppingRepository toppingRepository;

    public List<ToppingDTO> getAllActiveToppings() {
        return toppingRepository.findByIsActiveTrue()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ToppingDTO createTopping(ToppingDTO dto) {
        Topping topping = new Topping();
        topping.setName(dto.getName());
        topping.setPrice(dto.getPrice());
        topping.setImageUrl(dto.getImageUrl());

        return toDTO(toppingRepository.save(topping));
    }

    private ToppingDTO toDTO(Topping topping) {
        ToppingDTO dto = new ToppingDTO();
        dto.setId(topping.getId());
        dto.setName(topping.getName());
        dto.setPrice(topping.getPrice());
        dto.setImageUrl(topping.getImageUrl());
        return dto;
    }
}
