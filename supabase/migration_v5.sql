-- Migration v5: purchasing (購入中) ステータス追加
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE products ADD CONSTRAINT products_status_check
  CHECK (status IN (
    'purchasing','in_stock','ems_registered',
    'shipped','delivered','sold','cancelled','defective'
  ));
