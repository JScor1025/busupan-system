import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)

  const year = parseInt(searchParams.get('year') ?? new Date().getFullYear().toString())
  const month = parseInt(searchParams.get('month') ?? (new Date().getMonth() + 1).toString())

  const monthStart = new Date(year, month - 1, 1).toISOString()
  const monthEnd = new Date(year, month, 0, 23, 59, 59).toISOString()

  const { data: allEms } = await supabase
    .from('ems')
    .select('status, shipping_cost, tariff, india_shipping, updated_at, ems_items(products(selling_price, purchase_price, domestic_shipping))')
    .eq('status', 'delivered')
    .gte('updated_at', monthStart)
    .lte('updated_at', monthEnd)

  let revenue = 0
  let profit = 0

  for (const ems of allEms ?? []) {
    for (const item of (ems as any).ems_items ?? []) {
      const p = (item as any).products
      if (p) {
        revenue += Number(p.selling_price)
        profit += Number(p.selling_price) - Number(p.purchase_price) - Number(p.domestic_shipping)
      }
    }
    profit -= Number((ems as any).shipping_cost ?? 0) + Number((ems as any).tariff ?? 0) + Number((ems as any).india_shipping ?? 0)
  }

  return NextResponse.json({ profit, revenue })
}
