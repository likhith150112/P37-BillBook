package com.billbook.service;

import com.billbook.dto.CreateInvoiceRequest;
import com.billbook.model.*;
import com.billbook.repository.AuditLogRepository;
import com.billbook.repository.CustomerRepository;
import com.billbook.repository.InvoiceRepository;
import com.billbook.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class InvoiceService {
    private static final DateTimeFormatter LOG_TS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final AuditLogRepository auditLogRepository;
    private final GstCalculationService gstService;
    private final AnomalyDetectionService anomalyService;

    @Value("${billbook.seller.state:Karnataka}")
    private String sellerState;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            AuditLogRepository auditLogRepository,
            GstCalculationService gstService,
            AnomalyDetectionService anomalyService
    ) {
        this.invoiceRepository = invoiceRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.auditLogRepository = auditLogRepository;
        this.gstService = gstService;
        this.anomalyService = anomalyService;
    }

    @Transactional(readOnly = true)
    public List<Invoice> getAllInvoices() {
        List<Invoice> list = invoiceRepository.findAllByOrderByIssueDateDesc();
        list.forEach(inv -> {
            inv.getItems().size();
            inv.getAnomalies().size();
        });
        return list;
    }

    @Transactional(readOnly = true)
    public Invoice getInvoiceById(Long id) {
        Invoice inv = invoiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + id));
        inv.getItems().size();
        inv.getAnomalies().size();
        return inv;
    }

    @Transactional(readOnly = true)
    public List<AnomalyAlert> checkAnomalies(CreateInvoiceRequest req) {
        Invoice candidate = buildCandidateInvoice(req);
        return anomalyService.evaluate(
                candidate,
                invoiceRepository.findAll(),
                productRepository.findAll()
        );
    }

    @Transactional
    public Invoice createInvoice(CreateInvoiceRequest req) {
        Invoice invoice = buildCandidateInvoice(req);

        if (req.getPaymentStatus() == PaymentStatus.PAID) {
            invoice.setPaymentStatus(PaymentStatus.PAID);
            invoice.setAmountPaid(invoice.getGrandTotal());
        } else {
            invoice.setPaymentStatus(req.getPaymentStatus() != null ? req.getPaymentStatus() : PaymentStatus.PENDING);
            invoice.setAmountPaid(BigDecimal.ZERO);
        }

        List<AnomalyAlert> alerts = anomalyService.evaluate(
                invoice,
                invoiceRepository.findAll(),
                productRepository.findAll()
        );
        for (AnomalyAlert alert : alerts) {
            alert.setReviewed(req.isAnomalyConfirmed());
            if (req.isAnomalyConfirmed()) {
                alert.setReviewerNote("Confirmed by accountant during invoice issuance");
            }
        }
        invoice.setAnomalies(alerts);

        Invoice saved = invoiceRepository.save(invoice);
        recordAudit(
                "INVOICE_CREATED",
                saved.getInvoiceNumber(),
                "Accountant (MySQL)",
                "Issued " + saved.getSupplyType() + " invoice for " + saved.getCustomerName()
                        + " (" + saved.getItems().size() + " items, INR " + saved.getGrandTotal() + ")."
        );
        return saved;
    }

    @Transactional
    public Invoice recordPayment(Long invoiceId, BigDecimal newAmountPaid) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + invoiceId));
        BigDecimal amount = newAmountPaid != null ? newAmountPaid : BigDecimal.ZERO;
        BigDecimal clamped = amount.max(BigDecimal.ZERO).min(invoice.getGrandTotal());
        invoice.setAmountPaid(clamped);
        if (clamped.compareTo(invoice.getGrandTotal()) >= 0) {
            invoice.setPaymentStatus(PaymentStatus.PAID);
        } else if (clamped.compareTo(BigDecimal.ZERO) > 0) {
            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
        }
        Invoice saved = invoiceRepository.save(invoice);
        recordAudit(
                "PAYMENT_RECORDED",
                saved.getInvoiceNumber(),
                "Accountant (MySQL)",
                "Updated amount paid to INR " + saved.getAmountPaid() + " (" + saved.getPaymentStatus() + ")."
        );
        return saved;
    }

    @Transactional
    public Invoice reviewAnomalies(Long invoiceId, String reviewerNote) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + invoiceId));
        String note = (reviewerNote != null && !reviewerNote.isBlank())
                ? reviewerNote.trim()
                : "Reviewed and verified by accountant";

        for (AnomalyAlert alert : invoice.getAnomalies()) {
            alert.setReviewed(true);
            alert.setReviewerNote(note);
        }
        Invoice saved = invoiceRepository.save(invoice);
        recordAudit(
                "ANOMALY_REVIEWED",
                saved.getInvoiceNumber(),
                "Accountant (MySQL)",
                note
        );
        return saved;
    }

    private Invoice buildCandidateInvoice(CreateInvoiceRequest req) {
        Customer customer = customerRepository.findById(req.getCustomerId())
                .orElseThrow(() -> new EntityNotFoundException("Customer not found: " + req.getCustomerId()));

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(
                req.getInvoiceNumber() != null && !req.getInvoiceNumber().isBlank()
                        ? req.getInvoiceNumber().trim()
                        : "BB-" + LocalDate.now().getYear() + "-" + (System.currentTimeMillis() % 100000)
        );
        invoice.setIssueDate(req.getIssueDate() != null ? req.getIssueDate() : LocalDate.now());
        invoice.setDueDate(req.getDueDate() != null ? req.getDueDate() : invoice.getIssueDate().plusDays(15));
        invoice.setCustomerId(customer.getId());
        invoice.setCustomerName(customer.getBusinessName() != null && !customer.getBusinessName().isBlank()
                ? customer.getBusinessName() : customer.getName());
        invoice.setCustomerGstin(customer.getGstin());
        invoice.setCustomerState(customer.getState());
        String addr = customer.getAddress() != null ? customer.getAddress() : "";
        String pin = customer.getPincode() != null && !customer.getPincode().isBlank() ? " - " + customer.getPincode() : "";
        invoice.setCustomerAddress((addr.isBlank() ? "" : addr + ", ") + customer.getCity() + pin);
        invoice.setNotes(req.getNotes());

        SupplyType supplyType = gstService.determineSupplyType(sellerState, customer.getState());
        invoice.setSupplyType(supplyType);

        List<InvoiceItem> calculatedItems = new ArrayList<>();
        for (CreateInvoiceRequest.LineItemInput lineReq : req.getItems()) {
            calculatedItems.add(gstService.calculateLineItem(lineReq, supplyType, invoice));
        }
        invoice.setItems(calculatedItems);
        gstService.populateInvoiceTotals(invoice, calculatedItems);
        return invoice;
    }

    private void recordAudit(String action, String entityRef, String actor, String details) {
        AuditLog log = new AuditLog();
        log.setTimestamp(LocalDateTime.now().format(LOG_TS));
        log.setAction(action);
        log.setEntityRef(entityRef);
        log.setActor(actor);
        log.setDetails(details);
        auditLogRepository.save(log);
    }
}
