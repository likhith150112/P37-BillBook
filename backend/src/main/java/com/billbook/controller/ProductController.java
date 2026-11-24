package com.billbook.controller;

import com.billbook.dto.CategorySuggestionResponse;
import com.billbook.model.Product;
import com.billbook.repository.ProductRepository;
import com.billbook.service.AutoCategorisationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository productRepository;
    private final AutoCategorisationService categorisationService;

    public ProductController(ProductRepository productRepository, AutoCategorisationService categorisationService) {
        this.productRepository = productRepository;
        this.categorisationService = categorisationService;
    }

    @GetMapping
    public List<Product> list(@RequestParam(required = false) String q) {
        if (q != null && !q.isBlank()) {
            return productRepository
                    .findByNameContainingIgnoreCaseOrHsnCodeContainingIgnoreCaseOrCategoryContainingIgnoreCase(q, q, q);
        }
        return productRepository.findAll();
    }

    @PostMapping("/suggest-category")
    public CategorySuggestionResponse suggestCategory(@RequestBody Map<String, String> payload) {
        return categorisationService.suggest(payload.get("name"), payload.get("description"));
    }

    @PostMapping
    public Product create(@Valid @RequestBody Product product) {
        product.setId(null);
        return productRepository.save(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @Valid @RequestBody Product updated) {
        return productRepository.findById(id)
                .map(existing -> {
                    existing.setSku(updated.getSku());
                    existing.setName(updated.getName());
                    existing.setDescription(updated.getDescription());
                    existing.setHsnCode(updated.getHsnCode());
                    existing.setCategory(updated.getCategory());
                    existing.setUnitPrice(updated.getUnitPrice());
                    existing.setGstRate(updated.getGstRate());
                    existing.setUnit(updated.getUnit());
                    existing.setStockQty(updated.getStockQty());
                    existing.setAutoCategorised(updated.getAutoCategorised());
                    existing.setCategorisationRule(updated.getCategorisationRule());
                    return ResponseEntity.ok(productRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
