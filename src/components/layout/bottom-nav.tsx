'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, Box, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface BottomNavProps {
  onMoreClick?: () => void
}

export function BottomNav({ onMoreClick }: BottomNavProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center justify-around">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={cn(
            'flex flex-col items-center gap-1 flex-1 px-4 py-3 transition-colors',
            isActive('/dashboard')
              ? 'text-[var(--primary)] border-t-2 border-[var(--primary)]'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          )}
        >
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-xs">ダッシュボード</span>
        </Link>

        {/* Products */}
        <Link
          href="/products"
          className={cn(
            'flex flex-col items-center gap-1 flex-1 px-4 py-3 transition-colors',
            isActive('/products')
              ? 'text-[var(--primary)] border-t-2 border-[var(--primary)]'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          )}
        >
          <Package className="h-6 w-6" />
          <span className="text-xs">商品管理</span>
        </Link>

        {/* EMS */}
        <Link
          href="/ems"
          className={cn(
            'flex flex-col items-center gap-1 flex-1 px-4 py-3 transition-colors',
            isActive('/ems')
              ? 'text-[var(--primary)] border-t-2 border-[var(--primary)]'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          )}
        >
          <Box className="h-6 w-6" />
          <span className="text-xs">EMS管理</span>
        </Link>

        {/* More */}
        <button
          onClick={onMoreClick}
          className="flex flex-col items-center gap-1 flex-1 px-4 py-3 transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <MoreHorizontal className="h-6 w-6" />
          <span className="text-xs">その他</span>
        </button>
      </div>
    </nav>
  )
}
