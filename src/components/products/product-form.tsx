'use client'

import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { SUPPLIER_OPTIONS } from '@/lib/utils/format'
import type { Product } from '@/types/database'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, '商品名は必須です'),
  supplier: z.string().min(1, '仕入先は必須です'),
  purchase_price: z.coerce.number().min(0),
  domestic_shipping: z.coerce.number().min(0),
  selling_price: z.coerce.number().min(0),
  description: z.string().optional(),
  purchase_date: z.string().optional(),
  image_url: z.string().optional(),
  status: z.enum(['purchasing', 'in_stock', 'ems_registered', 'shipped', 'delivered', 'sold', 'cancelled', 'defective']),
})

type FormData = z.infer<typeof schema>

interface ProductFormProps {
  product?: Product
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      name: product?.name ?? '',
      supplier: product?.supplier ?? '',
      purchase_price: product?.purchase_price ?? 0,
      domestic_shipping: product?.domestic_shipping ?? 0,
      selling_price: product?.selling_price ?? 0,
      description: product?.description ?? '',
      purchase_date: product?.purchase_date ?? '',
      image_url: product?.image_url ?? '',
      status: (product?.status as FormData['status']) ?? 'in_stock',
    },
  })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    setError('')

    const url = product ? `/api/products/${product.id}` : '/api/products'
    const method = product ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, image_url: imageUrl || null }),
    })

    if (!res.ok) {
      const json = await res.json()
      setError(json.error ?? '保存に失敗しました')
      setSubmitting(false)
      return
    }

    const saved = await res.json()
    router.push(`/products/${saved.id}`)
    router.refresh()
  }

  const supplierOptions = SUPPLIER_OPTIONS.map((s) => ({ value: s, label: s }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* 画像アップロード */}
        <div className="sm:col-span-2">
          <ImageUpload value={imageUrl} onChange={setImageUrl} />
        </div>

        <div className="sm:col-span-2">
          <Input
            id="name"
            label="商品名 *"
            placeholder="例: Nintendo Switch"
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        <Select
          id="supplier"
          label="仕入先 *"
          options={supplierOptions}
          placeholder="仕入先を選択"
          error={errors.supplier?.message}
          {...register('supplier')}
        />

        <Input
          id="purchase_date"
          label="仕入日"
          type="date"
          {...register('purchase_date')}
        />

        <Input
          id="purchase_price"
          label="仕入価格 (円) *"
          type="number"
          min="0"
          error={errors.purchase_price?.message}
          {...register('purchase_price')}
        />

        <Input
          id="domestic_shipping"
          label="国内送料 (円)"
          type="number"
          min="0"
          {...register('domestic_shipping')}
        />

        <Input
          id="selling_price"
          label="販売価格 (円) *"
          type="number"
          min="0"
          error={errors.selling_price?.message}
          {...register('selling_price')}
        />

        <Select
          id="status"
          label="状態"
          options={[
            { value: 'purchasing', label: '購入中' },
            { value: 'in_stock', label: '在庫品' },
            { value: 'ems_registered', label: 'EMS登録済' },
            { value: 'shipped', label: '発送済み' },
            { value: 'delivered', label: '客に到着' },
            { value: 'sold', label: '入金済み' },
            { value: 'defective', label: '欠陥品' },
            { value: 'cancelled', label: 'キャンセル' },
          ]}
          {...register('status')}
        />

        <div className="sm:col-span-2">
          <Textarea
            id="description"
            label="商品説明"
            placeholder="商品の詳細説明"
            rows={3}
            {...register('description')}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={submitting}>
          {product ? '更新する' : '登録する'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          キャンセル
        </Button>
      </div>
    </form>
  )
}
