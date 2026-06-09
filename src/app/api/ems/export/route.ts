import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { EMS_STATUS_LABELS } from '@/lib/utils/format'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ems')
    .select('*, customers(name), ems_items(quantity, products(name, product_code, purchase_price, domestic_shipping, selling_price))')
    .order('box_number')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const headers = [
    '箱番号', 'EMS番号', '顧客名', 'ステータス', '発送日', '到着予定日',
    '為替(1円=₹)', 'EMS送料', '関税', 'インド国内送料',
    '商品数', '総仕入額', '総販売額', '利益(円)', '備考',
  ]

  const rows = (data ?? []).map(ems => {
    const items = (ems as any).ems_items ?? []
    const customer = (ems as any).customers?.name ?? ''
    const totalPurchase = items.reduce((s: number, i: any) =>
      s + (Number(i.products?.purchase_price ?? 0) + Number(i.products?.domestic_shipping ?? 0)) * i.quantity, 0)
    const totalSelling = items.reduce((s: number, i: any) =>
      s + Number(i.products?.selling_price ?? 0) * i.quantity, 0)
    const profit = totalSelling - totalPurchase
      - Number(ems.shipping_cost) - Number((ems as any).tariff ?? 0) - Number((ems as any).india_shipping ?? 0)

    return [
      (ems as any).box_number ?? '',
      ems.ems_number ?? '',
      customer,
      EMS_STATUS_LABELS[ems.status] ?? ems.status,
      ems.shipping_date ?? '',
      ems.estimated_arrival ?? '',
      (ems as any).exchange_rate ?? 0.625,
      ems.shipping_cost,
      (ems as any).tariff ?? 0,
      (ems as any).india_shipping ?? 0,
      items.length,
      totalPurchase,
      totalSelling,
      profit,
      ems.note ?? '',
    ]
  })

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')

  const bom = '﻿'
  const filename = `ems_${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(bom + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  })
}
