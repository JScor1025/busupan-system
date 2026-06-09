import { cn } from '@/lib/utils/cn'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      {description && (
        <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
      )}
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
