package com.nhom25.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "blogs")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Blog extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private String excerpt;

    @Column(name = "image_url")
    private String imageUrl;

    private String author;

    private String category;

    @Column(name = "is_published")
    private boolean published = true;
}
