package com.billbook.selenium;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * End-to-end Selenium 4 browser tests for Project P37 — BillBook.
 * Run locally when BillBook is served at http://localhost:3000 (or BILLBOOK_URL env var).
 */
class BillBookSeleniumTest {
    private WebDriver driver;
    private BillBookPages pages;
    private final String baseUrl = System.getenv().getOrDefault("BILLBOOK_URL", "http://localhost:3000");

    @BeforeEach
    void setUp() {
        ChromeOptions options = new ChromeOptions();
        if (!"false".equalsIgnoreCase(System.getenv("SELENIUM_HEADLESS"))) {
            options.addArguments("--headless=new");
        }
        options.addArguments("--window-size=1440,900");
        driver = new ChromeDriver(options);
        pages = new BillBookPages(driver);
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    void customerCreationAndAutoCategorisationWorkInBrowser() {
        pages.open(baseUrl);
        String customerRow = pages.createCustomer(
                "Suresh Hegde",
                "Malnad Tech Traders",
                "29AABCM9988K1Z1",
                "+91 98450 55667",
                "Shivamogga",
                "Karnataka"
        );
        assertTrue(customerRow.contains("Malnad Tech Traders"));

        String suggestionText = pages.testAutoCategoriseProduct("HP LaserJet Duplex Printer");
        assertTrue(suggestionText.contains("8443"));
    }

    @Test
    void invoiceBuilderComputesGstFlagsExcessDiscountAndPasses50CaseBenchmark() {
        pages.open(baseUrl);
        String grandTotal = pages.createInvoiceAndReturnGrandTotal("Kaveri Systems", "2", "35");
        assertTrue(grandTotal.contains("₹"));

        String benchmarkText = pages.runMonitoringBenchmark();
        assertTrue(benchmarkText.contains("50 / 50"));
    }
}
