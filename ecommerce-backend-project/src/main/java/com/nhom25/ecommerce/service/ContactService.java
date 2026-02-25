package com.nhom25.ecommerce.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.nhom25.ecommerce.dto.ContactDTO;
import com.nhom25.ecommerce.entity.Contact;
import com.nhom25.ecommerce.exception.ResourceNotFoundException;
import com.nhom25.ecommerce.repository.ContactRepository;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ContactService {

    private final ContactRepository contactRepository;

    public ContactDTO saveContact(ContactDTO dto) {
        Contact contact = new Contact();
        contact.setName(dto.getName());
        contact.setEmail(dto.getEmail());
        contact.setPhone(dto.getPhone());
        contact.setSubject(dto.getSubject());
        contact.setMessage(dto.getMessage());
        contact.setIsRead(false);
        return convertToDTO(contactRepository.save(contact));
    }

    @Transactional(readOnly = true)
    public Page<ContactDTO> getAllContacts(Pageable pageable) {
        return contactRepository.findAll(pageable).map(this::convertToDTO);
    }

    public void markAsRead(Long id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
        contact.setIsRead(true);
        contactRepository.save(contact);
    }

    public void deleteContact(Long id) {
        if (!contactRepository.existsById(id)) {
            throw new ResourceNotFoundException("Contact not found");
        }
        contactRepository.deleteById(id);
    }

    private ContactDTO convertToDTO(Contact contact) {
        ContactDTO dto = new ContactDTO();
        dto.setId(contact.getId());
        dto.setName(contact.getName());
        dto.setEmail(contact.getEmail());
        dto.setPhone(contact.getPhone());
        dto.setSubject(contact.getSubject());
        dto.setMessage(contact.getMessage());
        dto.setIsRead(contact.getIsRead());
        dto.setResponse(contact.getResponse());
        dto.setCreatedAt(contact.getCreatedAt());
        return dto;
    }
}
