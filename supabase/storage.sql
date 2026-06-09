-- ============================================================
-- Supabase Storage: 商品画像バケット設定
-- SupabaseダッシュボードのSQL Editorで実行してください
-- ============================================================

-- バケット作成 (既存の場合はスキップ)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO NOTHING;

-- 認証ユーザーはアップロード可能
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- 画像は誰でも閲覧可能 (公開バケット)
CREATE POLICY "Product images are publicly readable"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'product-images');

-- 認証ユーザーは自分がアップロードした画像を更新・削除可能
CREATE POLICY "Authenticated users can update product images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images');
