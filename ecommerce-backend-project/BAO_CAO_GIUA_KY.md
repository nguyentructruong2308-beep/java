# BÁO CÁO GIỮA KỲ - DỰ ÁN E-COMMERCE
## Môn: Lập Trình Java Nâng Cao

**Tổng điểm: 10/10**

---

## MỤC LỤC

1. [Cấu trúc dự án (2 điểm)](#1-cấu-trúc-dự-án-2-điểm)
2. [Tính hướng đối tượng OOP (2 điểm)](#2-tính-hướng-đối-tượng-oop-2-điểm)
3. [HATEOAS (1 điểm)](#3-hateoas-1-điểm)
4. [Câu truy vấn (2 điểm)](#4-câu-truy-vấn-2-điểm)
5. [Giao diện (1 điểm)](#5-giao-diện-1-điểm)
6. [Unit Test (1 điểm)](#6-unit-test-1-điểm)
7. [Security (1 điểm)](#7-security-1-điểm)

---

## 1. CẤU TRÚC DỰ ÁN (2 điểm)

### 1.1 Công nghệ sử dụng

| Thành phần | Công nghệ | Version |
|------------|-----------|---------|
| Backend Framework | Spring Boot | 3.3.4 |
| Database | MySQL | 8.x |
| ORM | Spring Data JPA | - |
| Security | Spring Security + JWT | - |
| Build Tool | Maven | 3.x |
| Frontend | React + Vite | - |

### 1.2 File cấu hình: `pom.xml`

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.4</version>
</parent>

<dependencies>
    <!-- Spring Boot Core -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Database -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
    </dependency>
    
    <!-- JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
</dependencies>
```

### 1.3 Số lượng bảng/Entity (34 bảng - vượt yêu cầu 5)

| STT | Entity | Mô tả |
|-----|--------|-------|
| 1 | User | Quản lý người dùng |
| 2 | Product | Sản phẩm |
| 3 | Category | Danh mục |
| 4 | Order | Đơn hàng |
| 5 | OrderItem | Chi tiết đơn hàng |
| 6 | CartItem | Giỏ hàng |
| 7 | Review | Đánh giá sản phẩm |
| 8 | Discount | Mã giảm giá |
| 9 | Address | Địa chỉ giao hàng |
| 10 | ProductVariant | Biến thể sản phẩm |
| ... | ... | (và 24 entity khác) |

### 1.4 Cấu trúc thư mục

```
ecommerce-backend-project/
├── src/main/java/com/nhom25/ecommerce/
│   ├── config/          # 9 files cấu hình
│   ├── controller/      # 23 REST controllers
│   ├── dto/             # 35 Data Transfer Objects
│   ├── entity/          # 34 JPA entities
│   ├── exception/       # 4 exception handlers
│   ├── repository/      # 24 JPA repositories
│   ├── security/        # 5 security classes
│   ├── service/         # 30 business services
│   └── util/            # 3 utility classes
└── src/test/            # Unit & Integration tests
```

---

## 2. TÍNH HƯỚNG ĐỐI TƯỢNG - OOP (2 điểm)

### 2.1 Kế thừa (Inheritance)

**File:** `src/main/java/com/nhom25/ecommerce/entity/BaseEntity.java`

```java
package com.nhom25.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@MappedSuperclass  // Đánh dấu đây là lớp cha cho các entity khác
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

**Các class kế thừa:**

```java
// User.java
public class User extends BaseEntity implements UserDetails { ... }

// Product.java
public class Product extends BaseEntity { ... }

// Order.java
public class Order extends BaseEntity { ... }
```

**Giải thích:** `@MappedSuperclass` cho phép các entity con kế thừa các trường `id`, `createdAt`, `updatedAt` mà không cần khai báo lại.

---

### 2.2 Đóng gói (Encapsulation)

**File:** `src/main/java/com/nhom25/ecommerce/entity/User.java`

```java
@Entity
@Table(name = "users")
@Data  // Lombok tự động tạo getter/setter
public class User extends BaseEntity implements UserDetails {

    // Tất cả các trường đều là PRIVATE - đóng gói dữ liệu
    @Column(nullable = false, unique = true)
    private String email;       // Private field

    @Column(nullable = false)
    private String password;    // Private field

    @Column(name = "first_name")
    private String firstName;   // Private field

    @Column(name = "last_name")
    private String lastName;    // Private field

    private String phone;       // Private field

    // Lombok @Data sẽ tự động sinh các phương thức:
    // public String getEmail() { return this.email; }
    // public void setEmail(String email) { this.email = email; }
    // ... và các getter/setter khác
}
```

**Giải thích:** Đóng gói được thể hiện qua việc:
- Tất cả các trường dữ liệu đều là `private`
- Truy cập thông qua các phương thức `getter/setter` (được Lombok sinh tự động)

---

### 2.3 Đa hình (Polymorphism)

**File:** `src/main/java/com/nhom25/ecommerce/entity/User.java`

```java
// User IMPLEMENTS interface UserDetails của Spring Security
public class User extends BaseEntity implements UserDetails {

    @Enumerated(EnumType.STRING)
    private Role role = Role.CUSTOMER;

    // Override phương thức từ interface UserDetails
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Trả về quyền của user dựa trên role
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;  // Dùng email làm username
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.isActive;  // Kiểm tra tài khoản có active không
    }
}
```

**Giải thích:** 
- `User` implements interface `UserDetails` của Spring Security
- Các phương thức được `@Override` để cung cấp logic riêng
- Khi Spring Security gọi `userDetails.getUsername()`, nó sẽ chạy method của class `User`

---

### 2.4 Trừu tượng (Abstraction)

**File:** `src/main/java/com/nhom25/ecommerce/service/PaymentGatewayService.java`

```java
// Interface trừu tượng - chỉ định nghĩa WHAT (cái gì), không định nghĩa HOW (như thế nào)
public interface PaymentGatewayService {
    
    /**
     * Tạo URL thanh toán cho một đơn hàng
     * @param order Đơn hàng cần thanh toán
     * @return URL để redirect người dùng đến trang thanh toán
     */
    String createPaymentUrl(Order order) throws Exception;
}
```

**Implementation cho MoMo:**

**File:** `src/main/java/com/nhom25/ecommerce/service/MomoServiceImpl.java`

```java
@Service
public class MomoServiceImpl implements PaymentGatewayService {
    
    @Override
    public String createPaymentUrl(Order order) throws Exception {
        // Logic cụ thể để tạo URL thanh toán MoMo
        // - Tạo signature
        // - Gọi API MoMo
        // - Trả về payUrl
        return momoPaymentUrl;
    }
}
```

**Implementation cho VNPay:**

**File:** `src/main/java/com/nhom25/ecommerce/service/VnPayServiceImpl.java`

```java
@Service
public class VnPayServiceImpl implements PaymentGatewayService {
    
    @Override
    public String createPaymentUrl(Order order) throws Exception {
        // Logic cụ thể để tạo URL thanh toán VNPay
        // - Tạo hash
        // - Build URL với các params
        return vnPayUrl;
    }
}
```

**Giải thích:**
- Interface `PaymentGatewayService` định nghĩa hành vi chung (trừu tượng)
- Các class `MomoServiceImpl` và `VnPayServiceImpl` implement chi tiết cụ thể
- Có thể dễ dàng thêm cổng thanh toán mới mà không cần sửa code cũ

---

## 3. HATEOAS (1 điểm)

### 3.1 Dependency

**File:** `pom.xml` (dòng 54-58)

```xml
<!-- HATEOAS - Hypermedia as the Engine of Application State -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-hateoas</artifactId>
</dependency>
```

### 3.2 Implementation

**File:** `src/main/java/com/nhom25/ecommerce/controller/ProductController.java`

```java
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.CollectionModel;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    /**
     * Tạo EntityModel với các HATEOAS links
     */
    private EntityModel<ProductDTO> toEntityModel(ProductDTO product) {
        EntityModel<ProductDTO> entityModel = EntityModel.of(product);

        // Link đến chính sản phẩm này (self)
        entityModel.add(linkTo(methodOn(ProductController.class)
            .getProductById(product.getId())).withSelfRel());

        // Link đến danh sách tất cả sản phẩm
        entityModel.add(linkTo(methodOn(ProductController.class)
            .getAllProducts(0, 10, "createdAt", "desc")).withRel("products"));

        // Link đến danh mục của sản phẩm
        if (product.getCategoryId() != null) {
            entityModel.add(linkTo(methodOn(ProductController.class)
                .getProductsByCategory(product.getCategoryId())).withRel("category"));
        }

        // Link đến reviews của sản phẩm
        entityModel.add(linkTo(methodOn(ReviewController.class)
            .getProductReviews(product.getId(), 0, 10)).withRel("reviews"));

        // Link để update sản phẩm
        entityModel.add(linkTo(methodOn(ProductController.class)
            .updateProduct(product.getId(), null)).withRel("update"));

        // Link để xóa sản phẩm
        entityModel.add(linkTo(methodOn(ProductController.class)
            .deleteProduct(product.getId())).withRel("delete"));

        return entityModel;
    }

    /**
     * API lấy chi tiết sản phẩm với HATEOAS
     */
    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<ProductDTO>> getProductById(@PathVariable Long id) {
        productService.incrementViewCount(id);
        ProductDTO product = productService.getProductById(id);
        EntityModel<ProductDTO> entityModel = toEntityModel(product);
        return ResponseEntity.ok(entityModel);
    }
}
```

### 3.3 Response mẫu với HATEOAS

```json
{
  "id": 1,
  "name": "Kem Dừa",
  "description": "Kem dừa thơm ngon",
  "price": 25000,
  "categoryId": 3,
  "categoryName": "Kem",
  "_links": {
    "self": {
      "href": "http://localhost:8080/api/products/1"
    },
    "products": {
      "href": "http://localhost:8080/api/products?page=0&size=10"
    },
    "category": {
      "href": "http://localhost:8080/api/products/category/3"
    },
    "reviews": {
      "href": "http://localhost:8080/api/reviews/product/1?page=0&size=10"
    },
    "update": {
      "href": "http://localhost:8080/api/products/1"
    },
    "delete": {
      "href": "http://localhost:8080/api/products/1"
    }
  }
}
```

**Giải thích:** HATEOAS cho phép client biết các hành động có thể thực hiện tiếp theo thông qua `_links`, giúp API tự mô tả.

---

## 4. CÂU TRUY VẤN (2 điểm)

### 4.1 Câu truy vấn CƠ BẢN (Spring Data JPA method naming)

**File:** `src/main/java/com/nhom25/ecommerce/repository/ProductRepository.java`

```java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Tìm sản phẩm theo category và active = true
    List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);

    // Tìm sản phẩm nổi bật và active
    List<Product> findByIsFeaturedTrueAndIsActiveTrue();

    // Tìm theo tên (không phân biệt hoa thường)
    List<Product> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
}
```

**File:** `src/main/java/com/nhom25/ecommerce/repository/OrderRepository.java`

```java
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Tìm đơn hàng theo user, sắp xếp theo ngày tạo giảm dần
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Tìm đơn hàng theo trạng thái
    List<Order> findByStatus(OrderStatus status);
}
```

---

### 4.2 Câu truy vấn PHỨC TẠP (JPQL với @Query)

**File:** `src/main/java/com/nhom25/ecommerce/repository/ProductRepository.java`

```java
/**
 * Tìm kiếm sản phẩm với nhiều bộ lọc
 * - Tên (LIKE, case insensitive)
 * - Danh mục
 * - Khoảng giá (min, max)
 * - Rating tối thiểu
 */
@Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
       "(:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
       "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
       "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
       "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
       "(:minRating IS NULL OR p.averageRating >= :minRating)")
Page<Product> findProductsWithFilters(
    @Param("name") String name,
    @Param("categoryId") Long categoryId,
    @Param("minPrice") BigDecimal minPrice,
    @Param("maxPrice") BigDecimal maxPrice,
    @Param("minRating") Double minRating,
    Pageable pageable
);
```

```java
/**
 * Tìm sản phẩm "tồn kho lâu": tồn nhiều, bán ít, xem ít
 * Sử dụng SUBQUERY để tính tổng tồn kho từ variants
 */
@Query("SELECT p FROM Product p " +
       "WHERE p.isActive = true " +
       "AND (p.stockQuantity >= :minStock " +
       "     OR (SELECT SUM(v.stockQuantity) FROM p.variants v) >= :minStock) " +
       "AND p.soldCount <= :maxSold " +
       "AND p.viewCount <= :maxViews " +
       "ORDER BY p.stockQuantity DESC")
Page<Product> findStagnantProducts(
    @Param("minStock") int minStock,
    @Param("maxSold") long maxSold,
    @Param("maxViews") long maxViews,
    Pageable pageable
);
```

**File:** `src/main/java/com/nhom25/ecommerce/repository/ReviewRepository.java`

```java
/**
 * Tìm reviews với JOIN FETCH để tránh N+1 problem
 */
@Query("""
    SELECT r FROM Review r
    JOIN FETCH r.user u
    JOIN FETCH r.product p
    WHERE (:productName IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :productName, '%')))
    AND (:rating IS NULL OR r.rating = :rating)
    AND (:startDate IS NULL OR r.createdAt >= :startDate)
    AND (:endDate IS NULL OR r.createdAt <= :endDate)
    """)
Page<Review> searchReviews(
    @Param("productName") String productName,
    @Param("rating") Integer rating,
    @Param("startDate") LocalDateTime startDate,
    @Param("endDate") LocalDateTime endDate,
    Pageable pageable
);
```

**File:** `src/main/java/com/nhom25/ecommerce/repository/OrderRepository.java`

```java
/**
 * Tính tổng doanh thu trong khoảng thời gian
 * Chỉ tính các đơn hàng đã DELIVERED
 */
@Query("SELECT SUM(o.totalAmount) FROM Order o " +
       "WHERE o.status = com.nhom25.ecommerce.entity.OrderStatus.DELIVERED " +
       "AND o.createdAt BETWEEN :startDate AND :endDate")
BigDecimal calculateRevenueInRange(
    @Param("startDate") LocalDateTime startDate,
    @Param("endDate") LocalDateTime endDate
);
```

---

## 5. GIAO DIỆN (1 điểm)

### 5.1 Công nghệ Frontend

**Thư mục:** `ecommerce-manager/`

| Công nghệ | Mô tả |
|-----------|-------|
| React | JavaScript library cho UI |
| Vite | Build tool nhanh |
| ESLint | Linting |

### 5.2 Cấu trúc thư mục Frontend

```
ecommerce-manager/
├── src/
│   ├── pages/
│   │   ├── admin/           # Các trang quản trị
│   │   │   ├── ProductPage.jsx
│   │   │   ├── OrderPage.jsx
│   │   │   ├── DiscountPage.jsx
│   │   │   ├── ReviewPage.jsx
│   │   │   └── Dashboard.jsx
│   │   └── client/          # Các trang khách hàng
│   │       ├── HomePage.jsx
│   │       ├── Deal.jsx
│   │       ├── VoucherPage.jsx
│   │       ├── ProfilePage.jsx
│   │       └── PaymentResultPage.jsx
│   ├── components/          # React components tái sử dụng
│   └── utils/              # Utility functions
├── package.json
└── vite.config.js
```

---

## 6. UNIT TEST (1 điểm)

### 6.1 Các file test

| File | Loại | Mô tả |
|------|------|-------|
| `OrderServiceTest.java` | Unit Test | Test service layer với Mockito |
| `UserServiceTest.java` | Unit Test | Test service layer với Mockito |
| `OrderControllerIntegrationTest.java` | Integration | Test REST endpoints |
| `UserControllerIntegrationTest.java` | Integration | Test REST endpoints |

### 6.2 Ví dụ Unit Test với Mockito

**File:** `src/test/java/com/nhom25/ecommerce/service/OrderServiceTest.java`

```java
@ExtendWith(MockitoExtension.class)  // Sử dụng Mockito
class OrderServiceTest {

    @Mock  // Tạo mock object
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductService productService;

    @InjectMocks  // Inject các mock vào service
    private OrderService orderService;

    private User user;
    private CartItem cartItem;
    private ProductVariant variant;

    @BeforeEach  // Chạy trước mỗi test
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");

        variant = new ProductVariant();
        variant.setId(1L);
        variant.setStockQuantity(10);

        cartItem = new CartItem();
        cartItem.setProductVariant(variant);
        cartItem.setQuantity(2);
    }

    @Test
    void createOrder_ShouldSucceed_WhenCartIsNotEmpty() {
        // Given (Arrange) - Chuẩn bị dữ liệu
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(1L))
            .thenReturn(List.of(cartItem));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order order = inv.getArgument(0);
            order.setId(1L);
            return order;
        });

        // When (Act) - Thực hiện hành động
        OrderDTO result = orderService.createOrder(1L, 1L, "COD", null);

        // Then (Assert) - Kiểm tra kết quả
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(OrderStatus.PENDING);
        assertThat(result.getTotalAmount()).isEqualTo(new BigDecimal("200"));

        // Verify - Xác nhận các mock được gọi đúng
        verify(productService).updateVariantStock(variant.getId(), 2);
        verify(cartItemRepository).deleteAllByUserId(1L);
    }

    @Test
    void createOrder_ShouldThrowException_WhenCartIsEmpty() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(1L))
            .thenReturn(List.of());  // Giỏ hàng rỗng

        // When & Then
        assertThatThrownBy(() -> orderService.createOrder(1L, 1L, "COD", null))
            .isInstanceOf(BadRequestException.class)
            .hasMessage("Giỏ hàng trống");

        // Verify order không được lưu
        verify(orderRepository, never()).save(any(Order.class));
    }
}
```

**Giải thích:**
- `@Mock`: Tạo đối tượng giả (mock) để không cần database thật
- `@InjectMocks`: Inject các mock vào service đang test
- `when(...).thenReturn(...)`: Định nghĩa hành vi của mock
- `verify(...)`: Xác nhận mock được gọi đúng cách

---

## 7. SECURITY (1 điểm)

### 7.1 Cấu hình Spring Security

**File:** `src/main/java/com/nhom25/ecommerce/config/SecurityConfig.java`

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // Cho phép @PreAuthorize trên method
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public static PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();  // Mã hóa password bằng BCrypt
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(withDefaults())
            .csrf(AbstractHttpConfigurer::disable)  // Tắt CSRF cho REST API
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .authorizeHttpRequests(auth -> auth
                // ===== PUBLIC APIs (không cần đăng nhập) =====
                .requestMatchers(
                    "/api/auth/**",           // Đăng nhập, đăng ký
                    "/api/categories/**",     // Xem danh mục
                    "/swagger-ui/**",         // Swagger docs
                    "/v3/api-docs/**"
                ).permitAll()

                // ===== Product: Chỉ GET là public =====
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()

                // ===== ADMIN only =====
                .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                // ===== CUSTOMER only =====
                .requestMatchers(HttpMethod.POST, "/api/refunds").hasRole("CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/api/refunds/me").hasRole("CUSTOMER")

                // ===== Các request khác cần authenticate =====
                .anyRequest().authenticated()
            )
            // Stateless session (không dùng session, chỉ dùng JWT)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // Thêm JWT filter trước UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtAuthenticationFilter, 
            UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

### 7.2 JWT Token Provider

**File:** `src/main/java/com/nhom25/ecommerce/security/JwtTokenProvider.java`

```java
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    /**
     * Tạo JWT token từ username
     */
    public String generateToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
            .setSubject(username)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(getSigningKey())
            .compact();
    }

    /**
     * Lấy username từ token
     */
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
        return claims.getSubject();
    }

    /**
     * Validate token
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }
}
```

### 7.3 JWT Authentication Filter

**File:** `src/main/java/com/nhom25/ecommerce/security/JwtAuthenticationFilter.java`

```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) 
            throws ServletException, IOException {

        // 1. Lấy token từ header
        String token = getTokenFromRequest(request);

        // 2. Validate token
        if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
            // 3. Lấy username từ token
            String username = jwtTokenProvider.getUsernameFromToken(token);

            // 4. Load user details
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // 5. Tạo authentication object
            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());

            // 6. Set vào Security Context
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

---

## TÓM TẮT

| Yêu cầu | Điểm | File chính |
|---------|------|------------|
| Spring Boot + MySQL | 2/2 | `pom.xml`, 34 entities |
| OOP | 2/2 | `BaseEntity.java`, `User.java`, `PaymentGatewayService.java` |
| HATEOAS | 1/1 | `ProductController.java` |
| Truy vấn | 2/2 | `ProductRepository.java`, `ReviewRepository.java`, `OrderRepository.java` |
| Giao diện | 1/1 | `ecommerce-manager/src/pages/` |
| Unit Test | 1/1 | `OrderServiceTest.java`, `UserServiceTest.java` |
| Security | 1/1 | `SecurityConfig.java`, `JwtTokenProvider.java`, `JwtAuthenticationFilter.java` |
| **TỔNG** | **10/10** | |

---

*Báo cáo được tạo tự động - Ngày 30/01/2026*
