import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { Download, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function InventoryPage() {
  const supabase = await createClient()

  const { data: products, count } = await supabase
    .from('products')
    .select('*, ems_items(id)', { count: 'exact' })
    .eq('status', 'cancelled')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-5">
      <PageHeader title="在庫品" description={`${count ?? 0} 件`}>
        <a href="/api/products/export?status=cancelled">
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4" />
            CSV出力
          </Button>
        </a>
      </PageHeader>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">商品ID</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">商品名</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)] hidden sm:table-cell">仕入先</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--muted-foreground)] hidden md:table-cell">仕入価格</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">Place</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)] hidden lg:table-cell">登録日</th>
              </tr>
            </thead>
            <tbody>
              {products?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted-foreground)]">
                    在庫品がありません
                  </td>
                </tr>
              )}
              {products?.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/products/${product.id}`}
                      className="font-mono text-xs text-[var(--primary)] hover:underline"
                    >
                      {product.product_code}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/products/${product.id}`}
                      className="font-medium hover:text-[var(--primary)] transition-colors"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] hidden sm:table-cell">
                    {product.supplier}
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    {formatCurrency(product.purchase_price)}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    IN-Stock
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] hidden lg:table-cell">
                    {formatDate(product.purchase_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
