import { PageHeader } from '@/components/layout/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmsStatusButton } from '@/components/ems/ems-status-button'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { Download, Plus } from 'lucide-react'
import Link from 'next/link'

interface SearchParams {
  search?: string
  status?: string
}

export default async function EmsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('ems')
    .select('*', { count: 'exact' })
    .order('box_number', { ascending: false })

  if (params.search) query = query.ilike('ems_number', `%${params.search}%`)
  if (params.status) query = query.eq('status', params.status)

  const { data: emsList, count } = await query

  return (
    <div className="space-y-5">
      <PageHeader title="EMS管理" description={`${count ?? 0} 件`}>
        <a href="/api/ems/export">
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4" />
            CSV出力
          </Button>
        </a>
        <Link href="/ems/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            EMS作成
          </Button>
        </Link>
      </PageHeader>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">箱番号 / EMS</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">ステータス</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--muted-foreground)]">次へ</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--muted-foreground)] hidden md:table-cell">送料</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)] hidden md:table-cell">発送日</th>
              </tr>
            </thead>
            <tbody>
              {emsList?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--muted-foreground)]">
                    EMSがありません
                  </td>
                </tr>
              )}
              {emsList?.map((ems) => (
                <tr
                  key={ems.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link href={`/ems/${ems.id}`} className="hover:text-[var(--primary)] transition-colors">
                      <div className="font-medium">
                        {(ems as any).box_number ? `#${(ems as any).box_number}` : '—'}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {ems.ems_number || '(番号未定)'}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ems.status} type="ems" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <EmsStatusButton emsId={ems.id} currentStatus={ems.status} compact />
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    {formatCurrency(ems.shipping_cost)}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] hidden md:table-cell">
                    {formatDate(ems.shipping_date)}
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
