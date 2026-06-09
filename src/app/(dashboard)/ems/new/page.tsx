import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { EmsForm } from '@/components/ems/ems-form'

export default function NewEmsPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <PageHeader title="EMS作成" description="新しいEMSを作成します" />
      <Card>
        <CardContent className="pt-6">
          <EmsForm />
        </CardContent>
      </Card>
    </div>
  )
}
