package com.billbook.controller;

import com.billbook.dto.CreateInvoiceRequest;
import com.billbook.model.AnomalyAlert;
import com.billbook.model.Invoice;
import com.billbook.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {
    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    public List<Invoice> list() {
        return invoiceService.getAllInvoices();
    }

    @GetMapping("/{id}")
    public Invoice getById(@PathVariable Long id) {
        return invoiceService.getInvoiceById(id);
    }

    @PostMapping("/check-anomalies")
    public List<AnomalyAlert> checkAnomalies(@Valid @RequestBody CreateInvoiceRequest request) {
        return invoiceService.checkAnomalies(request);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Invoice create(@Valid @RequestBody CreateInvoiceRequest request) {
        return invoiceService.createInvoice(request);
    }

    @PatchMapping("/{id}/payment")
    public Invoice recordPayment(@PathVariable Long id, @RequestBody Map<String, BigDecimal> body) {
        BigDecimal amountPaid = body.getOrDefault("amountPaid", BigDecimal.ZERO);
        return invoiceService.recordPayment(id, amountPaid);
    }

    @PatchMapping("/{id}/anomalies/review")
    public Invoice reviewAnomalies(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String note = body != null ? body.get("reviewerNote") : null;
        return invoiceService.reviewAnomalies(id, note);
    }
}
