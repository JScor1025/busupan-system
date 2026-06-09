import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { EmsForm } from '@/components/ems/ems-form'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditEmsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: ems } = await supabase
    .from('ems')
    .select('*')
    .eq('id', id)
    .single()

  if (!ems) notFound()

  return (
    <div className="space-y-5 max-w-2xl">
      <PageHeader title="EMS編集" />
      <Card>
        <CardContent className="pt-6">
          <EmsForm ems={ems as any} />
        </CardContent>
      </Card>
    </div>
  )
}
