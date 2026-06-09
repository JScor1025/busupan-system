'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, BarChart3, DollarSign, TrendingUp, ShoppingCart, Package, Archive, MapPin } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { QuickAddProduct } from './quick-add-product'
import { StatusBadge } from '@/components/ui/status-badge'

interface DashboardStats {
  unregistered: number
  ems: number
  sold: number
  cancelled: number
  revenue: number
  totalProfit: number
  monthlyProfit: number
}

function StatCard({
  label, value, sub, icon: Icon, color
}: {
  label: string; value: string; sub?: string; icon?: React.ElementType; color?: string
}) {
  return (
    <div className={`rounded-2xl p-4 border-0 shadow-lg ${color || 'bg-[var(--card)]'}`}>
      {Icon && <Icon className="h-4 w-4 mb-2 opacity-80" />}
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight">{value}</p>
      {sub && <p className="mt-0.5 text-xs opacity-60">{sub}</p>}
    </div>
  )
}

function InventoryChip({
  icon: Icon, label, value, href, statusKey,
}: {
  icon: React.ElementType; label: string; value: number; href: string; statusKey: string
}) {
  return (
    <Link href={href}>
      <div className="group flex items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-all cursor-pointer">
        <StatusBadge status={statusKey} className="shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-[var(--muted-foreground)] truncate">{label}</p>
          <p className="text-base font-bold leading-tight">{value}</p>
        </div>
      </div>
    </Link>
  )
}

export function DashboardClient({ s }: { s: DashboardStats }) {
  const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [monthlyProfit, setMonthlyProfit] = useState(s.monthlyProfit)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMonthlyData()
  }, [selectedMonth])

  const fetchMonthlyData = async () => {
    setLoading(true)
    try {
      const year = selectedMonth.getFullYear()
      const month = selectedMonth.getMonth() + 1
      const res = await fetch(`/api/dashboard/monthly?year=${year}&month=${month}`)
      const data = await res.json()
      setMonthlyProfit(data.profit)
    } catch (err) {
      console.error('Failed to fetch monthly data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePrevMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))
  }

  const monthLabel = selectedMonth.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })

  return (
    <div className="space-y-5 max-w-lg mx-auto lg:max-w-none">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{today}</p>
      </div>

      {/* 財務サマリー（1つのカード） */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white border border-slate-700/50 shadow-lg">
        {/* ヘッダー：月選択 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold">{monthLabel}</span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* 財務情報 */}
        <div className="space-y-4">
          {/* 今月利益（大きく強調） */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs opacity-70 mb-1">{monthLabel}利益</p>
                <p className="text-3xl font-bold">{loading ? '読込中...' : formatCurrency(monthlyProfit)}</p>
              </div>
              <TrendingUp className="h-6 w-6 opacity-60" />
            </div>
          </div>

          {/* 総利益と総売上 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xs opacity-70 mb-1">総利益</p>
              <p className="text-lg font-bold">{formatCurrency(s.totalProfit)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xs opacity-70 mb-1">総売上</p>
              <p className="text-lg font-bold">{formatCurrency(s.revenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 在庫状況（2列固定） */}
      <div>
        <h2 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-2">在庫状況</h2>
        <div className="grid grid-cols-2 gap-2">
          <InventoryChip icon={Package}       label="未登録"    value={s.unregistered}   href="/products?place="                statusKey="unregistered" />
          <InventoryChip icon={Archive}       label="EMS"       value={s.ems}            href="/products?place=ems"             statusKey="ems" />
          <InventoryChip icon={MapPin}        label="販売済み"  value={s.sold}           href="/settings"                       statusKey="Sold" />
          <InventoryChip icon={ShoppingCart}  label="在庫品"    value={s.cancelled}      href="/inventory"                      statusKey="cancelled" />
        </div>
      </div>

      {/* アクションボタン（下部） */}
      <div className="grid grid-cols-2 gap-3">
        <QuickAddProduct />
        <Link
          href="/ems/new"
          className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold hover:bg-[var(--muted)] transition-colors"
        >
          EMS作成
        </Link>
      </div>
    </div>
  )
}
