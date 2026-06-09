import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const STATUS_FLOW: Record<string, string> = {
  packing: 'shipped',
  shipped: 'in_transit',
  in_transit: 'delivered',
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  const body = await req.json()
  const newStatus: string = body.status

  const validStatuses = ['packing', 'shipped', 'in_transit', 'delivered']
  if (!validStatuses.includes(newStatus)) {
    return NextResponse.json({ error: '無効なステータスです' }, { status: 400 })
  }

  // delivered になったら内容物の商品を delivered + india に更新
  const updates: Record<string, unknown> = { status: newStatus }
  if (newStatus === 'shipped') {
    updates.shipping_date = new Date().toISOString().split('T')[0]
  }

  const { data, error } = await supabase
    .from('ems')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // 配達完了時: 商品ステータス・ロケーションを更新
  if (newStatus === 'delivered') {
    const { data: items } = await supabase
      .from('ems_items')
      .select('product_id')
      .eq('ems_id', id)

    if (items && items.length > 0) {
      const productIds = items.map(i => i.product_id)
      await supabase
        .from('products')
        .update({ status: 'delivered', location: 'india' })
        .in('id', productIds)
    }
  }

  return NextResponse.json(data)
}
