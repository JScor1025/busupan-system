import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils/cn'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { Download, Plus } from 'lucide-react'
import Link from 'next/link'
import { ProductSearch } from './product-search'

// ステータスによる行ハイライト色
function rowHighlight(status: string): string {
  if (status === 'ems_registered') return 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
  if (status === 'defective')      return 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
  return ''
}

interface SearchParams {
  search?: string
  place?: string
  sort?: string
  page?: string
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const page = parseInt(params.page ?? '1')
  const limit = 1000

  // まずすべての status = null の商品を取得
  let query = supabase
    .from('products')
    .select('*, ems_items(id)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,product_code.ilike.%${params.search}%`)
  }

  query = query.is('status', null)

  const { data: allProducts, count } = await query

  // クライアント側でフィルタリング
  let filtered = allProducts ?? []
  if (params.place === 'ems') {
    // EMS に梱包されている
    filtered = filtered.filter((p: any) => p.ems_items?.length > 0)
  } else if (params.place === 'unregistered') {
    // 未登録：EMS に梱包されていない
    filtered = filtered.filter((p: any) => !p.ems_items?.length || p.ems_items.length === 0)
  }
  // params.place が '' または undefined の場合は両方表示

  // 並び替え
  if (params.sort === 'name') {
    filtered = filtered.sort((a: any, b: any) => a.name.localeCompare(b.name, 'ja'))
  } else {
    // ID順（product_code を数値としてソート）
    filtered = filtered.sort((a: any, b: any) => {
      const numA = parseInt(a.product_code.slice(1)) || 0
      const numB = parseInt(b.product_code.slice(1)) || 0
      return numA - numB
    })
  }

  // ページネーション
  const offset = (page - 1) * limit
  const products = filtered.slice(offset, offset + limit)
  const totalPages = Math.ceil(filtered.length / limit)
  const displayCount = filtered.length

  return (
    <div className="space-y-5">
      <PageHeader title="商品管理" description={`${displayCount} 件`}>
        <a href="/api/products/export">
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4" />
            CSV出力
          </Button>
        </a>
        <Link href="/products/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            商品登録
          </Button>
        </Link>
      </PageHeader>

      <ProductSearch />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">商品ID</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">商品名</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)] hidden sm:table-cell">仕入先</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--muted-foreground)] hidden md:table-cell">仕入価格</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--muted-foreground)] hidden md:table-cell">販売価格</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)] hidden lg:table-cell">仕入日</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted-foreground)]">
                    商品がありません
                  </td>
                </tr>
              )}
              {filtered.map((product: any) => (
                <tr
                  key={product.id}
                  className={cn(
                    'border-b transition-colors border-[var(--border)] hover:bg-[var(--muted)]'
                  )}
                >
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                      (product as any).ems_items?.length > 0
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                    )}>
                      <Link
                        href={`/products/${product.id}`}
                        className="font-mono hover:underline"
                      >
                        {product.product_code}
                      </Link>
                    </span>
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
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    {formatCurrency(product.selling_price)}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] hidden lg:table-cell">
                    {formatDate(product.purchase_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3">
            <p className="text-sm text-[var(--muted-foreground)]">
              {page} / {totalPages} ページ
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`?page=${page - 1}${params.place ? `&place=${params.place}` : ''}${params.sort ? `&sort=${params.sort}` : ''}${params.search ? `&search=${params.search}` : ''}`}>
                  <Button size="sm" variant="outline">前へ</Button>
                </Link>
              )}
              {page < totalPages && (
                <Link href={`?page=${page + 1}${params.place ? `&place=${params.place}` : ''}${params.sort ? `&sort=${params.sort}` : ''}${params.search ? `&search=${params.search}` : ''}`}>
                  <Button size="sm" variant="outline">次へ</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
