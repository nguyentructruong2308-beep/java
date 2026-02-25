package com.nhom25.ecommerce.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.nhom25.ecommerce.dto.ForgotPasswordRequest;
import com.nhom25.ecommerce.dto.LoginRequest;
import com.nhom25.ecommerce.dto.PasswordResetRequest;
import com.nhom25.ecommerce.dto.RegisterRequest;
import com.nhom25.ecommerce.dto.UserDTO;
import com.nhom25.ecommerce.security.JwtResponse;
import com.nhom25.ecommerce.security.JwtTokenProvider;
import com.nhom25.ecommerce.service.TokenBlocklistService;
import com.nhom25.ecommerce.service.UserService;
import com.nhom25.ecommerce.service.RefreshTokenService;
import com.nhom25.ecommerce.entity.RefreshToken;
import com.nhom25.ecommerce.dto.TokenRefreshRequest;
import com.nhom25.ecommerce.exception.BadRequestException;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;

    // [MỚI] Inject
    private final TokenBlocklistService tokenBlocklistService;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@Valid @RequestBody RegisterRequest request) {
        UserDTO user = userService.createUser(request);
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = tokenProvider.generateToken(userDetails);

        UserDTO user = userService.getUserByEmail(request.getEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return ResponseEntity.ok(new JwtResponse(token, refreshToken.getToken(), user));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<JwtResponse> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = tokenProvider.generateToken(user);
                    return ResponseEntity
                            .ok(new JwtResponse(token, requestRefreshToken, userService.convertToDTO(user)));
                })
                .orElseThrow(() -> new BadRequestException("Refresh token is not in database!"));
    }

    // [MỚI] API Quên mật khẩu
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.createPasswordResetToken(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Password reset link has been sent to your email."));
    }

    // [MỚI] API Đặt lại mật khẩu
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        userService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password has been reset successfully."));
    }

    // [MỚI] API Đăng xuất
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        tokenBlocklistService.blockToken(authHeader);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully."));
    }
}