'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { BottomNav } from '@/components/layout/bottom-nav'
import { MoreMenu } from '@/components/layout/more-menu'

const TITLE_MAP: Record<string, string> = {
  '/dashboard': 'ダッシュボード',
  '/products': '商品管理',
  '/inventory': '在庫品',
  '/ems': 'EMS管理',
  '/customers': '顧客管理',
  '/import': 'CSVインポート',
  '/settings': '設定',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)

  const getTitle = () => {
    for (const [path, title] of Object.entries(TITLE_MAP)) {
      if (pathname.startsWith(path)) {
        return title
      }
    }
    return ''
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--card)] px-4 py-4 md:px-6">
        <h1 className="text-lg font-semibold text-[var(--foreground)]">{getTitle()}</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 md:pb-6 md:p-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav onMoreClick={() => setMoreMenuOpen(true)} />

      {/* More Menu Modal */}
      <MoreMenu open={moreMenuOpen} onClose={() => setMoreMenuOpen(false)} />
    </div>
  )
}
