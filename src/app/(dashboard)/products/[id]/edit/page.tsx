import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { ProductForm } from '@/components/products/product-form'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()

  return (
    <div className="space-y-5 max-w-2xl">
      <PageHeader title="商品編集" description={product.product_code} />
      <Card>
        <CardContent className="pt-6">
          <ProductForm product={product as any} />
        </CardContent>
      </Card>
    </div>
  )
}
