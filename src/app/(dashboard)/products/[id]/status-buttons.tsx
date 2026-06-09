'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ProductStatusButtonsProps {
  productId: string
  currentStatus: string
}

export function ProductStatusButtons({ productId, currentStatus }: ProductStatusButtonsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const update = async (status: string, label: string) => {
    if (!confirm(`ステータスを「${label}」に変更しますか？`)) return
    setLoading(status)
    const res = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(null)
    if (res.ok) router.refresh()
  }

  // 完結済み（ボタン不要）
  if (currentStatus === 'sold') return null

  return (
    <div className="flex gap-2 flex-wrap">
      {/* インド着 → 販売済み */}
      {currentStatus === 'delivered' && (
        <Button
          size="sm"
          onClick={() => update('sold', '販売済')}
          loading={loading === 'sold'}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          販売済みにする
        </Button>
      )}

      {/* 欠陥品マーク（在庫中 or インド着から） */}
      {(currentStatus === 'in_stock' || currentStatus === 'delivered') && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => update('defective', '欠陥品')}
          loading={loading === 'defective'}
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          欠陥品にする
        </Button>
      )}

      {/* 欠陥品 → 在庫中に戻す */}
      {currentStatus === 'defective' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => update('in_stock', '在庫中')}
          loading={loading === 'in_stock'}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          在庫中に戻す
        </Button>
      )}

      {/* キャンセル */}
      {!['cancelled', 'shipped', 'delivered', 'sold'].includes(currentStatus) && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => update('cancelled', 'キャンセル')}
          loading={loading === 'cancelled'}
          className="border-slate-300 text-slate-600 hover:bg-slate-50"
        >
          <XCircle className="h-3.5 w-3.5" />
          キャンセル
        </Button>
      )}
    </div>
  )
}
