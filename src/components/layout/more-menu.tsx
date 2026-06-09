'use client'

import { X, Settings, Users, FileUp, Moon, Sun } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface MoreMenuProps {
  open: boolean
  onClose: () => void
}

export function MoreMenu({ open, onClose }: MoreMenuProps) {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true)
    }
  }, [])

  const toggleDark = () => {
    const next = !darkMode
    setDarkMode(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-[var(--card)] p-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">メニュー</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-[var(--secondary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          {/* Settings */}
          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-[var(--secondary)] transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>設定</span>
          </Link>

          {/* Customers */}
          <Link
            href="/customers"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-[var(--secondary)] transition-colors"
          >
            <Users className="h-5 w-5" />
            <span>顧客管理</span>
          </Link>

          {/* Import */}
          <Link
            href="/import"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-[var(--secondary)] transition-colors"
          >
            <FileUp className="h-5 w-5" />
            <span>CSVインポート</span>
          </Link>

          <hr className="my-4 border-[var(--border)]" />

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDark}
            className="w-full flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-[var(--secondary)] transition-colors"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span>{darkMode ? 'ライトモード' : 'ダークモード'}</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-[var(--destructive)] hover:bg-[var(--secondary)] transition-colors"
          >
            <X className="h-5 w-5" />
            <span>ログアウト</span>
          </button>
        </div>
      </div>
    </>
  )
}
