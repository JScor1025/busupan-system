import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function CustomersPage() {
  const supabase = await createClient()

  const { data: customers, count } = await supabase
    .from('customers')
    .select('*, ems(id)', { count: 'exact' })
    .order('name')

  return (
    <div className="space-y-5">
      <PageHeader title="顧客管理" description={`${count ?? 0} 件`}>
        <Link href="/customers/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            顧客登録
          </Button>
        </Link>
      </PageHeader>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">顧客名</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)] hidden sm:table-cell">メール</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)] hidden md:table-cell">電話番号</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">国</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--muted-foreground)]">EMS件数</th>
              </tr>
            </thead>
            <tbody>
              {customers?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--muted-foreground)]">
                    顧客がいません
                  </td>
                </tr>
              )}
              {customers?.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="font-medium text-[var(--primary)] hover:underline"
                    >
                      {customer.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] hidden sm:table-cell">
                    {customer.email || '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] hidden md:table-cell">
                    {customer.phone || '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{customer.country}</td>
                  <td className="px-4 py-3 text-right">
                    {(customer as any).ems?.length ?? 0} 件
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
