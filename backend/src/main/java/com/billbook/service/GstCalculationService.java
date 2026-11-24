package com.billbook.service;

import com.billbook.dto.CreateInvoiceRequest;
import com.billbook.model.Invoice;
import com.billbook.model.InvoiceItem;
import com.billbook.model.SupplyType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Set;

/**
 * Deterministic Indian GST Calculation Service.
 * Uses BigDecimal with HALF_UP rounding; never delegates tax math to probabilistic AI.
 */
@Service
public class GstCalculationService {
    private static final BigDecimal HUNDRED = new BigDecimal("100");
    private static final BigDecimal TWO = new BigDecimal("2");
    private static final Set<Integer> ALLOWED_GST_SLABS = Set.of(0, 5, 12, 18, 28);

    public SupplyType determineSupplyType(String sellerState, String customerState) {
        if (sellerState != null && customerState != null
                && sellerState.trim().equalsIgnoreCase(customerState.trim())) {
            return SupplyType.INTRA_STATE;
        }
        return SupplyType.INTER_STATE;
    }

    public InvoiceItem calculateLineItem(
            CreateInvoiceRequest.LineItemInput input,
            SupplyType supplyType,
            Invoice parentInvoice
    ) {
        if (input == null) {
            throw new IllegalArgumentException("Line item input cannot be null");
        }
        int rawRate = input.getGstRate() != null ? input.getGstRate() : 0;
        if (!ALLOWED_GST_SLABS.contains(rawRate)) {
            throw new IllegalArgumentException("Unsupported GST slab: " + rawRate + "%. Allowed slabs are 0, 5, 12, 18, 28.");
        }

        int safeQty = input.getQuantity() != null ? Math.max(0, input.getQuantity()) : 0;
        BigDecimal qty = BigDecimal.valueOf(safeQty);
        BigDecimal price = (input.getUnitPrice() != null ? input.getUnitPrice() : BigDecimal.ZERO)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal discPct = (input.getDiscountPercent() != null ? input.getDiscountPercent() : BigDecimal.ZERO)
                .max(BigDecimal.ZERO)
                .min(HUNDRED)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal gross = qty.multiply(price).setScale(2, RoundingMode.HALF_UP);
        BigDecimal discountAmount = gross.multiply(discPct)
                .divide(HUNDRED, 2, RoundingMode.HALF_UP);
        BigDecimal taxable = gross.subtract(discountAmount).setScale(2, RoundingMode.HALF_UP);

        BigDecimal rate = BigDecimal.valueOf(rawRate);
        BigDecimal cgstRate = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal sgstRate = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal igstRate = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        BigDecimal cgst = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal sgst = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal igst = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        if (supplyType == SupplyType.INTRA_STATE) {
            BigDecimal halfRate = rate.divide(TWO, 2, RoundingMode.HALF_UP);
            cgstRate = halfRate;
            sgstRate = halfRate;
            cgst = taxable.multiply(halfRate).divide(HUNDRED, 2, RoundingMode.HALF_UP);
            sgst = taxable.multiply(halfRate).divide(HUNDRED, 2, RoundingMode.HALF_UP);
        } else {
            igstRate = rate.setScale(2, RoundingMode.HALF_UP);
            igst = taxable.multiply(rate).divide(HUNDRED, 2, RoundingMode.HALF_UP);
        }

        BigDecimal totalTax = cgst.add(sgst).add(igst).setScale(2, RoundingMode.HALF_UP);
        BigDecimal lineTotal = taxable.add(totalTax).setScale(2, RoundingMode.HALF_UP);

        InvoiceItem item = new InvoiceItem();
        item.setInvoice(parentInvoice);
        item.setProductId(input.getProductId());
        item.setProductName(input.getProductName() != null ? input.getProductName() : "Line Item");
        item.setHsnCode(input.getHsnCode() != null ? input.getHsnCode() : "9999");
        item.setCategory(input.getCategory() != null ? input.getCategory() : "General Merchandise");
        item.setUnit(input.getUnit() != null ? input.getUnit() : "Nos");
        item.setQuantity(safeQty);
        item.setUnitPrice(price);
        item.setDiscountPercent(discPct);
        item.setGstRate(rawRate);
        item.setCgstRate(cgstRate);
        item.setSgstRate(sgstRate);
        item.setIgstRate(igstRate);
        item.setGrossAmount(gross);
        item.setDiscountAmount(discountAmount);
        item.setTaxableValue(taxable);
        item.setCgstAmount(cgst);
        item.setSgstAmount(sgst);
        item.setIgstAmount(igst);
        item.setTotalTax(totalTax);
        item.setLineTotal(lineTotal);
        return item;
    }

    public void populateInvoiceTotals(Invoice invoice, List<InvoiceItem> items) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal discount = BigDecimal.ZERO;
        BigDecimal taxable = BigDecimal.ZERO;
        BigDecimal cgst = BigDecimal.ZERO;
        BigDecimal sgst = BigDecimal.ZERO;
        BigDecimal igst = BigDecimal.ZERO;

        for (InvoiceItem item : items) {
            subtotal = subtotal.add(item.getGrossAmount());
            discount = discount.add(item.getDiscountAmount());
            taxable = taxable.add(item.getTaxableValue());
            cgst = cgst.add(item.getCgstAmount());
            sgst = sgst.add(item.getSgstAmount());
            igst = igst.add(item.getIgstAmount());
        }

        BigDecimal totalTax = cgst.add(sgst).add(igst).setScale(2, RoundingMode.HALF_UP);
        BigDecimal exactGrand = taxable.add(totalTax).setScale(2, RoundingMode.HALF_UP);
        BigDecimal roundedGrand = exactGrand.setScale(0, RoundingMode.HALF_UP).setScale(2, RoundingMode.HALF_UP);
        BigDecimal roundOff = roundedGrand.subtract(exactGrand).setScale(2, RoundingMode.HALF_UP);

        invoice.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
        invoice.setTotalDiscount(discount.setScale(2, RoundingMode.HALF_UP));
        invoice.setTaxableAmount(taxable.setScale(2, RoundingMode.HALF_UP));
        invoice.setCgstTotal(cgst.setScale(2, RoundingMode.HALF_UP));
        invoice.setSgstTotal(sgst.setScale(2, RoundingMode.HALF_UP));
        invoice.setIgstTotal(igst.setScale(2, RoundingMode.HALF_UP));
        invoice.setTotalTax(totalTax);
        invoice.setRoundOff(roundOff);
        invoice.setGrandTotal(roundedGrand);
    }
}
