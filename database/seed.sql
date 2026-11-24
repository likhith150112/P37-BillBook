-- BillBook (Project P37) — Synthetic Demonstration Seed Data
USE billbook_db;

INSERT IGNORE INTO customers (id, name, business_name, gstin, email, phone, address, city, state, pincode) VALUES
(1, 'Arjun Nair', 'Kaveri Systems & Traders', '29AAACK9182D1ZP', 'billing@kaverisystems.example', '+91 98450 11203', '18 MG Road, Shivajinagar', 'Bengaluru', 'Karnataka', '560001'),
(2, 'Meera Deshmukh', 'Sahyadri Logistics Hub', '27AABCS7341M1Z2', 'ap@sahyadrilogistics.example', '+91 98201 44590', 'Plot 14, MIDC Andheri East', 'Mumbai', 'Maharashtra', '400093'),
(3, 'Karthik Subramanian', 'Marina Tech Retail', '33AAACM2819L1Z8', 'finance@marinatech.example', '+91 94440 77812', '112 Anna Salai, Teynampet', 'Chennai', 'Tamil Nadu', '600018'),
(4, 'Priya Sharma', 'Indraprastha Office Mart', '07AAACI6520F1Z9', 'accounts@indraprasthamart.example', '+91 98112 33901', '45 Nehru Place Commercial Complex', 'New Delhi', 'Delhi', '110019'),
(5, 'Raghavendra Rao', 'Mysore Heritage Stationery', '29AAACM4412Q1Z4', 'orders@mysorestationery.example', '+91 99002 55189', '89 Sayyaji Rao Road', 'Mysuru', 'Karnataka', '570001'),
(6, 'Ananya Chatterjee', 'Hooghly Agro & Foods', '19AAACH8810P1Z1', 'procurement@hooghlyagro.example', '+91 98300 66214', '27 Park Street, Suite 4B', 'Kolkata', 'West Bengal', '700016'),
(7, 'Vikram Patel', 'Sabarmati Cold Chain Pvt. Ltd.', '24AAACS5590R1Z6', 'gst@sabarmaticold.example', '+91 98250 91234', 'C-19 SG Highway, Bodakdev', 'Ahmedabad', 'Gujarat', '380054'),
(8, 'Deepa Kulkarni', 'Deccan Book House (Retail)', NULL, 'deepa@deccanbooks.example', '+91 97411 20845', '54 Vidya Nagar Main Road', 'Hubballi', 'Karnataka', '580021');

INSERT IGNORE INTO products (id, sku, name, description, hsn_code, category, unit_price, gst_rate, unit, stock_qty, auto_categorised, categorisation_rule) VALUES
(1, 'BB-IT-8471-01', 'ThinkBook 14 Business Laptop (16GB / 512GB)', 'Commercial ultrabook for office deployments', '8471', 'IT Hardware & Computing', 54500.00, 18, 'Nos', 28, TRUE, 'Matched [laptop] -> HSN 8471 (18%)'),
(2, 'BB-MON-8528-02', '27-inch IPS QHD Office Monitor', 'Anti-glare productivity display panel', '8528', 'Monitors & Displays', 18900.00, 18, 'Nos', 42, TRUE, 'Matched [monitor, panel] -> HSN 8528 (18%)'),
(3, 'BB-NET-8517-03', 'Enterprise Dual-Band Wi-Fi 6 Router', 'Gigabit managed wireless access router', '8517', 'Networking & Telecom', 6800.00, 18, 'Nos', 65, TRUE, 'Matched [router, wifi] -> HSN 8517 (18%)'),
(4, 'BB-PRT-8443-04', 'POS Thermal Receipt Printer 80mm', 'High-speed USB + LAN billing printer', '8443', 'Printers & Scanners', 5200.00, 18, 'Nos', 54, TRUE, 'Matched [printer, pos thermal] -> HSN 8443 (18%)'),
(5, 'BB-FUR-9403-05', 'Ergonomic Mesh Executive Office Chair', 'Lumbar-support commercial task seating', '9403', 'Office Furniture', 8400.00, 18, 'Nos', 36, TRUE, 'Matched [chair, ergonomic] -> HSN 9403 (18%)'),
(6, 'BB-STA-4820-06', 'A4 Copier Paper Box (5 Reams / 2500 Sheets)', '80 GSM bright office stationery paper', '4820', 'Paper & Stationery', 1350.00, 12, 'Box', 210, TRUE, 'Matched [a4, paper, stationery] -> HSN 4820 (12%)'),
(7, 'BB-STA-4820-07', 'Hardbound GST Account Ledger Register', '300-page numbered accounting register', '4820', 'Paper & Stationery', 320.00, 12, 'Nos', 180, TRUE, 'Matched [ledger, register] -> HSN 4820 (12%)'),
(8, 'BB-BKS-4901-08', 'Indian GST & Accounting Reference Handbook', 'Printed educational manual for practitioners', '4901', 'Books & Educational Print', 650.00, 0, 'Nos', 95, TRUE, 'Matched [handbook, manual] -> HSN 4901 (0% Exempt)'),
(9, 'BB-FOD-1006-09', 'Premium Aged Basmati Rice (25 kg Pack)', 'Pre-packaged retail food grain', '1006', 'Food Grains & Staples', 2850.00, 5, 'Bag', 110, TRUE, 'Matched [rice, basmati] -> HSN 1006 (5%)'),
(10, 'BB-PWR-8504-10', 'Line-Interactive 1kVA Office UPS Backup', 'Surge-protected battery backup unit', '8504', 'Electrical & Power Backup', 4600.00, 18, 'Nos', 48, TRUE, 'Matched [ups] -> HSN 8504 (18%)'),
(11, 'BB-HVC-8415-11', '1.5 Ton Inverter Split Air Conditioner', 'Commercial 5-star cooling appliance', '8415', 'Air Conditioning & Luxury Appliances', 41500.00, 28, 'Nos', 14, TRUE, 'Matched [air conditioner, split ac] -> HSN 8415 (28%)'),
(12, 'BB-SVC-9983-12', 'Annual GST Software Support & AMC Package', '12-month remote & on-site IT support', '9983', 'Software & IT Consulting (SAC)', 12000.00, 18, 'Plan', 999, TRUE, 'Matched [software, amc, support] -> SAC 9983 (18%)');

INSERT IGNORE INTO invoices (
  id, invoice_number, issue_date, due_date, customer_id, customer_name, customer_gstin,
  customer_state, customer_address, supply_type, subtotal, total_discount, taxable_amount,
  cgst_total, sgst_total, igst_total, total_tax, round_off, grand_total, amount_paid,
  payment_status, notes, injected_anomaly_ground_truth
) VALUES
(1, 'BB-2026-0101', '2026-06-14', '2026-06-29', 1, 'Kaveri Systems & Traders', '29AAACK9182D1ZP',
 'Karnataka', '18 MG Road, Shivajinagar, Bengaluru - 560001', 'INTRA_STATE', 146800.00, 5450.00, 141350.00,
 12721.50, 12721.50, 0.00, 25443.00, 0.00, 166793.00, 166793.00,
 'PAID', 'Delivered to Indiranagar branch.', FALSE),
(2, 'BB-2026-0102', '2026-06-26', '2026-07-11', 2, 'Sahyadri Logistics Hub', '27AABCS7341M1Z2',
 'Maharashtra', 'Plot 14, MIDC Andheri East, Mumbai - 400093', 'INTER_STATE', 61600.00, 2040.00, 59560.00,
 0.00, 0.00, 10720.80, 10720.80, 0.20, 70281.00, 70281.00,
 'PAID', 'Inter-state dispatch via BlueDart Surface.', FALSE),
(3, 'BB-2026-0106', '2026-09-09', '2026-09-24', 4, 'Indraprastha Office Mart', '07AAACI6520F1Z9',
 'Delhi', '45 Nehru Place Commercial Complex, New Delhi - 110019', 'INTER_STATE', 95000.00, 4150.00, 90850.00,
 0.00, 0.00, 24238.00, 24238.00, 0.00, 115088.00, 0.00,
 'OVERDUE', 'Payment reminder sent.', FALSE),
(4, 'BB-2026-0109', '2026-10-21', '2026-11-05', 1, 'Kaveri Systems & Traders', '29AAACK9182D1ZP',
 'Karnataka', '18 MG Road, Shivajinagar, Bengaluru - 560001', 'INTRA_STATE', 109000.00, 41420.00, 67580.00,
 1689.50, 1689.50, 0.00, 3379.00, 0.00, 70959.00, 0.00,
 'PENDING', 'Injected anomaly test case: excessive 38% discount & HSN/GST mismatch.', TRUE);

INSERT IGNORE INTO invoice_items (
  id, invoice_id, product_id, product_name, hsn_code, category, unit, quantity,
  unit_price, discount_percent, gst_rate, cgst_rate, sgst_rate, igst_rate,
  gross_amount, discount_amount, taxable_value, cgst_amount, sgst_amount, igst_amount, total_tax, line_total
) VALUES
(1, 1, 1, 'ThinkBook 14 Business Laptop (16GB / 512GB)', '8471', 'IT Hardware & Computing', 'Nos', 2,
 54500.00, 5.00, 18, 9.00, 9.00, 0.00, 109000.00, 5450.00, 103550.00, 9319.50, 9319.50, 0.00, 18639.00, 122189.00),
(2, 1, 2, '27-inch IPS QHD Office Monitor', '8528', 'Monitors & Displays', 'Nos', 2,
 18900.00, 0.00, 18, 9.00, 9.00, 0.00, 37800.00, 0.00, 37800.00, 3402.00, 3402.00, 0.00, 6804.00, 44604.00),
(3, 2, 3, 'Enterprise Dual-Band Wi-Fi 6 Router', '8517', 'Networking & Telecom', 'Nos', 6,
 6800.00, 5.00, 18, 0.00, 0.00, 18.00, 40800.00, 2040.00, 38760.00, 0.00, 0.00, 6976.80, 6976.80, 45736.80),
(4, 2, 4, 'POS Thermal Receipt Printer 80mm', '8443', 'Printers & Scanners', 'Nos', 4,
 5200.00, 0.00, 18, 0.00, 0.00, 18.00, 20800.00, 0.00, 20800.00, 0.00, 0.00, 3744.00, 3744.00, 24544.00),
(5, 3, 11, '1.5 Ton Inverter Split Air Conditioner', '8415', 'Air Conditioning & Luxury Appliances', 'Nos', 2,
 41500.00, 5.00, 28, 0.00, 0.00, 28.00, 83000.00, 4150.00, 78850.00, 0.00, 0.00, 22078.00, 22078.00, 100928.00),
(6, 3, 12, 'Annual GST Software Support & AMC Package', '9983', 'Software & IT Consulting (SAC)', 'Plan', 1,
 12000.00, 0.00, 18, 0.00, 0.00, 18.00, 12000.00, 0.00, 12000.00, 0.00, 0.00, 2160.00, 2160.00, 14160.00),
(7, 4, 1, 'ThinkBook 14 Business Laptop (16GB / 512GB)', '8471', 'IT Hardware & Computing', 'Nos', 2,
 54500.00, 38.00, 5, 2.50, 2.50, 0.00, 109000.00, 41420.00, 67580.00, 1689.50, 1689.50, 0.00, 3379.00, 70959.00);

INSERT IGNORE INTO anomaly_alerts (
  id, invoice_id, rule_code, severity, title, explanation, metric_value, baseline_value, reviewed, reviewer_note
) VALUES
(1, 4, 'ANOM_EXCESS_DISCOUNT', 'MEDIUM', 'Excessive Discount on ThinkBook 14 Business Laptop (16GB / 512GB)',
 'Line discount of 38.00% exceeds 25% standard commercial threshold.', '38.00%', '<= 25%', FALSE, NULL),
(2, 4, 'ANOM_GST_HSN_MISMATCH', 'HIGH', 'GST Rate Mismatch for HSN 8471',
 'Item uses 5% GST, whereas HSN 8471 maps to 18%.', '5%', '18% (HSN 8471)', FALSE, NULL);

INSERT IGNORE INTO audit_logs (id, timestamp_str, action, entity_ref, actor, details) VALUES
(1, '2026-10-21 09:45', 'ANOMALY_REVIEWED', 'BB-2026-0109', 'Anomaly Engine', 'Detected 38% discount & 5% vs 18% HSN-GST mismatch awaiting human review.'),
(2, '2026-09-09 11:30', 'INVOICE_CREATED', 'BB-2026-0106', 'Accountant (MySQL)', 'Issued inter-state IGST invoice to Indraprastha Office Mart (Delhi).'),
(3, '2026-06-26 16:40', 'PAYMENT_RECORDED', 'BB-2026-0102', 'Accountant (MySQL)', 'Full settlement recorded via BlueDart COD/NEFT; marked PAID.');
