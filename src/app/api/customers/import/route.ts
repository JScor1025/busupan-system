import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { rows } = await req.json() as { rows: Record<string, string>[] }

  const records = rows.map((row) => ({
    name: row['顧客名'] ?? row['name'] ?? '',
    email: row['メール'] ?? row['email'] ?? null,
    phone: row['電話番号'] ?? row['phone'] ?? null,
    address: row['住所'] ?? row['address'] ?? null,
    country: row['国'] ?? row['country'] ?? 'India',
  })).filter((r) => r.name)

  const { data, error } = await supabase
    .from('customers')
    .insert(records)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ imported: data?.length ?? 0 })
}
