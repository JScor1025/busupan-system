import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const [
    { data: products },
    { data: emsData },
  ] = await Promise.all([
    supabase.from('products').select('status, selling_price, purchase_price, domestic_shipping'),
    supabase.from('ems').select('status, shipping_cost, ems_items(product_id, products(selling_price, purchase_price, domestic_shipping))'),
  ])

  const inStockCount = products?.filter((p) => p.status === 'in_stock').length ?? 0
  const inTransitCount = emsData?.filter((e) => e.status === 'in_transit' || e.status === 'shipped').length ?? 0
  const totalShipments = emsData?.filter((e) => e.status !== 'packing').length ?? 0

  const deliveredEms = emsData?.filter((e) => e.status === 'delivered') ?? []
  let totalRevenue = 0
  let totalProfit = 0
  for (const ems of deliveredEms) {
    const items = (ems as any).ems_items ?? []
    for (const item of items) {
      const p = item.products
      if (p) {
        totalRevenue += Number(p.selling_price)
        totalProfit += Number(p.selling_price) - Number(p.purchase_price) - Number(p.domestic_shipping)
      }
    }
    totalProfit -= Number((ems as any).shipping_cost ?? 0)
  }

  // 今月
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { data: monthlyEms } = await supabase
    .from('ems')
    .select('shipping_cost, ems_items(products(selling_price, purchase_price, domestic_shipping))')
    .eq('status', 'delivered')
    .gte('updated_at', monthStart)

  let monthlyProfit = 0
  for (const ems of monthlyEms ?? []) {
    const items = (ems as any).ems_items ?? []
    for (const item of items) {
      const p = item.products
      if (p) {
        monthlyProfit += Number(p.selling_price) - Number(p.purchase_price) - Number(p.domestic_shipping)
      }
    }
    monthlyProfit -= Number((ems as any).shipping_cost ?? 0)
  }

  return NextResponse.json({
    total_revenue: totalRevenue,
    total_profit: totalProfit,
    monthly_profit: monthlyProfit,
    total_shipments: totalShipments,
    in_transit_count: inTransitCount,
    in_stock_count: inStockCount,
  })
}
