-- BillBook (Project P37) — MySQL 8 Relational Schema
-- Synthetic demonstration schema for Customers, Products, Invoices, Line Items, Anomaly Alerts, and Audit Logs

CREATE DATABASE IF NOT EXISTS billbook_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE billbook_db;

CREATE TABLE IF NOT EXISTS customers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  business_name VARCHAR(160),
  gstin VARCHAR(15),
  email VARCHAR(160),
  phone VARCHAR(30) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(80) NOT NULL,
  state VARCHAR(80) NOT NULL,
  pincode VARCHAR(12),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_customers_state (state),
  INDEX idx_customers_gstin (gstin)
);

CREATE TABLE IF NOT EXISTS products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(48) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  description VARCHAR(300),
  hsn_code VARCHAR(16) NOT NULL,
  category VARCHAR(100) NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  gst_rate INT NOT NULL,
  unit VARCHAR(24) NOT NULL DEFAULT 'Nos',
  stock_qty INT NOT NULL DEFAULT 0,
  auto_categorised BOOLEAN NOT NULL DEFAULT FALSE,
  categorisation_rule VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_products_hsn (hsn_code),
  INDEX idx_products_category (category)
);

CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(40) NOT NULL UNIQUE,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  customer_id BIGINT NOT NULL,
  customer_name VARCHAR(160) NOT NULL,
  customer_gstin VARCHAR(15),
  customer_state VARCHAR(80) NOT NULL,
  customer_address VARCHAR(255),
  supply_type ENUM('INTRA_STATE', 'INTER_STATE') NOT NULL,
  subtotal DECIMAL(14, 2) NOT NULL,
  total_discount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  taxable_amount DECIMAL(14, 2) NOT NULL,
  cgst_total DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  sgst_total DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  igst_total DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  total_tax DECIMAL(14, 2) NOT NULL,
  round_off DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
  grand_total DECIMAL(14, 2) NOT NULL,
  amount_paid DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  payment_status ENUM('PAID', 'PENDING', 'PARTIAL', 'OVERDUE') NOT NULL DEFAULT 'PENDING',
  notes VARCHAR(500),
  injected_anomaly_ground_truth BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoice_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  INDEX idx_invoices_issue_date (issue_date),
  INDEX idx_invoices_status (payment_status)
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  invoice_id BIGINT NOT NULL,
  product_id BIGINT,
  product_name VARCHAR(180) NOT NULL,
  hsn_code VARCHAR(16) NOT NULL,
  category VARCHAR(100) NOT NULL,
  unit VARCHAR(24) NOT NULL DEFAULT 'Nos',
  quantity INT NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  gst_rate INT NOT NULL,
  cgst_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  sgst_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  igst_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  gross_amount DECIMAL(14, 2) NOT NULL,
  discount_amount DECIMAL(14, 2) NOT NULL,
  taxable_value DECIMAL(14, 2) NOT NULL,
  cgst_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  sgst_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  igst_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  total_tax DECIMAL(14, 2) NOT NULL,
  line_total DECIMAL(14, 2) NOT NULL,
  CONSTRAINT fk_item_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS anomaly_alerts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  invoice_id BIGINT NOT NULL,
  rule_code VARCHAR(48) NOT NULL,
  severity ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
  title VARCHAR(180) NOT NULL,
  explanation VARCHAR(600) NOT NULL,
  metric_value VARCHAR(80),
  baseline_value VARCHAR(80),
  reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  reviewer_note VARCHAR(300),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_anomaly_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  timestamp_str VARCHAR(32) NOT NULL,
  action VARCHAR(48) NOT NULL,
  entity_ref VARCHAR(120) NOT NULL,
  actor VARCHAR(120) NOT NULL,
  details VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_created_at (created_at)
);
