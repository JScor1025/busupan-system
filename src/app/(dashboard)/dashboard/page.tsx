import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './dashboard-client'

// ─── データ取得 ───────────────────────────────────
async function getDashboardStats() {
  const supabase = await createClient()
  const [{ data: products }, { data: allEms }] = await Promise.all([
    supabase.from('products').select('id, product_code, name, supplier, purchase_price, selling_price, status, created_at, ems_items(id)'),
    supabase.from('ems').select('status, shipping_cost, tariff, india_shipping, updated_at, ems_items(products(selling_price, purchase_price, domestic_shipping))'),
  ])

  const calcProfit = (list: typeof allEms) => {
    let revenue = 0; let profit = 0
    for (const ems of list ?? []) {
      for (const item of (ems as any).ems_items ?? []) {
        const p = (item as any).products
        if (p) { revenue += Number(p.selling_price); profit += Number(p.selling_price) - Number(p.purchase_price) - Number(p.domestic_shipping) }
      }
      profit -= Number((ems as any).shipping_cost ?? 0) + Number((ems as any).tariff ?? 0) + Number((ems as any).india_shipping ?? 0)
    }
    return { revenue, profit }
  }

  // ステータス別のカウント
  const unregistered = products?.filter(p => p.status === null).length ?? 0
  const emsCount = products?.filter(p => p.status === null && (p as any).ems_items?.length > 0).length ?? 0
  const soldCount = products?.filter(p => p.status === 'Sold').length ?? 0
  const cancelledCount = products?.filter(p => p.status === 'cancelled').length ?? 0

  const delivered = allEms?.filter(e => e.status === 'delivered') ?? []
  const { revenue, profit: totalProfit } = calcProfit(delivered)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { profit: monthlyProfit } = calcProfit(delivered.filter(e => e.updated_at >= monthStart))

  return {
    unregistered,
    ems: emsCount,
    sold: soldCount,
    cancelled: cancelledCount,
    revenue,
    totalProfit,
    monthlyProfit,
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  return <DashboardClient s={stats} />
}
