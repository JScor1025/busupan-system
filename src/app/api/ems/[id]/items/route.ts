import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: emsId } = await params
  const { product_id } = await req.json()

  // 商品の状態チェック
  const { data: product } = await supabase
    .from('products')
    .select('status, id')
    .eq('id', product_id)
    .single()

  if (!product) {
    return NextResponse.json({ error: '商品が見つかりません' }, { status: 404 })
  }

  if (product.status === 'shipped' || product.status === 'delivered') {
    return NextResponse.json(
      { error: '発送済または配達完了の商品は追加できません' },
      { status: 400 }
    )
  }

  // EMS_itemsに追加
  const { data, error } = await supabase
    .from('ems_items')
    .insert({ ems_id: emsId, product_id })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'この商品はすでに登録されています' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // 商品ステータスを更新
  await supabase
    .from('products')
    .update({ status: 'ems_registered' })
    .eq('id', product_id)

  return NextResponse.json(data, { status: 201 })
}
