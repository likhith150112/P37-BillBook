package com.billbook;

import com.billbook.dto.CategorySuggestionResponse;
import com.billbook.model.*;
import com.billbook.service.AnomalyDetectionService;
import com.billbook.service.AutoCategorisationService;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AnomalyAndCategorisationTest {
    private final AutoCategorisationService categorisationService = new AutoCategorisationService();
    private final AnomalyDetectionService anomalyService = new AnomalyDetectionService(categorisationService);

    @Test
    void categorisesLaptopAndPrinterToCorrectHsnAndAdvisoryFlag() {
        CategorySuggestionResponse laptop = categorisationService.suggest("ThinkBook Laptop", "Office computer");
        assertEquals("8471", laptop.hsnCode());
        assertEquals(18, laptop.suggestedGstRate());
        assertTrue(laptop.advisoryOnly());

        CategorySuggestionResponse rice = categorisationService.suggest("Basmati Rice 25kg", "");
        assertEquals("1006", rice.hsnCode());
        assertEquals(5, rice.suggestedGstRate());
    }

    @Test
    void detectsExcessiveDiscountAndGstMismatchAnomalies() {
        Invoice candidate = new Invoice();
        candidate.setCustomerId(1L);
        candidate.setIssueDate(LocalDate.of(2026, 11, 20));
        candidate.setGrandTotal(new BigDecimal("50000.00"));

        InvoiceItem badItem = new InvoiceItem();
        badItem.setProductName("ThinkBook Laptop");
        badItem.setHsnCode("8471");
        badItem.setQuantity(2);
        badItem.setUnitPrice(new BigDecimal("50000.00"));
        badItem.setDiscountPercent(new BigDecimal("40.00"));
        badItem.setGstRate(5); // Expected 18% for HSN 8471
        candidate.setItems(List.of(badItem));

        List<AnomalyAlert> alerts = anomalyService.evaluate(candidate, List.of(), List.of());
        assertTrue(alerts.stream().anyMatch(a -> "ANOM_EXCESS_DISCOUNT".equals(a.getRuleCode())));
        assertTrue(alerts.stream().anyMatch(a -> "ANOM_GST_HSN_MISMATCH".equals(a.getRuleCode())));
    }
}
