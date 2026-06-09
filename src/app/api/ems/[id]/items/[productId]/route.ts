import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  const supabase = await createClient()
  const { id: emsId, productId } = await params

  const { error } = await supabase
    .from('ems_items')
    .delete()
    .eq('ems_id', emsId)
    .eq('product_id', productId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // 商品ステータスを在庫中に戻す
  await supabase
    .from('products')
    .update({ status: 'in_stock' })
    .eq('id', productId)

  return new NextResponse(null, { status: 204 })
}
