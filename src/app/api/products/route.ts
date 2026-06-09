import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)

  const search = searchParams.get('search') ?? ''
  const status = searchParams.get('status') ?? ''
  const supplier = searchParams.get('supplier') ?? ''
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const offset = (page - 1) * limit

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,product_code.ilike.%${search}%`
    )
  }
  if (status === 'null') {
    query = query.is('status', null)
  } else if (status) {
    query = query.eq('status', status)
  }
  if (supplier) query = query.eq('supplier', supplier)

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, count })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()

  // 空文字列を null に変換 (date, text 型の optional フィールド)
  const nullified = Object.fromEntries(
    Object.entries(body).map(([k, v]) => [k, v === '' ? null : v])
  )

  // product_code をクライアントから受け取らない場合は、デフォルト値を設定
  const payload = {
    ...nullified,
    product_code: `P${Date.now()}`, // 一時的なコード生成
  }

  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('Insert error:', error)
    return NextResponse.json({ error: error.message, details: error }, { status: 400 })
  }

  return NextResponse.json(data, { status: 201 })
}
