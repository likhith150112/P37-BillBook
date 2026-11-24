package com.billbook.controller;

import com.billbook.model.Invoice;
import com.billbook.model.InvoiceItem;
import com.billbook.model.PaymentStatus;
import com.billbook.repository.CustomerRepository;
import com.billbook.repository.InvoiceRepository;
import com.billbook.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ReportController {
    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    @Value("${billbook.seller.state:Karnataka}")
    private String sellerState;

    @Value("${billbook.seller.gstin:29AABCA4821K1Z5}")
    private String sellerGstin;

    public ReportController(
            InvoiceRepository invoiceRepository,
            CustomerRepository customerRepository,
            ProductRepository productRepository
    ) {
        this.invoiceRepository = invoiceRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/reports/summary")
    @Transactional(readOnly = true)
    public Map<String, Object> summary() {
        List<Invoice> invoices = invoiceRepository.findAll();
        BigDecimal totalRevenue = invoices.stream().map(Invoice::getGrandTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal cgst = invoices.stream().map(Invoice::getCgstTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal sgst = invoices.stream().map(Invoice::getSgstTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal igst = invoices.stream().map(Invoice::getIgstTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal pending = invoices.stream()
                .filter(i -> i.getPaymentStatus() != PaymentStatus.PAID)
                .map(i -> i.getGrandTotal().subtract(i.getAmountPaid()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("invoiceCount", invoices.size());
        result.put("customerCount", customerRepository.count());
        result.put("productCount", productRepository.count());
        result.put("totalRevenue", totalRevenue);
        result.put("cgstTotal", cgst);
        result.put("sgstTotal", sgst);
        result.put("igstTotal", igst);
        result.put("totalGst", cgst.add(sgst).add(igst));
        result.put("pendingReceivables", pending);
        return result;
    }

    @GetMapping("/reports/hsn")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> hsnSummary() {
        List<Invoice> invoices = invoiceRepository.findAll();
        Map<String, Map<String, Object>> grouped = new LinkedHashMap<>();

        for (Invoice inv : invoices) {
            for (InvoiceItem item : inv.getItems()) {
                String key = item.getHsnCode() + "__" + item.getGstRate();
                Map<String, Object> row = grouped.get(key);
                if (row == null) {
                    row = new LinkedHashMap<>();
                    row.put("hsnCode", item.getHsnCode());
                    row.put("gstRate", item.getGstRate());
                    row.put("quantity", item.getQuantity());
                    row.put("taxableValue", item.getTaxableValue());
                    row.put("cgstAmount", item.getCgstAmount());
                    row.put("sgstAmount", item.getSgstAmount());
                    row.put("igstAmount", item.getIgstAmount());
                    row.put("totalTax", item.getTotalTax());
                    grouped.put(key, row);
                } else {
                    row.put("quantity", (Integer) row.get("quantity") + item.getQuantity());
                    row.put("taxableValue", ((BigDecimal) row.get("taxableValue")).add(item.getTaxableValue()));
                    row.put("cgstAmount", ((BigDecimal) row.get("cgstAmount")).add(item.getCgstAmount()));
                    row.put("sgstAmount", ((BigDecimal) row.get("sgstAmount")).add(item.getSgstAmount()));
                    row.put("igstAmount", ((BigDecimal) row.get("igstAmount")).add(item.getIgstAmount()));
                    row.put("totalTax", ((BigDecimal) row.get("totalTax")).add(item.getTotalTax()));
                }
            }
        }

        return grouped.values().stream()
                .sorted((a, b) -> ((BigDecimal) b.get("taxableValue")).compareTo((BigDecimal) a.get("taxableValue")))
                .toList();
    }

    @GetMapping("/config/seller")
    public Map<String, String> sellerConfig() {
        Map<String, String> seller = new LinkedHashMap<>();
        seller.put("businessName", "Apex Meridian Enterprises Pvt. Ltd.");
        seller.put("gstin", sellerGstin);
        seller.put("state", sellerState);
        seller.put("stateCode", sellerGstin != null && sellerGstin.length() >= 2 ? sellerGstin.substring(0, 2) : "29");
        return seller;
    }
}
