-- ============================================================
-- インド輸出物販管理システム Supabase スキーマ
-- ============================================================

-- customers
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE,
  phone text,
  address text,
  country text NOT NULL DEFAULT 'India',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- products
CREATE SEQUENCE IF NOT EXISTS product_code_seq START 1;

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code text UNIQUE NOT NULL DEFAULT '',
  name text NOT NULL,
  image_url text,
  description text,
  supplier text NOT NULL,
  purchase_price numeric(10,2) NOT NULL DEFAULT 0,
  domestic_shipping numeric(10,2) NOT NULL DEFAULT 0,
  selling_price numeric(10,2) NOT NULL DEFAULT 0,
  weight numeric(8,2) NOT NULL DEFAULT 0,
  purchase_date date,
  storage_location text,
  status text NOT NULL DEFAULT 'in_stock'
    CHECK (status IN ('in_stock','ems_registered','shipped','delivered')),
  location text NOT NULL DEFAULT 'japan'
    CHECK (location IN ('japan','india','customer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- product_code 自動採番
CREATE OR REPLACE FUNCTION generate_product_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.product_code IS NULL OR NEW.product_code = '' THEN
    NEW.product_code := 'A' || LPAD(nextval('product_code_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_product_code ON products;
CREATE TRIGGER set_product_code
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION generate_product_code();

-- ems
CREATE TABLE IF NOT EXISTS ems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ems_number text,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'packing'
    CHECK (status IN ('packing','shipped','in_transit','delivered')),
  shipping_date date,
  estimated_arrival date,
  note text,
  total_weight numeric(8,2) NOT NULL DEFAULT 0,
  shipping_cost numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ems_items
CREATE TABLE IF NOT EXISTS ems_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ems_id uuid NOT NULL REFERENCES ems(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(ems_id, product_id)
);

-- updated_at 自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS customers_updated_at ON customers;
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS ems_updated_at ON ems;
CREATE TRIGGER ems_updated_at BEFORE UPDATE ON ems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (Row Level Security) - 認証ユーザーのみアクセス可
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ems ENABLE ROW LEVEL SECURITY;
ALTER TABLE ems_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do anything on customers"
  ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can do anything on products"
  ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can do anything on ems"
  ON ems FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can do anything on ems_items"
  ON ems_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier);
CREATE INDEX IF NOT EXISTS idx_ems_status ON ems(status);
CREATE INDEX IF NOT EXISTS idx_ems_customer_id ON ems(customer_id);
CREATE INDEX IF NOT EXISTS idx_ems_items_ems_id ON ems_items(ems_id);
CREATE INDEX IF NOT EXISTS idx_ems_items_product_id ON ems_items(product_id);
