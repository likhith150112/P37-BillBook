package com.billbook.dto;

import com.billbook.model.PaymentStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class CreateInvoiceRequest {
    private String invoiceNumber;

    @NotNull
    private Long customerId;

    private LocalDate issueDate;
    private LocalDate dueDate;
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    private String notes;
    private boolean anomalyConfirmed;

    @NotEmpty
    @Valid
    private List<LineItemInput> items;

    public static class LineItemInput {
        private Long productId;
        private String productName;
        private String hsnCode;
        private String category;
        private String unit = "Nos";
        @NotNull
        private Integer quantity;
        @NotNull
        private BigDecimal unitPrice;
        private BigDecimal discountPercent = BigDecimal.ZERO;
        @NotNull
        private Integer gstRate;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public String getHsnCode() { return hsnCode; }
        public void setHsnCode(String hsnCode) { this.hsnCode = hsnCode; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
        public BigDecimal getDiscountPercent() { return discountPercent; }
        public void setDiscountPercent(BigDecimal discountPercent) { this.discountPercent = discountPercent; }
        public Integer getGstRate() { return gstRate; }
        public void setGstRate(Integer gstRate) { this.gstRate = gstRate; }
    }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public boolean isAnomalyConfirmed() { return anomalyConfirmed; }
    public void setAnomalyConfirmed(boolean anomalyConfirmed) { this.anomalyConfirmed = anomalyConfirmed; }
    public List<LineItemInput> getItems() { return items; }
    public void setItems(List<LineItemInput> items) { this.items = items; }
}
