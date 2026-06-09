'use client'

import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getTitle = () => {
    for (const [path, title] of Object.entries(TITLE_MAP)) {
      if (pathname.startsWith(path)) {
        return title
      }
    }
    return ''
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden lg:ml-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title={getTitle()} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
