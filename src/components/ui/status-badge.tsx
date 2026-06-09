import {
  AlertTriangle,
  Ban,
  Box,
  CheckCircle2,
  MapPin,
  Package,
  Plane,
  ShoppingBag,
  ShoppingCart,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ─── 商品ステータス ───────────────────────────────
interface StatusConfig {
  label: string
  icon: React.ElementType
  bg: string
  text: string
  border: string
}

const PRODUCT_STATUS: Record<string, StatusConfig> = {
  unregistered: {
    label: '未登録',
    icon: Package,
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  ems: {
    label: 'EMS',
    icon: Box,
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  Sold: {
    label: 'Sold',
    icon: ShoppingBag,
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
  },
  cancelled: {
    label: 'Cancelled',
    icon: Ban,
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
}

// ─── EMS ステータス ───────────────────────────────
import { Archive, PackageCheck, Truck } from 'lucide-react'

const EMS_STATUS: Record<string, StatusConfig> = {
  packing: {
    label: '梱包中',
    icon: Archive,
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
  },
  shipped: {
    label: '発送済',
    icon: Plane,
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
  },
  in_transit: {
    label: '輸送中',
    icon: Truck,
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  delivered: {
    label: '配達完了',
    icon: PackageCheck,
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
}

interface StatusBadgeProps {
  status: string | null
  type?: 'product' | 'ems'
  className?: string
}

export function StatusBadge({ status, type = 'product', className }: StatusBadgeProps) {
  const map = type === 'ems' ? EMS_STATUS : PRODUCT_STATUS
  const statusKey = status === null ? 'unregistered' : status
  const config = map[statusKey]

  if (!config) {
    return null
  }

  const { label, icon: Icon, bg, text, border } = config

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        bg, text, border,
        className
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {label}
    </span>
  )
}
