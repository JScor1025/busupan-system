import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { rows } = await req.json() as { rows: Record<string, string>[] }

  const records = rows.map((row) => ({
    name: row['商品名'] ?? row['name'] ?? '',
    supplier: row['仕入先'] ?? row['supplier'] ?? 'その他',
    purchase_price: parseFloat(row['仕入価格'] ?? row['purchase_price'] ?? '0') || 0,
    domestic_shipping: parseFloat(row['国内送料'] ?? row['domestic_shipping'] ?? '0') || 0,
    selling_price: parseFloat(row['販売価格'] ?? row['selling_price'] ?? '0') || 0,
    weight: parseFloat(row['重量'] ?? row['weight'] ?? '0') || 0,
    description: row['商品説明'] ?? row['description'] ?? null,
    storage_location: row['保管場所'] ?? row['storage_location'] ?? null,
    purchase_date: row['仕入日'] ?? row['purchase_date'] ?? null,
    status: 'in_stock' as const,
    location: 'japan' as const,
  })).filter((r) => r.name)

  const { data, error } = await supabase
    .from('products')
    .insert(records)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ imported: data?.length ?? 0 })
}
