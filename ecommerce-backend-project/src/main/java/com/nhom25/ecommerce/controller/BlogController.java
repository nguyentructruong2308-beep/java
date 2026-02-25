package com.nhom25.ecommerce.controller;

import com.nhom25.ecommerce.dto.BlogDTO;
import com.nhom25.ecommerce.service.BlogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BlogController {

    private final BlogService blogService;

    // Public: List published blogs
    @GetMapping
    public ResponseEntity<Page<BlogDTO>> getAllPublishedBlogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(blogService.getAllBlogs(pageable, true));
    }

    // Public: View single blog
    @GetMapping("/{id}")
    public ResponseEntity<BlogDTO> getBlogById(@PathVariable Long id) {
        return ResponseEntity.ok(blogService.getBlogById(id));
    }

    // Admin: List all blogs
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<BlogDTO>> getAllBlogsAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(blogService.getAllBlogs(pageable, false));
    }

    // Admin: Create blog
    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BlogDTO> createBlog(
            @ModelAttribute BlogDTO dto,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        return new ResponseEntity<>(blogService.createBlog(dto, image), HttpStatus.CREATED);
    }

    // Admin: Update blog
    @PutMapping(value = "/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BlogDTO> updateBlog(
            @PathVariable Long id,
            @ModelAttribute BlogDTO dto,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(blogService.updateBlog(id, dto, image));
    }

    // Admin: Delete blog
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBlog(@PathVariable Long id) {
        blogService.deleteBlog(id);
        return ResponseEntity.noContent().build();
    }
}
