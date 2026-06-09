import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { PRODUCT_STATUS_LABELS } from '@/lib/utils/format'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? ''
  const supplier = searchParams.get('supplier') ?? ''

  let query = supabase
    .from('products')
    .select('*')
    .order('product_code')

  if (status) query = query.eq('status', status)
  if (supplier) query = query.eq('supplier', supplier)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const headers = [
    '商品ID', '商品名', '仕入先', '仕入価格', '国内送料', '販売価格',
    '重量(g)', '状態', '場所', '保管場所', '仕入日', '商品説明', '画像URL',
  ]

  const rows = (data ?? []).map(p => [
    p.product_code,
    p.name,
    p.supplier,
    p.purchase_price,
    p.domestic_shipping,
    p.selling_price,
    p.weight,
    PRODUCT_STATUS_LABELS[p.status] ?? p.status,
    p.location,
    p.storage_location ?? '',
    p.purchase_date ?? '',
    p.description ?? '',
    p.image_url ?? '',
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')

  const bom = '﻿' // UTF-8 BOM (Excelで文字化けしないように)
  const filename = `products_${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(bom + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  })
}
