'use client'

import { Menu, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

interface HeaderProps {
  onMenuClick: () => void
  title?: string
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
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

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[var(--border)] bg-[var(--card)] px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden rounded-md p-2 hover:bg-[var(--secondary)] transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1">
        {title && <h1 className="text-lg font-semibold text-[var(--foreground)]">{title}</h1>}
      </div>

      <button
        onClick={toggleDark}
        className="rounded-md p-2 hover:bg-[var(--secondary)] transition-colors"
        title="ダークモード切替"
      >
        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </header>
  )
}
