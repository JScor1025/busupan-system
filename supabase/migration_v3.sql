-- ============================================================
-- Migration v3: sold ステータス追加
-- SQL Editorで実行してください
-- ============================================================

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE products ADD CONSTRAINT products_status_check
  CHECK (status IN ('in_stock','ems_registered','shipped','delivered','sold','cancelled'));
