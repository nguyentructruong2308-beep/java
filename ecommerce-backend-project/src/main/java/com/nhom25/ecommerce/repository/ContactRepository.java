package com.nhom25.ecommerce.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.nhom25.ecommerce.entity.Contact;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    Page<Contact> findByIsReadFalse(Pageable pageable);
}
