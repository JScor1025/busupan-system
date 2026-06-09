import { PageHeader } from '@/components/layout/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import {
  formatCurrency,
  formatDate,
} from '@/lib/utils/format'
import { Edit } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: customer } = await supabase
    .from('customers')
    .select('*, ems(*, ems_items(*, products(selling_price, purchase_price, domestic_shipping)))')
    .eq('id', id)
    .single()

  if (!customer) notFound()

  const emsList = (customer as any).ems ?? []

  // 購入履歴集計
  let totalRevenue = 0
  let totalProfit = 0
  for (const ems of emsList) {
    for (const item of ems.ems_items ?? []) {
      const p = item.products
      if (p) {
        totalRevenue += Number(p.selling_price)
        totalProfit +=
          Number(p.selling_price) - Number(p.purchase_price) - Number(p.domestic_shipping)
      }
    }
    totalProfit -= Number(ems.shipping_cost ?? 0)
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <PageHeader title={customer.name}>
        <Link href={`/customers/${id}/edit`}>
          <Button size="sm" variant="outline">
            <Edit className="h-3.5 w-3.5" />
            編集
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          {/* 顧客情報 */}
          <Card>
            <CardHeader>
              <CardTitle>顧客情報</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-[var(--muted-foreground)]">メール</dt>
                  <dd className="font-medium mt-0.5">{customer.email || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[var(--muted-foreground)]">電話番号</dt>
                  <dd className="font-medium mt-0.5">{customer.phone || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[var(--muted-foreground)]">国</dt>
                  <dd className="font-medium mt-0.5">{customer.country}</dd>
                </div>
              </dl>
              {customer.address && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">住所</p>
                  <p className="text-sm">{customer.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 発送履歴 */}
          <Card>
            <CardHeader>
              <CardTitle>発送履歴 ({emsList.length} 件)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {emsList.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-[var(--muted-foreground)]">
                  発送履歴がありません
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                      <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">EMS番号</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">ステータス</th>
                      <th className="px-4 py-3 text-right font-medium text-[var(--muted-foreground)] hidden md:table-cell">商品数</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)] hidden md:table-cell">発送日</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emsList.map((ems: any) => (
                      <tr
                        key={ems.id}
                        className="border-b border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/ems/${ems.id}`}
                            className="text-[var(--primary)] hover:underline font-medium"
                          >
                            {ems.ems_number || '(番号未定)'}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={ems.status} type="ems" />
                        </td>
                        <td className="px-4 py-3 text-right hidden md:table-cell">
                          {ems.ems_items?.length ?? 0} 点
                        </td>
                        <td className="px-4 py-3 text-[var(--muted-foreground)] hidden md:table-cell">
                          {formatDate(ems.shipping_date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 購入サマリー */}
        <Card>
          <CardHeader>
            <CardTitle>購入サマリー</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--muted-foreground)]">総発送数</dt>
                <dd className="font-medium">{emsList.length} 件</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--muted-foreground)]">総購入額</dt>
                <dd className="font-medium">{formatCurrency(totalRevenue)}</dd>
              </div>
              <div className="flex justify-between border-t border-[var(--border)] pt-3">
                <dt className="font-semibold">総利益</dt>
                <dd className={`font-bold ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(totalProfit)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
