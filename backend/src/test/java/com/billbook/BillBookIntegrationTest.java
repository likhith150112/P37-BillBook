package com.billbook;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:billbook_test;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "billbook.seller.state=Karnataka"
})
class BillBookIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void fullBillingFlowFromCustomerAndProductToInvoicePaymentAndAnomalyReview() throws Exception {
        // 1. Create Customer (Karnataka -> INTRA_STATE)
        String custJson = """
                {
                  "name": "Rohan Kulkarni",
                  "businessName": "Malnad Compute Works",
                  "gstin": "29AABCM1234K1Z9",
                  "email": "billing@malnadcompute.example",
                  "phone": "+91 98451 22334",
                  "address": "12 Residency Road",
                  "city": "Bengaluru",
                  "state": "Karnataka",
                  "pincode": "560025"
                }
                """;
        MvcResult custRes = mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(custJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andReturn();
        long customerId = objectMapper.readTree(custRes.getResponse().getContentAsString()).get("id").asLong();

        // 2. Suggest Category (advisoryOnly must be true)
        mockMvc.perform(post("/api/products/suggest-category")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"ThinkBook Pro Laptop\",\"description\":\"Office computer\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hsnCode").value("8471"))
                .andExpect(jsonPath("$.suggestedGstRate").value(18))
                .andExpect(jsonPath("$.advisoryOnly").value(true));

        // 3. Create Product
        String prodJson = """
                {
                  "sku": "BB-INT-8471-01",
                  "name": "ThinkBook Pro Laptop",
                  "description": "Office computer",
                  "hsnCode": "8471",
                  "category": "IT Hardware & Computing",
                  "unitPrice": 50000.00,
                  "gstRate": 18,
                  "unit": "Nos",
                  "stockQty": 15,
                  "autoCategorised": true
                }
                """;
        MvcResult prodRes = mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(prodJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andReturn();
        long productId = objectMapper.readTree(prodRes.getResponse().getContentAsString()).get("id").asLong();

        // 4. Create Invoice with excessive discount (35%) and GST mismatch (5% on HSN 8471)
        String invoiceReq = String.format("""
                {
                  "invoiceNumber": "BB-2026-9001",
                  "customerId": %d,
                  "paymentStatus": "PENDING",
                  "anomalyConfirmed": false,
                  "items": [
                    {
                      "productId": %d,
                      "productName": "ThinkBook Pro Laptop",
                      "hsnCode": "8471",
                      "category": "IT Hardware & Computing",
                      "unit": "Nos",
                      "quantity": 1,
                      "unitPrice": 50000.00,
                      "discountPercent": 35,
                      "gstRate": 5
                    }
                  ]
                }
                """, customerId, productId);

        MvcResult invRes = mockMvc.perform(post("/api/invoices")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invoiceReq))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.supplyType").value("INTRA_STATE"))
                .andExpect(jsonPath("$.taxableAmount").value(32500.00))
                .andExpect(jsonPath("$.cgstTotal").value(812.50))
                .andExpect(jsonPath("$.sgstTotal").value(812.50))
                .andExpect(jsonPath("$.grandTotal").value(34125.00))
                .andExpect(jsonPath("$.hasUnreviewedAnomalies").value(true))
                .andExpect(jsonPath("$.anomalies", hasSize(greaterThanOrEqualTo(2))))
                .andReturn();

        JsonNode invNode = objectMapper.readTree(invRes.getResponse().getContentAsString());
        long invoiceId = invNode.get("id").asLong();

        // 5. Fetch single invoice & review anomalies
        mockMvc.perform(get("/api/invoices/" + invoiceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.invoiceNumber").value("BB-2026-9001"));

        mockMvc.perform(patch("/api/invoices/" + invoiceId + "/anomalies/review")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reviewerNote\":\"Verified clearance sale order\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasUnreviewedAnomalies").value(false));

        // 6. Record Payment -> transitions to PAID
        mockMvc.perform(patch("/api/invoices/" + invoiceId + "/payment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amountPaid\": 34125.00}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentStatus").value("PAID"));

        // 7. Verify Reports, HSN Summary, Seller Config, and Audit Logs
        mockMvc.perform(get("/api/reports/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.invoiceCount").value(greaterThanOrEqualTo(1)));

        mockMvc.perform(get("/api/reports/hsn"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].hsnCode").value("8471"));

        mockMvc.perform(get("/api/config/seller"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.state").value("Karnataka"));

        mockMvc.perform(get("/api/audit-logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(3))));
    }

    @Test
    void returnsStructuredJson404ForMissingInvoice() throws Exception {
        mockMvc.perform(get("/api/invoices/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }
}
