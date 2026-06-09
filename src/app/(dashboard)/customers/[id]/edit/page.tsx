import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { CustomerForm } from '@/components/customers/customer-form'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (!customer) notFound()

  return (
    <div className="space-y-5 max-w-2xl">
      <PageHeader title="顧客編集" description={customer.name} />
      <Card>
        <CardContent className="pt-6">
          <CustomerForm customer={customer as any} />
        </CardContent>
      </Card>
    </div>
  )
}
