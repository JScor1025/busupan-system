import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { ProductForm } from '@/components/products/product-form'

export default function NewProductPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <PageHeader title="商品登録" description="新しい商品を登録します" />
      <Card>
        <CardContent className="pt-6">
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  )
}
