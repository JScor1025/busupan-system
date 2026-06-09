'use client'

import { cn } from '@/lib/utils/cn'
import {
  BarChart3,
  Box,
  FileUp,
  LayoutDashboard,
  Package,
  Settings,
  Users,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/products', label: '商品管理', icon: Package },
  { href: '/inventory', label: '在庫品', icon: Box },
  { href: '/ems', label: 'EMS管理', icon: Box },
  { href: '/customers', label: '顧客管理', icon: Users },
  { href: '/import', label: 'CSVインポート', icon: FileUp },
  { href: '/settings', label: '設定', icon: Settings },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 flex h-full w-64 flex-col',
          'bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)]',
          'transition-transform duration-200 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-400" />
            <span className="font-bold text-white text-sm">物販管理</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden rounded-md p-1 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-fg)]'
                        : 'text-[var(--sidebar-fg)] hover:bg-[var(--sidebar-hover)] hover:text-white'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-slate-500">v1.0.0</p>
        </div>
      </aside>
    </>
  )
}
