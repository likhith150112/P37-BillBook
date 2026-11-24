package com.billbook.repository;

import com.billbook.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingIgnoreCaseOrHsnCodeContainingIgnoreCaseOrCategoryContainingIgnoreCase(
            String name, String hsnCode, String category
    );
}
