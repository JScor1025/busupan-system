import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: emsId } = await params
  const { product_code } = await req.json()

  // QRコード(商品ID)から商品を取得
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('product_code', product_code)
    .single()

  if (!product) {
    return NextResponse.json({ error: `商品コード "${product_code}" が見つかりません` }, { status: 404 })
  }

  if (product.status === 'shipped' || product.status === 'delivered') {
    return NextResponse.json(
      { error: '発送済または配達完了の商品は追加できません' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('ems_items')
    .insert({ ems_id: emsId, product_id: product.id })
    .select('*, products(*)')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'この商品はすでに登録されています', product }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await supabase
    .from('products')
    .update({ status: 'ems_registered' })
    .eq('id', product.id)

  return NextResponse.json(data, { status: 201 })
}
