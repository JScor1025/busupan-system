import { cn } from '@/lib/utils/cn'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300': variant === 'default',
          'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': variant === 'success',
          'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': variant === 'warning',
          'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400': variant === 'danger',
          'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': variant === 'info',
          'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400': variant === 'purple',
        },
        className
      )}
    >
      {children}
    </span>
  )
}

export const productStatusBadge = (status: string) => {
  const map: Record<string, BadgeVariant> = {
    in_stock: 'success',
    ems_registered: 'warning',
    shipped: 'info',
    delivered: 'purple',
    sold: 'default',
    cancelled: 'danger',
    defective: 'danger',
  }
  return map[status] ?? 'default'
}

export const emsStatusBadge = (status: string) => {
  const map: Record<string, BadgeVariant> = {
    packing: 'default',
    shipped: 'warning',
    in_transit: 'info',
    delivered: 'success',
  }
  return map[status] ?? 'default'
}
