'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Ems } from '@/types/database'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  ems_number: z.string().optional(),
  status: z.enum(['packing', 'shipped', 'in_transit', 'delivered']),
  shipping_date: z.string().optional(),
  estimated_arrival: z.string().optional(),
  note: z.string().optional(),
  shipping_cost: z.coerce.number().min(0),
  exchange_rate: z.coerce.number().min(0),
  tariff: z.coerce.number().min(0),
  india_shipping: z.coerce.number().min(0),
})

type FormData = z.infer<typeof schema>

interface EmsFormProps {
  ems?: Ems
}

export function EmsForm({ ems }: EmsFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      ems_number: ems?.ems_number ?? '',
      status: (ems?.status as FormData['status']) ?? 'packing',
      shipping_date: ems?.shipping_date ?? '',
      estimated_arrival: ems?.estimated_arrival ?? '',
      note: ems?.note ?? '',
      shipping_cost: ems?.shipping_cost ?? 0,
      exchange_rate: ems?.exchange_rate ?? 0.625,
      tariff: ems?.tariff ?? 0,
      india_shipping: ems?.india_shipping ?? 0,
    },
  })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    setError('')

    const payload = {
      ...data,
      ems_number: data.ems_number || null,
      shipping_date: data.shipping_date || null,
      estimated_arrival: data.estimated_arrival || null,
    }

    const url = ems ? `/api/ems/${ems.id}` : '/api/ems'
    const method = ems ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const json = await res.json()
      setError(json.error ?? '保存に失敗しました')
      setSubmitting(false)
      return
    }

    const saved = await res.json()
    router.push(`/ems/${saved.id}`)
    router.refresh()
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 基本情報 */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">基本情報</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="ems_number"
            label="EMS番号"
            placeholder="例: EN123456789JP"
            {...register('ems_number')}
          />

          <Select
            id="status"
            label="ステータス"
            options={[
              { value: 'packing', label: '梱包中' },
              { value: 'shipped', label: '発送済' },
              { value: 'in_transit', label: '輸送中' },
              { value: 'delivered', label: '配達完了' },
            ]}
            {...register('status')}
          />

          <Input
            id="shipping_date"
            label="発送日"
            type="date"
            {...register('shipping_date')}
          />

          <Input
            id="estimated_arrival"
            label="到着予定日"
            type="date"
            {...register('estimated_arrival')}
          />
        </div>
      </div>

      {/* 費用 */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">費用・為替</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="exchange_rate"
            label="為替レート (1円 = ₹)"
            type="number"
            step="0.0001"
            min="0"
            placeholder="例: 0.625"
            error={errors.exchange_rate?.message}
            {...register('exchange_rate')}
          />

          <Input
            id="shipping_cost"
            label="EMS送料 (円)"
            type="number"
            min="0"
            {...register('shipping_cost')}
          />

          <Input
            id="tariff"
            label="関税 (円)"
            type="number"
            min="0"
            {...register('tariff')}
          />

          <Input
            id="india_shipping"
            label="インド国内送料 (円)"
            type="number"
            min="0"
            {...register('india_shipping')}
          />
        </div>
      </div>

      {/* 備考 */}
      <Textarea
        id="note"
        label="備考"
        placeholder="メモ・特記事項"
        rows={3}
        {...register('note')}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={submitting}>
          {ems ? '更新する' : '作成する'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
      </div>
    </form>
  )
}
