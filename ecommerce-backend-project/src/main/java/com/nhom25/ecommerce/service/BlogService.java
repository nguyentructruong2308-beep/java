package com.nhom25.ecommerce.service;

import com.nhom25.ecommerce.dto.BlogDTO;
import com.nhom25.ecommerce.entity.Blog;
import com.nhom25.ecommerce.exception.ResourceNotFoundException;
import com.nhom25.ecommerce.repository.BlogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional
public class BlogService {

    private final BlogRepository blogRepository;
    private final FileStorageService fileStorageService;

    public Page<BlogDTO> getAllBlogs(Pageable pageable, boolean onlyPublished) {
        Page<Blog> blogs = onlyPublished ? blogRepository.findByPublishedTrue(pageable)
                : blogRepository.findAll(pageable);
        return blogs.map(this::convertToDTO);
    }

    public BlogDTO getBlogById(Long id) {
        Blog blog = blogRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Blog not found"));
        return convertToDTO(blog);
    }

    public BlogDTO createBlog(BlogDTO dto, MultipartFile imageFile) {
        Blog blog = new Blog();
        updateBlogFromDTO(blog, dto);

        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = fileStorageService.storeFile(imageFile);
            blog.setImageUrl(fileName);
        }

        return convertToDTO(blogRepository.save(blog));
    }

    public BlogDTO updateBlog(Long id, BlogDTO dto, MultipartFile imageFile) {
        Blog blog = blogRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Blog not found"));
        updateBlogFromDTO(blog, dto);

        if (imageFile != null && !imageFile.isEmpty()) {
            if (blog.getImageUrl() != null) {
                fileStorageService.deleteFile(blog.getImageUrl());
            }
            String fileName = fileStorageService.storeFile(imageFile);
            blog.setImageUrl(fileName);
        }

        return convertToDTO(blogRepository.save(blog));
    }

    public void deleteBlog(Long id) {
        Blog blog = blogRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Blog not found"));
        if (blog.getImageUrl() != null) {
            fileStorageService.deleteFile(blog.getImageUrl());
        }
        blogRepository.delete(blog);
    }

    private void updateBlogFromDTO(Blog blog, BlogDTO dto) {
        blog.setTitle(dto.getTitle());
        blog.setContent(dto.getContent());
        blog.setExcerpt(dto.getExcerpt());
        blog.setAuthor(dto.getAuthor());
        blog.setCategory(dto.getCategory());
        blog.setPublished(dto.isPublished());
    }

    private BlogDTO convertToDTO(Blog blog) {
        BlogDTO dto = new BlogDTO();
        dto.setId(blog.getId());
        dto.setTitle(blog.getTitle());
        dto.setContent(blog.getContent());
        dto.setExcerpt(blog.getExcerpt());
        dto.setImageUrl(blog.getImageUrl());
        dto.setAuthor(blog.getAuthor());
        dto.setCategory(blog.getCategory());
        dto.setPublished(blog.isPublished());
        dto.setCreatedAt(blog.getCreatedAt());
        dto.setUpdatedAt(blog.getUpdatedAt());
        return dto;
    }
}
