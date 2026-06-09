import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)

  const search = searchParams.get('search') ?? ''
  const status = searchParams.get('status') ?? ''

  let query = supabase
    .from('ems')
    .select('*, customers(id, name)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.ilike('ems_number', `%${search}%`)
  }
  if (status) query = query.eq('status', status)

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, count })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('ems')
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(data, { status: 201 })
}
