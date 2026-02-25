package com.nhom25.ecommerce.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.nhom25.ecommerce.security.JwtAuthenticationEntryPoint;
import com.nhom25.ecommerce.security.JwtAuthenticationFilter;

import org.springframework.http.HttpMethod;

import java.util.Arrays;
import java.util.List;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        @Bean
        public static PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
                return configuration.getAuthenticationManager();
        }

        @Bean
        SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .cors(withDefaults())
                                .csrf(AbstractHttpConfigurer::disable)
                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint(jwtAuthenticationEntryPoint))
                                .authorizeHttpRequests(auth -> auth
                                                // Public APIs
                                                .requestMatchers(
                                                                "/", // Đã thêm
                                                                "/favicon.ico", // Đã thêm
                                                                "/api/auth/**",
                                                                "/api/categories/**",
                                                                "/api/promotions/active",
                                                                "/api/reviews/product/**",
                                                                "/api/search/**",
                                                                "/api/chat/**",
                                                                "/api/view-history/**",
                                                                "/api/payments/vnpay_return",
                                                                "/api/payments/vnpay_ipn",
                                                                "/api/payments/momo_return",
                                                                "/api/payments/momo_ipn",
                                                                "/api/files/download/**",
                                                                "/uploads/**",
                                                                "/swagger-ui.html",
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**")
                                                .permitAll()
                                                // Product: chỉ GET là public
                                                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                                                // Topping: chỉ GET là public (cho AI chat)
                                                .requestMatchers(HttpMethod.GET, "/api/toppings/**").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                                                // Refund
                                                .requestMatchers(HttpMethod.POST, "/api/refunds").hasRole("CUSTOMER")
                                                .requestMatchers(HttpMethod.GET, "/api/refunds/me").hasRole("CUSTOMER")
                                                .requestMatchers(HttpMethod.PUT, "/api/refunds/{id}/status")
                                                .hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.GET, "/api/refunds").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.GET, "/api/refunds/{id}")
                                                .hasAnyRole("CUSTOMER", "ADMIN")
                                                // Payment [SỬA ĐỔI]
                                                .requestMatchers(HttpMethod.POST, "/api/payments/create")
                                                .hasRole("CUSTOMER") // <-- SỬA Ở ĐÂY
                                                .anyRequest().authenticated()

                                )
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

                http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                // Cần cho phép chính xác origin của frontend (bao gồm cả port 5173 và 5174)
                configuration.setAllowedOriginPatterns(Arrays.asList(
                                "http://localhost:5173",
                                "http://localhost:5174",
                                "http://127.0.0.1:5173",
                                "http://127.0.0.1:5174"));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With",
                                "Accept",
                                "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
                configuration.setExposedHeaders(
                                Arrays.asList("Authorization", "Access-Control-Allow-Origin",
                                                "Access-Control-Allow-Credentials"));
                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L); // Cache preflight response cho 1 giờ

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}