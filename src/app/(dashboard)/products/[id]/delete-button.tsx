'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('この商品を削除しますか？')) return
    setLoading(true)
    await fetch(`/api/products/${productId}`, { method: 'DELETE' })
    router.push('/products')
    router.refresh()
  }

  return (
    <Button size="sm" variant="destructive" loading={loading} onClick={handleDelete}>
      <Trash2 className="h-3.5 w-3.5" />
      削除
    </Button>
  )
}
