-- Rojo-Yaki POS local test database
-- Compatible with MySQL 8.x and MariaDB 10.5+.
--
-- Import examples:
--   mysql -u root -p < database/rojo-yaki-mysql.sql
--   mariadb -u root -p < database/rojo-yaki-mysql.sql
--
-- This relational schema mirrors the Payload collections used by the website:
--   branches, products, transactions, transaction items, and POS settings.

SET NAMES utf8mb4;
SET time_zone = '+08:00';

CREATE DATABASE IF NOT EXISTS rojo_yaki
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE rojo_yaki;

SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS v_branch_sales_summary;
DROP VIEW IF EXISTS v_branch_inventory;
DROP TABLE IF EXISTS transaction_items;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS pos_settings;
DROP TABLE IF EXISTS branches;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE branches (
  id CHAR(36) NOT NULL,
  code ENUM('branch1', 'branch2') NOT NULL,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_branches_code (code)
) ENGINE = InnoDB;

CREATE TABLE products (
  id CHAR(36) NOT NULL,
  branch_id CHAR(36) NOT NULL,
  record_key VARCHAR(191) NOT NULL,
  sku VARCHAR(120) NOT NULL,
  name VARCHAR(120) NOT NULL,
  category ENUM('Takoyaki', 'Snacks', 'Drinks', 'Add-ons', 'Other') NOT NULL,
  price DECIMAL(12, 2) UNSIGNED NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  min_stock INT UNSIGNED NOT NULL DEFAULT 10,
  emoji VARCHAR(16) NOT NULL,
  color CHAR(7) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_record_key (record_key),
  UNIQUE KEY uq_products_branch_sku (branch_id, sku),
  KEY idx_products_branch (branch_id),
  KEY idx_products_category (category),
  CONSTRAINT fk_products_branch
    FOREIGN KEY (branch_id) REFERENCES branches (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT chk_products_color
    CHECK (color REGEXP '^#[0-9A-Fa-f]{6}$')
) ENGINE = InnoDB;

CREATE TABLE transactions (
  id CHAR(36) NOT NULL,
  transaction_number VARCHAR(32) NOT NULL,
  branch_id CHAR(36) NOT NULL,
  occurred_at DATETIME NOT NULL,
  cashier VARCHAR(100) NOT NULL,
  subtotal DECIMAL(12, 2) UNSIGNED NOT NULL,
  discount DECIMAL(12, 2) UNSIGNED NOT NULL DEFAULT 0.00,
  total DECIMAL(12, 2) UNSIGNED NOT NULL,
  payment_method ENUM('Cash', 'GCash', 'Card') NOT NULL,
  amount_received DECIMAL(12, 2) UNSIGNED NULL,
  status ENUM('Completed', 'Pending', 'Cancelled') NOT NULL DEFAULT 'Completed',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_transactions_number (transaction_number),
  KEY idx_transactions_branch_date (branch_id, occurred_at),
  KEY idx_transactions_status (status),
  CONSTRAINT fk_transactions_branch
    FOREIGN KEY (branch_id) REFERENCES branches (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE = InnoDB;

-- Transaction items intentionally store product names and prices as snapshots.
-- Historical receipts remain accurate if a product is renamed or repriced.
CREATE TABLE transaction_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  transaction_id CHAR(36) NOT NULL,
  line_number SMALLINT UNSIGNED NOT NULL,
  product_name VARCHAR(120) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  unit_price DECIMAL(12, 2) UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_transaction_line (transaction_id, line_number),
  KEY idx_transaction_items_transaction (transaction_id),
  CONSTRAINT fk_transaction_items_transaction
    FOREIGN KEY (transaction_id) REFERENCES transactions (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT chk_transaction_items_quantity CHECK (quantity > 0)
) ENGINE = InnoDB;

-- Singleton row. Keep id = 1.
CREATE TABLE pos_settings (
  id TINYINT UNSIGNED NOT NULL,
  auto_print BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  CONSTRAINT chk_pos_settings_singleton CHECK (id = 1)
) ENGINE = InnoDB;

INSERT INTO branches (id, code, name, city) VALUES
  ('746f6324-dd0e-4894-aa58-e76982cc06bf', 'branch1', 'Branch 1', 'Quezon City'),
  ('c52822bc-9b09-484e-9568-3eaa5371823a', 'branch2', 'Branch 2', 'Makati City');

INSERT INTO products
  (id, branch_id, record_key, sku, name, category, price, stock, min_stock, emoji, color)
VALUES
  ('fbca7653-e281-4a4e-b402-70d9ea7cfb26', '746f6324-dd0e-4894-aa58-e76982cc06bf', 'branch1-original-takoyaki', 'original-takoyaki', 'Original Takoyaki', 'Takoyaki', 80.00, 25, 10, '🐙', '#FFF3E0'),
  ('82f614e5-99e2-4bca-b6e0-0710bd61540b', '746f6324-dd0e-4894-aa58-e76982cc06bf', 'branch1-cheese-takoyaki', 'cheese-takoyaki', 'Cheese Takoyaki', 'Takoyaki', 90.00, 5, 10, '🧀', '#FFF9C4'),
  ('0152867f-194f-4bfd-a2dc-704f0df3cb08', '746f6324-dd0e-4894-aa58-e76982cc06bf', 'branch1-spicy-takoyaki', 'spicy-takoyaki', 'Spicy Takoyaki', 'Takoyaki', 90.00, 18, 10, '🌶️', '#FFEBEE'),
  ('617f29ea-d7cd-49e0-a62d-aedb60bdf78c', '746f6324-dd0e-4894-aa58-e76982cc06bf', 'branch1-overload-takoyaki', 'overload-takoyaki', 'Overload Takoyaki', 'Takoyaki', 110.00, 3, 10, '🔥', '#FBE9E7'),
  ('a6f8680a-0605-496e-846d-9d31deeb8257', '746f6324-dd0e-4894-aa58-e76982cc06bf', 'branch1-french-fries', 'french-fries', 'French Fries', 'Snacks', 60.00, 20, 10, '🍟', '#FFF8E1'),
  ('711e6535-db8b-4a1a-b27b-54aa1529a9f2', '746f6324-dd0e-4894-aa58-e76982cc06bf', 'branch1-iced-tea', 'iced-tea', 'Iced Tea', 'Drinks', 40.00, 2, 10, '🧋', '#E8F5E9'),
  ('a2a9c488-58be-4e8e-81fb-9a3cfc508db6', '746f6324-dd0e-4894-aa58-e76982cc06bf', 'branch1-soft-drinks', 'soft-drinks', 'Soft Drinks', 'Drinks', 45.00, 25, 10, '🥤', '#E3F2FD'),
  ('45d86d82-ee27-4fc0-b47f-e96f23b90a49', '746f6324-dd0e-4894-aa58-e76982cc06bf', 'branch1-fish-ball', 'fish-ball', 'Fish Ball', 'Snacks', 25.00, 40, 10, '🐟', '#F3E5F5'),
  ('a889c6e7-2c65-4531-b6a7-ae265d23557f', '746f6324-dd0e-4894-aa58-e76982cc06bf', 'branch1-kwek-kwek', 'kwek-kwek', 'Kwek-Kwek', 'Snacks', 25.00, 35, 10, '🥚', '#FFF3E0'),
  ('063fdce8-23ad-4c1d-97e9-4ce0cd1ba1b8', 'c52822bc-9b09-484e-9568-3eaa5371823a', 'branch2-original-takoyaki', 'original-takoyaki', 'Original Takoyaki', 'Takoyaki', 80.00, 15, 10, '🐙', '#FFF3E0'),
  ('54574fb0-6e4c-4dc7-91dc-6aa2d81d48d2', 'c52822bc-9b09-484e-9568-3eaa5371823a', 'branch2-cheese-takoyaki', 'cheese-takoyaki', 'Cheese Takoyaki', 'Takoyaki', 90.00, 12, 10, '🧀', '#FFF9C4'),
  ('3cd65af5-f563-40d6-864d-ecf8efcd4b8d', 'c52822bc-9b09-484e-9568-3eaa5371823a', 'branch2-spicy-takoyaki', 'spicy-takoyaki', 'Spicy Takoyaki', 'Takoyaki', 90.00, 8, 10, '🌶️', '#FFEBEE'),
  ('249d4206-7e10-4617-9bd4-477ea3f626a9', 'c52822bc-9b09-484e-9568-3eaa5371823a', 'branch2-overload-takoyaki', 'overload-takoyaki', 'Overload Takoyaki', 'Takoyaki', 110.00, 20, 10, '🔥', '#FBE9E7'),
  ('a588e7e8-9891-42e0-893c-4e10896a7d08', 'c52822bc-9b09-484e-9568-3eaa5371823a', 'branch2-french-fries', 'french-fries', 'French Fries', 'Snacks', 60.00, 7, 10, '🍟', '#FFF8E1'),
  ('47971e59-94f1-452d-b1e2-2ac3271890c5', 'c52822bc-9b09-484e-9568-3eaa5371823a', 'branch2-iced-tea', 'iced-tea', 'Iced Tea', 'Drinks', 40.00, 30, 10, '🧋', '#E8F5E9'),
  ('f9810da6-5edc-4747-85e8-4208fdde49a0', 'c52822bc-9b09-484e-9568-3eaa5371823a', 'branch2-soft-drinks', 'soft-drinks', 'Soft Drinks', 'Drinks', 45.00, 18, 10, '🥤', '#E3F2FD'),
  ('553236e3-8a50-4d63-874d-a8441fcc3de9', 'c52822bc-9b09-484e-9568-3eaa5371823a', 'branch2-fish-ball', 'fish-ball', 'Fish Ball', 'Snacks', 25.00, 5, 10, '🐟', '#F3E5F5'),
  ('8eadb0c3-c59c-4d41-afbb-b586a4131ad3', 'c52822bc-9b09-484e-9568-3eaa5371823a', 'branch2-kwek-kwek', 'kwek-kwek', 'Kwek-Kwek', 'Snacks', 25.00, 10, 10, '🥚', '#FFF3E0');

INSERT INTO transactions
  (id, transaction_number, branch_id, occurred_at, cashier, subtotal, discount, total, payment_method, amount_received, status)
VALUES
  ('52e66bbe-a2a5-451d-8b7b-cc0d279cb24e', 'RJ-000124', '746f6324-dd0e-4894-aa58-e76982cc06bf', '2024-05-20 10:25:00', 'Branch 1 Staff', 200.00, 0.00, 330.00, 'Cash', 500.00, 'Completed'),
  ('4e18f7ae-ea9a-4018-ab82-96fb803ec1ae', 'RJ-000123', 'c52822bc-9b09-484e-9568-3eaa5371823a', '2024-05-20 10:10:00', 'Branch 2 Staff', 315.00, 0.00, 450.00, 'GCash', NULL, 'Completed'),
  ('1afa86d9-63bb-4197-a691-77f97d739c07', 'RJ-000122', '746f6324-dd0e-4894-aa58-e76982cc06bf', '2024-05-20 09:58:00', 'Branch 1 Staff', 180.00, 0.00, 180.00, 'Cash', 200.00, 'Completed'),
  ('ea4e3e75-8bdd-44b1-8ba8-55a0be2ff37d', 'RJ-000121', 'c52822bc-9b09-484e-9568-3eaa5371823a', '2024-05-20 09:30:00', 'Branch 2 Staff', 260.00, 0.00, 260.00, 'Cash', 300.00, 'Pending'),
  ('8fcca214-9092-4ca2-8ae8-caac7f3869d2', 'RJ-000120', '746f6324-dd0e-4894-aa58-e76982cc06bf', '2024-05-20 09:15:00', 'Branch 1 Staff', 120.00, 0.00, 120.00, 'Cash', NULL, 'Cancelled'),
  ('d26e67f0-6723-4747-9c08-b87b26e09fc8', 'RJ-000119', 'c52822bc-9b09-484e-9568-3eaa5371823a', '2024-05-20 09:00:00', 'Branch 2 Staff', 250.00, 0.00, 290.00, 'GCash', NULL, 'Completed');

INSERT INTO transaction_items
  (transaction_id, line_number, product_name, quantity, unit_price)
VALUES
  ('52e66bbe-a2a5-451d-8b7b-cc0d279cb24e', 1, 'Original Takoyaki', 2, 80.00),
  ('52e66bbe-a2a5-451d-8b7b-cc0d279cb24e', 2, 'Iced Tea', 1, 40.00),
  ('4e18f7ae-ea9a-4018-ab82-96fb803ec1ae', 1, 'Cheese Takoyaki', 2, 90.00),
  ('4e18f7ae-ea9a-4018-ab82-96fb803ec1ae', 2, 'Soft Drinks', 3, 45.00),
  ('1afa86d9-63bb-4197-a691-77f97d739c07', 1, 'Spicy Takoyaki', 2, 90.00),
  ('ea4e3e75-8bdd-44b1-8ba8-55a0be2ff37d', 1, 'Overload Takoyaki', 2, 110.00),
  ('ea4e3e75-8bdd-44b1-8ba8-55a0be2ff37d', 2, 'Iced Tea', 1, 40.00),
  ('8fcca214-9092-4ca2-8ae8-caac7f3869d2', 1, 'French Fries', 2, 60.00),
  ('d26e67f0-6723-4747-9c08-b87b26e09fc8', 1, 'Original Takoyaki', 2, 80.00),
  ('d26e67f0-6723-4747-9c08-b87b26e09fc8', 2, 'Soft Drinks', 2, 45.00);

INSERT INTO pos_settings (id, auto_print) VALUES (1, FALSE);

CREATE VIEW v_branch_inventory AS
SELECT
  b.code AS branch_code,
  b.name AS branch_name,
  b.city,
  p.id AS product_id,
  p.sku,
  p.name AS product_name,
  p.category,
  p.price,
  p.stock,
  p.min_stock,
  CASE
    WHEN p.stock = 0 THEN 'Out of Stock'
    WHEN p.stock < p.min_stock THEN 'Low Stock'
    ELSE 'In Stock'
  END AS stock_status,
  p.updated_at
FROM products AS p
INNER JOIN branches AS b ON b.id = p.branch_id;

CREATE VIEW v_branch_sales_summary AS
SELECT
  b.code AS branch_code,
  b.name AS branch_name,
  b.city,
  COUNT(CASE WHEN t.status = 'Completed' THEN 1 END) AS completed_transactions,
  COALESCE(SUM(CASE WHEN t.status = 'Completed' THEN t.total ELSE 0 END), 0) AS completed_sales,
  COALESCE(
    AVG(CASE WHEN t.status = 'Completed' THEN t.total END),
    0
  ) AS average_completed_transaction
FROM branches AS b
LEFT JOIN transactions AS t ON t.branch_id = b.id
GROUP BY b.id, b.code, b.name, b.city;

-- Import verification.
SELECT 'branches' AS table_name, COUNT(*) AS row_count FROM branches
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'transaction_items', COUNT(*) FROM transaction_items
UNION ALL
SELECT 'pos_settings', COUNT(*) FROM pos_settings;
