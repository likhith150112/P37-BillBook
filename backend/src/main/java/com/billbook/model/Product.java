package com.billbook.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 48)
    private String sku;

    @NotBlank
    @Column(nullable = false, length = 180)
    private String name;

    @Column(length = 300)
    private String description;

    @NotBlank
    @Column(name = "hsn_code", nullable = false, length = 16)
    private String hsnCode;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String category;

    @NotNull
    @Positive
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @NotNull
    @Column(name = "gst_rate", nullable = false)
    private Integer gstRate;

    @Column(nullable = false, length = 24)
    private String unit = "Nos";

    @Column(name = "stock_qty", nullable = false)
    private Integer stockQty = 0;

    @Column(name = "auto_categorised", nullable = false)
    private Boolean autoCategorised = false;

    @Column(name = "categorisation_rule", length = 255)
    private String categorisationRule;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getHsnCode() { return hsnCode; }
    public void setHsnCode(String hsnCode) { this.hsnCode = hsnCode; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public Integer getGstRate() { return gstRate; }
    public void setGstRate(Integer gstRate) { this.gstRate = gstRate; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public Integer getStockQty() { return stockQty; }
    public void setStockQty(Integer stockQty) { this.stockQty = stockQty; }
    public Boolean getAutoCategorised() { return autoCategorised; }
    public void setAutoCategorised(Boolean autoCategorised) { this.autoCategorised = autoCategorised; }
    public String getCategorisationRule() { return categorisationRule; }
    public void setCategorisationRule(String categorisationRule) { this.categorisationRule = categorisationRule; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
