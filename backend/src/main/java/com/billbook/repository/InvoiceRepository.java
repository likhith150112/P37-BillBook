package com.billbook.repository;

import com.billbook.model.Invoice;
import com.billbook.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findAllByOrderByIssueDateDesc();
    List<Invoice> findByPaymentStatus(PaymentStatus status);
    List<Invoice> findByCustomerId(Long customerId);
}
