import { PageHeader } from '@/components/layout/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QrScanner } from '@/components/ems/qr-scanner'
import { EmsItemsList } from '@/components/ems/ems-items-list'
import { EmsStatusButton } from '@/components/ems/ems-status-button'
import { EmsStatusSelect } from '@/components/ems/ems-status-select'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, formatWeight } from '@/lib/utils/format'
import { Edit } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function formatInr(amount: number): string {
  return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)
}

export default async function EmsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: ems } = await supabase
    .from('ems')
    .select('*, customers(*), ems_items(*, products(*))')
    .eq('id', id)
    .single()

  if (!ems) notFound()

  const items = (ems as any).ems_items ?? []
  const customer = (ems as any).customers
  const rate = Number(ems.exchange_rate ?? 0.625)

  // 集計
  const totalWeight = items.reduce(
    (s: number, i: any) => s + Number(i.products?.weight ?? 0) * i.quantity,
    0
  )
  const totalPurchaseJpy = items.reduce(
    (s: number, i: any) =>
      s + (Number(i.products?.purchase_price ?? 0) + Number(i.products?.domestic_shipping ?? 0)) * i.quantity,
    0
  )
  const totalSellingJpy = items.reduce(
    (s: number, i: any) => s + Number(i.products?.selling_price ?? 0) * i.quantity,
    0
  )

  const emsCostJpy = Number(ems.shipping_cost) + Number(ems.tariff ?? 0) + Number(ems.india_shipping ?? 0)
  const profitJpy = totalSellingJpy - totalPurchaseJpy - emsCostJpy
  const profitInr = profitJpy * rate

  const infoRows = [
    { label: '顧客', value: customer
        ? <Link href={`/customers/${customer.id}`} className="text-[var(--primary)] hover:underline">{customer.name}</Link>
        : '—' },
    { label: '発送日', value: formatDate(ems.shipping_date) },
    { label: '到着予定日', value: formatDate(ems.estimated_arrival) },
    { label: '為替レート', value: `1円 = ₹${rate}` },
    { label: 'EMS送料', value: formatCurrency(ems.shipping_cost) },
    { label: '関税', value: formatCurrency(ems.tariff ?? 0) },
    { label: 'インド国内送料', value: formatCurrency(ems.india_shipping ?? 0) },
  ]

  return (
    <div className="space-y-5 max-w-5xl">
      <PageHeader
        title={ems.ems_number || '(番号未定)'}
        description={ems.box_number ? `箱番号 #${ems.box_number}` : undefined}
      >
        <EmsStatusButton emsId={id} currentStatus={ems.status} />
        <Link href={`/ems/${id}/edit`}>
          <Button size="sm" variant="outline">
            <Edit className="h-3.5 w-3.5" />
            編集
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          {/* EMS情報 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>EMS情報</CardTitle>
                <EmsStatusSelect emsId={id} currentStatus={ems.status} />
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {infoRows.map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="font-medium mt-0.5">{value}</dd>
                  </div>
                ))}
              </dl>
              {ems.note && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">備考</p>
                  <p className="text-sm">{ems.note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QRスキャン梱包 */}
          {ems.status === 'packing' && (
            <Card>
              <CardHeader>
                <CardTitle>商品スキャン梱包</CardTitle>
              </CardHeader>
              <CardContent>
                <QrScanner emsId={id} />
              </CardContent>
            </Card>
          )}

          {/* 内容物一覧 */}
          <Card>
            <CardHeader>
              <CardTitle>内容物一覧 ({items.length} 点)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <EmsItemsList emsId={id} items={items} isPacking={ems.status === 'packing'} />
            </CardContent>
          </Card>
        </div>

        {/* Right: 集計 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>集計</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--muted-foreground)]">商品数</dt>
                  <dd className="font-medium">{items.length} 点</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--muted-foreground)]">総重量</dt>
                  <dd className="font-medium">{formatWeight(totalWeight)}</dd>
                </div>

                <div className="border-t border-[var(--border)] pt-2.5 space-y-2.5">
                  <div className="flex justify-between">
                    <dt className="text-[var(--muted-foreground)]">総仕入額</dt>
                    <dd className="font-medium">{formatCurrency(totalPurchaseJpy)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--muted-foreground)]">総販売額</dt>
                    <dd className="font-medium">{formatCurrency(totalSellingJpy)}</dd>
                  </div>
                </div>

                <div className="border-t border-[var(--border)] pt-2.5 space-y-2.5">
                  <p className="text-xs text-[var(--muted-foreground)] font-semibold">発送費用</p>
                  <div className="flex justify-between">
                    <dt className="text-[var(--muted-foreground)]">EMS送料</dt>
                    <dd>- {formatCurrency(ems.shipping_cost)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--muted-foreground)]">関税</dt>
                    <dd>- {formatCurrency(ems.tariff ?? 0)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--muted-foreground)]">印国内送料</dt>
                    <dd>- {formatCurrency(ems.india_shipping ?? 0)}</dd>
                  </div>
                </div>

                <div className="border-t-2 border-[var(--border)] pt-3 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <dt className="font-semibold">利益 (円)</dt>
                    <dd className={`font-bold text-base ${profitJpy >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(profitJpy)}
                    </dd>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <dt className="text-sm text-[var(--muted-foreground)]">利益 (ルピー)</dt>
                    <dd className={`font-semibold text-sm ${profitInr >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {formatInr(profitInr)}
                    </dd>
                  </div>
                  {totalSellingJpy > 0 && (
                    <div className="flex justify-between items-baseline">
                      <dt className="text-xs text-[var(--muted-foreground)]">利益率</dt>
                      <dd className="text-xs font-medium">
                        {((profitJpy / totalSellingJpy) * 100).toFixed(1)}%
                      </dd>
                    </div>
                  )}
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
