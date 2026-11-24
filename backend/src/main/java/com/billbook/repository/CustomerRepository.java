package com.billbook.repository;

import com.billbook.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByNameContainingIgnoreCaseOrBusinessNameContainingIgnoreCaseOrCityContainingIgnoreCase(
            String name, String businessName, String city
    );
}
