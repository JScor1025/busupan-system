import { PageHeader } from '@/components/layout/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductQr } from '@/components/products/product-qr'
import { ProductStatusSelect } from '@/components/products/product-status-select'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, formatWeight } from '@/lib/utils/format'
import { Edit } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DeleteProductButton } from './delete-button'
import { ProductStatusButtons } from './status-buttons'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, ems_items(*, ems(*, customers(*)))')
    .eq('id', id)
    .single()

  if (!product) notFound()

  const profit =
    product.selling_price - product.purchase_price - product.domestic_shipping

  const fields = [
    { label: '商品ID', value: product.product_code, mono: true },
    { label: '仕入先', value: product.supplier },
    { label: '仕入価格', value: formatCurrency(product.purchase_price) },
    { label: '国内送料', value: formatCurrency(product.domestic_shipping) },
    { label: '販売価格', value: formatCurrency(product.selling_price) },
    { label: '商品利益 (参考)', value: formatCurrency(profit) },
    { label: '重量', value: formatWeight(product.weight) },
    { label: '保管場所', value: product.storage_location || '—' },
    { label: '仕入日', value: formatDate(product.purchase_date) },
  ]

  return (
    <div className="space-y-5 max-w-4xl">
      <PageHeader title={product.name}>
        <Link href={`/products/${id}/edit`}>
          <Button size="sm" variant="outline">
            <Edit className="h-3.5 w-3.5" />
            編集
          </Button>
        </Link>
        <DeleteProductButton productId={id} />
      </PageHeader>

      <ProductStatusButtons productId={id} currentStatus={product.status} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>基本情報</CardTitle>
                <ProductStatusSelect productId={id} currentStatus={product.status} />
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {fields.map(({ label, value, mono }) => (
                  <div key={label}>
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className={`font-medium mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</dd>
                  </div>
                ))}
              </dl>
              {product.description && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">商品説明</p>
                  <p className="text-sm">{product.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* EMS履歴 */}
          {(product as any).ems_items?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>EMS履歴</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(product as any).ems_items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2">
                      <div>
                        <Link
                          href={`/ems/${item.ems.id}`}
                          className="text-sm font-medium text-[var(--primary)] hover:underline"
                        >
                          {item.ems.ems_number || '(番号未定)'}
                        </Link>
                        {item.ems.customers && (
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {item.ems.customers.name}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={item.ems.status} type="ems" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* QRコード */}
        <Card>
          <CardHeader>
            <CardTitle>QRコード</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductQr productCode={product.product_code} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
