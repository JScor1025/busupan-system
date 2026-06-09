-- ============================================================
-- Migration v2: 為替レート・関税・箱番号の追加
-- SupabaseダッシュボードのSQL Editorで実行してください
-- ============================================================

-- ems テーブルに新フィールドを追加
ALTER TABLE ems
  ADD COLUMN IF NOT EXISTS box_number    integer,
  ADD COLUMN IF NOT EXISTS exchange_rate numeric(8,4) NOT NULL DEFAULT 0.625,
  ADD COLUMN IF NOT EXISTS tariff        numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS india_shipping numeric(10,2) NOT NULL DEFAULT 0;

-- box_number の自動採番シーケンス
CREATE SEQUENCE IF NOT EXISTS ems_box_number_seq START 1;

-- 既存のEMSに box_number を遡及付与（任意）
-- UPDATE ems SET box_number = nextval('ems_box_number_seq') WHERE box_number IS NULL ORDER BY created_at;

-- products の status に 'cancelled' を追加
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE products ADD CONSTRAINT products_status_check
  CHECK (status IN ('in_stock','ems_registered','shipped','delivered','cancelled'));

-- 商品コードのシーケンスを1058から開始（既存データに合わせる）
-- ※ すでに商品が登録されている場合は実行不要
SELECT setval('product_code_seq', 1057, true);
-- 次回採番から A001058 になる

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_ems_box_number ON ems(box_number);
