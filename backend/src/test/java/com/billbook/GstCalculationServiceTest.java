package com.billbook;

import com.billbook.dto.CreateInvoiceRequest;
import com.billbook.model.Invoice;
import com.billbook.model.InvoiceItem;
import com.billbook.model.SupplyType;
import com.billbook.service.GstCalculationService;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class GstCalculationServiceTest {
    private final GstCalculationService service = new GstCalculationService();

    @Test
    void intraStateSplitsCgstAndSgstEqually() {
        SupplyType type = service.determineSupplyType("Karnataka", "Karnataka");
        assertEquals(SupplyType.INTRA_STATE, type);

        CreateInvoiceRequest.LineItemInput input = new CreateInvoiceRequest.LineItemInput();
        input.setProductName("ThinkBook Laptop");
        input.setHsnCode("8471");
        input.setCategory("IT Hardware & Computing");
        input.setQuantity(2);
        input.setUnitPrice(new BigDecimal("50000.00"));
        input.setDiscountPercent(new BigDecimal("10.00"));
        input.setGstRate(18);

        Invoice invoice = new Invoice();
        InvoiceItem item = service.calculateLineItem(input, type, invoice);

        assertEquals(new BigDecimal("90000.00"), item.getTaxableValue());
        assertEquals(new BigDecimal("9.00"), item.getCgstRate());
        assertEquals(new BigDecimal("9.00"), item.getSgstRate());
        assertEquals(new BigDecimal("0.00"), item.getIgstRate());
        assertEquals(new BigDecimal("8100.00"), item.getCgstAmount());
        assertEquals(new BigDecimal("8100.00"), item.getSgstAmount());
        assertEquals(new BigDecimal("0.00"), item.getIgstAmount());
        assertEquals(new BigDecimal("16200.00"), item.getTotalTax());
        assertEquals(new BigDecimal("106200.00"), item.getLineTotal());
    }

    @Test
    void interStateAppliesIgstAndZeroCgstSgst() {
        SupplyType type = service.determineSupplyType("Karnataka", "Maharashtra");
        assertEquals(SupplyType.INTER_STATE, type);

        CreateInvoiceRequest.LineItemInput input = new CreateInvoiceRequest.LineItemInput();
        input.setProductName("1.5 Ton Split AC");
        input.setHsnCode("8415");
        input.setCategory("Air Conditioning & Luxury Appliances");
        input.setQuantity(1);
        input.setUnitPrice(new BigDecimal("41500.00"));
        input.setDiscountPercent(new BigDecimal("0.00"));
        input.setGstRate(28);

        Invoice invoice = new Invoice();
        InvoiceItem item = service.calculateLineItem(input, type, invoice);

        assertEquals(new BigDecimal("0.00"), item.getCgstRate());
        assertEquals(new BigDecimal("0.00"), item.getSgstRate());
        assertEquals(new BigDecimal("28.00"), item.getIgstRate());
        assertEquals(new BigDecimal("11620.00"), item.getIgstAmount());
        assertEquals(new BigDecimal("53120.00"), item.getLineTotal());
    }

    @Test
    void officialHalfUpRoundingRulesAreDeterministic() {
        // Test fractional paise and rupee round-off boundary: 100.50 -> 101.00, 100.49 -> 100.00
        CreateInvoiceRequest.LineItemInput input = new CreateInvoiceRequest.LineItemInput();
        input.setProductName("Fractional Tax Item");
        input.setHsnCode("4820");
        input.setCategory("Paper & Stationery");
        input.setQuantity(1);
        input.setUnitPrice(new BigDecimal("89.73"));
        input.setDiscountPercent(BigDecimal.ZERO);
        input.setGstRate(12); // 12% of 89.73 = 10.7676 -> CGST 5.38 + SGST 5.38 = 10.76; exact = 100.49

        Invoice inv = new Invoice();
        InvoiceItem item = service.calculateLineItem(input, SupplyType.INTRA_STATE, inv);
        service.populateInvoiceTotals(inv, List.of(item));

        assertEquals(new BigDecimal("5.38"), item.getCgstAmount());
        assertEquals(new BigDecimal("5.38"), item.getSgstAmount());
        assertEquals(new BigDecimal("100.00"), inv.getGrandTotal());
        assertEquals(new BigDecimal("-0.49"), inv.getRoundOff());
    }

    @Test
    void invalidGstSlabThrowsExplicitError() {
        CreateInvoiceRequest.LineItemInput bad = new CreateInvoiceRequest.LineItemInput();
        bad.setProductName("Invalid Tax Item");
        bad.setQuantity(1);
        bad.setUnitPrice(new BigDecimal("100.00"));
        bad.setGstRate(15);

        assertThrows(IllegalArgumentException.class,
                () -> service.calculateLineItem(bad, SupplyType.INTRA_STATE, new Invoice()));
    }

    @Test
    void verify50InvoiceCasesDeterministic100Percent() {
        int[] slabs = {0, 5, 12, 18, 28};
        BigDecimal hundred = new BigDecimal("100");
        BigDecimal two = new BigDecimal("2");

        for (int i = 0; i < 50; i++) {
            int rate = slabs[i % slabs.length];
            SupplyType type = (i % 2 == 0) ? SupplyType.INTRA_STATE : SupplyType.INTER_STATE;
            int qty = (i % 7) + 1;
            BigDecimal price = BigDecimal.valueOf(125.50 + i * 73.25).setScale(2, RoundingMode.HALF_UP);
            BigDecimal discPct = BigDecimal.valueOf((i % 4) * 5).setScale(2, RoundingMode.HALF_UP);

            CreateInvoiceRequest.LineItemInput input = new CreateInvoiceRequest.LineItemInput();
            input.setProductName("Benchmark Item " + (i + 1));
            input.setHsnCode("8471");
            input.setCategory("Benchmark");
            input.setQuantity(qty);
            input.setUnitPrice(price);
            input.setDiscountPercent(discPct);
            input.setGstRate(rate);

            Invoice inv = new Invoice();
            InvoiceItem item = service.calculateLineItem(input, type, inv);
            service.populateInvoiceTotals(inv, List.of(item));

            BigDecimal expectedGross = price.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal expectedDisc = expectedGross.multiply(discPct).divide(hundred, 2, RoundingMode.HALF_UP);
            BigDecimal expectedTaxable = expectedGross.subtract(expectedDisc).setScale(2, RoundingMode.HALF_UP);
            BigDecimal halfRate = BigDecimal.valueOf(rate).divide(two, 2, RoundingMode.HALF_UP);
            BigDecimal expectedCgst = type == SupplyType.INTRA_STATE
                    ? expectedTaxable.multiply(halfRate).divide(hundred, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO.setScale(2);
            BigDecimal expectedSgst = expectedCgst;
            BigDecimal expectedIgst = type == SupplyType.INTER_STATE
                    ? expectedTaxable.multiply(BigDecimal.valueOf(rate)).divide(hundred, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO.setScale(2);
            BigDecimal expectedTotalTax = expectedCgst.add(expectedSgst).add(expectedIgst).setScale(2, RoundingMode.HALF_UP);
            BigDecimal expectedGrand = expectedTaxable.add(expectedTotalTax).setScale(0, RoundingMode.HALF_UP).setScale(2, RoundingMode.HALF_UP);

            assertEquals(expectedTaxable, inv.getTaxableAmount(), "Taxable mismatch at case " + (i + 1));
            assertEquals(expectedCgst, inv.getCgstTotal(), "CGST mismatch at case " + (i + 1));
            assertEquals(expectedSgst, inv.getSgstTotal(), "SGST mismatch at case " + (i + 1));
            assertEquals(expectedIgst, inv.getIgstTotal(), "IGST mismatch at case " + (i + 1));
            assertEquals(expectedTotalTax, inv.getTotalTax(), "Total tax mismatch at case " + (i + 1));
            assertEquals(expectedGrand, inv.getGrandTotal(), "Grand total mismatch at case " + (i + 1));
        }
    }
}
