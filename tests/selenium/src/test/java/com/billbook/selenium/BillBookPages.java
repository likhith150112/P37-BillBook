package com.billbook.selenium;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

/**
 * Page Object Model encapsulating BillBook React screens (Module 4.4).
 */
public class BillBookPages {
    private final WebDriver driver;
    private final WebDriverWait wait;

    public BillBookPages(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(12));
    }

    public void open(String baseUrl) {
        driver.get(baseUrl);
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//h1[contains(., 'Business Dashboard')]")));
    }

    public void navigateTo(String navLabel) {
        WebElement navBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//nav[@aria-label='Primary']//button[contains(., '" + navLabel + "')]")));
        navBtn.click();
    }

    public String createCustomer(String contactName, String businessName, String gstin, String phone, String city, String state) {
        navigateTo("Customers");
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(., 'Add Customer')]"))).click();

        driver.findElement(By.xpath("//input[@placeholder='e.g. Rohan Verma']")).sendKeys(contactName);
        driver.findElement(By.xpath("//input[@placeholder='e.g. Verma Traders']")).sendKeys(businessName);
        driver.findElement(By.xpath("//input[@placeholder='29AABCV1234F1Z5']")).sendKeys(gstin);
        driver.findElement(By.xpath("//input[@placeholder='+91 98450 00000']")).sendKeys(phone);
        driver.findElement(By.xpath("//input[@placeholder='Bengaluru']")).sendKeys(city);
        new Select(driver.findElement(By.xpath("//form//select"))).selectByVisibleText(state);

        driver.findElement(By.xpath("//button[@type='submit' and contains(., 'Create Customer')]")).click();
        return wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//td[contains(., '" + businessName + "')]"))).getText();
    }

    public String testAutoCategoriseProduct(String productName) {
        navigateTo("Products & HSN");
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(., 'Add Product')]"))).click();
        driver.findElement(By.xpath("//input[@placeholder='e.g. HP LaserJet Pro Printer']")).sendKeys(productName);
        driver.findElement(By.xpath("//button[contains(., 'Auto-Categorise Item')]")).click();
        return wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//div[contains(., 'Advisory Categorisation')]"))).getText();
    }

    public String createInvoiceAndReturnGrandTotal(String customerSubstr, String qty, String discountPct) {
        navigateTo("Create Invoice");
        Select custSelect = new Select(wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//select[@aria-label='Select Customer']"))));
        for (WebElement opt : custSelect.getOptions()) {
            if (opt.getText().contains(customerSubstr)) {
                custSelect.selectByVisibleText(opt.getText());
                break;
            }
        }

        WebElement qtyInput = driver.findElement(By.xpath("//input[@aria-label='Quantity line 1']"));
        qtyInput.clear();
        qtyInput.sendKeys(qty);

        WebElement discInput = driver.findElement(By.xpath("//input[@aria-label='Discount percent line 1']"));
        discInput.clear();
        discInput.sendKeys(discountPct);

        String grandTotalText = driver.findElement(
                By.xpath("//dt[contains(., 'Grand Total')]/following-sibling::dd")).getText();

        // Confirm anomaly if triggered (e.g. >25% discount)
        var checkboxes = driver.findElements(By.xpath("//input[@type='checkbox']"));
        if (!checkboxes.isEmpty() && !checkboxes.get(0).isSelected()) {
            checkboxes.get(0).click();
        }

        driver.findElement(By.xpath("//button[contains(., 'Save & Issue Invoice')]")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//h1[contains(., 'Invoices & Payment Ledger')]")));
        return grandTotalText;
    }

    public String runMonitoringBenchmark() {
        navigateTo("Monitoring & QA");
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(., 'Run 50-Invoice GST Verification')]"))).click();
        return wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//div[contains(., '50 / 50 deterministic assertions passed')]"))).getText();
    }
}
