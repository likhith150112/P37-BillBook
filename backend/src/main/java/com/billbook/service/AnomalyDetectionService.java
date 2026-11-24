package com.billbook.service;

import com.billbook.model.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnomalyDetectionService {
    private final AutoCategorisationService categorisationService;

    public AnomalyDetectionService(AutoCategorisationService categorisationService) {
        this.categorisationService = categorisationService;
    }

    public List<AnomalyAlert> evaluate(
            Invoice candidate,
            List<Invoice> historicalInvoices,
            List<Product> catalogProducts
    ) {
        List<AnomalyAlert> alerts = new ArrayList<>();

        // 1. Statistical Z-score check on invoice grand total
        List<Double> totals = historicalInvoices.stream()
                .filter(i -> candidate.getId() == null || !candidate.getId().equals(i.getId()))
                .map(i -> i.getGrandTotal().doubleValue())
                .filter(v -> v > 0)
                .toList();

        if (totals.size() >= 4) {
            double mean = totals.stream().mapToDouble(Double::doubleValue).average().orElse(0);
            double variance = totals.stream()
                    .mapToDouble(v -> (v - mean) * (v - mean))
                    .average().orElse(0);
            double std = Math.sqrt(variance);
            double candidateVal = candidate.getGrandTotal().doubleValue();
            double zScore = std > 0 ? (candidateVal - mean) / std : 0;

            if (zScore >= 2.0 || candidateVal >= mean * 2.75) {
                AnomalyAlert alert = new AnomalyAlert();
                alert.setInvoice(candidate);
                alert.setRuleCode("ANOM_ZSCORE_TOTAL");
                alert.setSeverity(zScore >= 3.0 ? AnomalySeverity.HIGH : AnomalySeverity.MEDIUM);
                alert.setTitle("Unusually High Invoice Total");
                alert.setExplanation(String.format(
                        "Grand total INR %.2f is %.2f standard deviations above historical average (INR %.2f).",
                        candidateVal, zScore, mean
                ));
                alert.setMetricValue(String.format("INR %.2f", candidateVal));
                alert.setBaselineValue(String.format("Mean INR %.2f", mean));
                alerts.add(alert);
            }
        }

        // 2. Line-level discount, quantity, and HSN-GST mismatch checks
        for (InvoiceItem item : candidate.getItems()) {
            if (item.getDiscountPercent().compareTo(new BigDecimal("25")) > 0) {
                AnomalyAlert alert = new AnomalyAlert();
                alert.setInvoice(candidate);
                alert.setRuleCode("ANOM_EXCESS_DISCOUNT");
                alert.setSeverity(item.getDiscountPercent().compareTo(new BigDecimal("45")) >= 0
                        ? AnomalySeverity.HIGH : AnomalySeverity.MEDIUM);
                alert.setTitle("Excessive Discount on " + item.getProductName());
                alert.setExplanation("Discount " + item.getDiscountPercent() + "% exceeds 25% standard commercial threshold.");
                alert.setMetricValue(item.getDiscountPercent() + "%");
                alert.setBaselineValue("<= 25%");
                alerts.add(alert);
            }

            if (item.getQuantity() >= 40) {
                AnomalyAlert alert = new AnomalyAlert();
                alert.setInvoice(candidate);
                alert.setRuleCode("ANOM_QTY_OUTLIER");
                alert.setSeverity(item.getQuantity() >= 100 ? AnomalySeverity.HIGH : AnomalySeverity.MEDIUM);
                alert.setTitle("Quantity Spike on " + item.getProductName());
                alert.setExplanation("Billed quantity (" + item.getQuantity() + ") is unusually high for a single line item.");
                alert.setMetricValue(String.valueOf(item.getQuantity()));
                alert.setBaselineValue("< 40 units");
                alerts.add(alert);
            }

            Integer expectedGst = categorisationService.expectedGstForHsn(item.getHsnCode());
            if (expectedGst != null && !expectedGst.equals(item.getGstRate())) {
                AnomalyAlert alert = new AnomalyAlert();
                alert.setInvoice(candidate);
                alert.setRuleCode("ANOM_GST_HSN_MISMATCH");
                alert.setSeverity(AnomalySeverity.HIGH);
                alert.setTitle("GST Rate Mismatch for HSN " + item.getHsnCode());
                alert.setExplanation("Item uses " + item.getGstRate() + "% GST, whereas HSN " + item.getHsnCode() + " maps to " + expectedGst + "%.");
                alert.setMetricValue(item.getGstRate() + "%");
                alert.setBaselineValue(expectedGst + "%");
                alerts.add(alert);
            }

            if (item.getProductId() != null) {
                catalogProducts.stream()
                        .filter(p -> p.getId().equals(item.getProductId()))
                        .findFirst()
                        .ifPresent(prod -> {
                            double listPrice = prod.getUnitPrice().doubleValue();
                            double billedPrice = item.getUnitPrice().doubleValue();
                            if (listPrice > 0 && (listPrice - billedPrice) / listPrice >= 0.4) {
                                AnomalyAlert alert = new AnomalyAlert();
                                alert.setInvoice(candidate);
                                alert.setRuleCode("ANOM_UNIT_PRICE_DROP");
                                alert.setSeverity(AnomalySeverity.MEDIUM);
                                alert.setTitle("Under-Priced Line Item " + item.getProductName());
                                alert.setExplanation(String.format("Unit price INR %.2f is >=40%% below catalog price INR %.2f.", billedPrice, listPrice));
                                alert.setMetricValue(String.format("INR %.2f", billedPrice));
                                alert.setBaselineValue(String.format("INR %.2f", listPrice));
                                alerts.add(alert);
                            }
                        });
            }
        }

        // 3. Duplicate invoice detection within 3 days
        for (Invoice prev : historicalInvoices) {
            if (!prev.getCustomerId().equals(candidate.getCustomerId())) continue;
            long dayDiff = Math.abs(ChronoUnit.DAYS.between(prev.getIssueDate(), candidate.getIssueDate()));
            double diffAmt = Math.abs(prev.getGrandTotal().subtract(candidate.getGrandTotal()).doubleValue());
            if (dayDiff <= 3 && diffAmt <= 1.0 && candidate.getGrandTotal().doubleValue() > 0) {
                AnomalyAlert alert = new AnomalyAlert();
                alert.setInvoice(candidate);
                alert.setRuleCode("ANOM_DUPLICATE_INVOICE");
                alert.setSeverity(AnomalySeverity.HIGH);
                alert.setTitle("Potential Duplicate Invoice");
                alert.setExplanation("Matches " + prev.getInvoiceNumber() + " (" + prev.getIssueDate() + ") for the same customer and grand total.");
                alert.setMetricValue(candidate.getGrandTotal().toString());
                alert.setBaselineValue(prev.getInvoiceNumber());
                alerts.add(alert);
                break;
            }
        }

        return alerts;
    }
}
