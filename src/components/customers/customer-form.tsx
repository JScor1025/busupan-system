'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Customer } from '@/types/database'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, '顧客名は必須です'),
  email: z.string().email('メールアドレスが無効です').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().min(1, '国は必須です'),
})

type FormData = z.infer<typeof schema>

interface CustomerFormProps {
  customer?: Customer
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: customer?.name ?? '',
      email: customer?.email ?? '',
      phone: customer?.phone ?? '',
      address: customer?.address ?? '',
      country: customer?.country ?? 'India',
    },
  })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    setError('')

    const payload = { ...data, email: data.email || null }
    const url = customer ? `/api/customers/${customer.id}` : '/api/customers'
    const method = customer ? 'PUT' : 'POST'

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
    router.push(`/customers/${saved.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            id="name"
            label="顧客名 *"
            placeholder="例: Rahul Sharma"
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        <Input
          id="email"
          label="メールアドレス"
          type="email"
          placeholder="example@gmail.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          id="phone"
          label="電話番号"
          placeholder="+91 98765 43210"
          {...register('phone')}
        />

        <Input
          id="country"
          label="国 *"
          placeholder="India"
          error={errors.country?.message}
          {...register('country')}
        />

        <div className="sm:col-span-2">
          <Textarea
            id="address"
            label="住所"
            placeholder="住所を入力"
            rows={3}
            {...register('address')}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={submitting}>
          {customer ? '更新する' : '登録する'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
      </div>
    </form>
  )
}
