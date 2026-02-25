package com.nhom25.ecommerce.security;

import com.nhom25.ecommerce.dto.UserDTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String refreshToken;
    private UserDTO user;

    public JwtResponse(String accessToken, String refreshToken, UserDTO user) {
        this.token = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
    }

}