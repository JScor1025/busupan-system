'use client'

import { cn } from '@/lib/utils/cn'
import { EMS_STATUS_LABELS } from '@/lib/utils/format'
import {
  Archive,
  CheckCircle2,
  Loader2,
  PackageCheck,
  Plane,
  Truck,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const STATUS_NEXT: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  packing: {
    label: '発送済みにする',
    color: 'bg-amber-500 hover:bg-amber-600 text-white',
    icon: Plane,
  },
  shipped: {
    label: '輸送中にする',
    color: 'bg-blue-500 hover:bg-blue-600 text-white',
    icon: Truck,
  },
  in_transit: {
    label: '配達完了にする',
    color: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    icon: CheckCircle2,
  },
}

const STATUS_ICON: Record<string, React.ElementType> = {
  packing: Archive,
  shipped: Plane,
  in_transit: Truck,
  delivered: PackageCheck,
}

interface EmsStatusButtonProps {
  emsId: string
  currentStatus: string
  compact?: boolean
}

export function EmsStatusButton({ emsId, currentStatus, compact = false }: EmsStatusButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const next = STATUS_NEXT[currentStatus]
  const Icon = STATUS_ICON[currentStatus] ?? Archive

  if (!next) {
    // 配達完了: 変更ボタン不要
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
        <PackageCheck className="h-3.5 w-3.5" />
        {!compact && '配達完了'}
      </span>
    )
  }

  const handleNext = async () => {
    const statusMap: Record<string, string> = {
      packing: 'shipped',
      shipped: 'in_transit',
      in_transit: 'delivered',
    }
    const nextStatus = statusMap[currentStatus]
    if (!nextStatus) return

    if (!confirm(`${EMS_STATUS_LABELS[currentStatus]} → ${EMS_STATUS_LABELS[nextStatus]}\nステータスを更新しますか？`)) return

    setLoading(true)
    const res = await fetch(`/api/ems/${emsId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })

    if (res.ok) {
      router.refresh()
    } else {
      const json = await res.json()
      alert(json.error ?? '更新に失敗しました')
    }
    setLoading(false)
  }

  if (compact) {
    return (
      <button
        onClick={handleNext}
        disabled={loading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg p-1.5 transition-colors disabled:opacity-50',
          next.color
        )}
        title={next.label}
      >
        {loading
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <Icon className="h-3.5 w-3.5" />
        }
      </button>
    )
  }

  return (
    <button
      onClick={handleNext}
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50',
        next.color
      )}
    >
      {loading
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : <Icon className="h-4 w-4" />
      }
      {next.label}
    </button>
  )
}
