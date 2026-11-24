package com.billbook.controller;

import com.billbook.model.Customer;
import com.billbook.repository.CustomerRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    private final CustomerRepository customerRepository;

    public CustomerController(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @GetMapping
    public List<Customer> list(@RequestParam(required = false) String q) {
        if (q != null && !q.isBlank()) {
            return customerRepository
                    .findByNameContainingIgnoreCaseOrBusinessNameContainingIgnoreCaseOrCityContainingIgnoreCase(q, q, q);
        }
        return customerRepository.findAll();
    }

    @PostMapping
    public Customer create(@Valid @RequestBody Customer customer) {
        customer.setId(null);
        return customerRepository.save(customer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(@PathVariable Long id, @Valid @RequestBody Customer updated) {
        return customerRepository.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setBusinessName(updated.getBusinessName());
                    existing.setGstin(updated.getGstin());
                    existing.setEmail(updated.getEmail());
                    existing.setPhone(updated.getPhone());
                    existing.setAddress(updated.getAddress());
                    existing.setCity(updated.getCity());
                    existing.setState(updated.getState());
                    existing.setPincode(updated.getPincode());
                    return ResponseEntity.ok(customerRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!customerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        customerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
