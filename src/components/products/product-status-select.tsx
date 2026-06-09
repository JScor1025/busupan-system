'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { StatusBadge } from '@/components/ui/status-badge'

interface ProductStatusSelectProps {
  productId: string
  currentStatus: string | null
}

export function ProductStatusSelect({ productId, currentStatus }: ProductStatusSelectProps) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string | null) => {
    setUpdating(true)
    const res = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus === '' ? null : newStatus }),
    })
    setUpdating(false)
    if (res.ok) router.refresh()
  }

  return (
    <div className="relative">
      <select
        value={currentStatus ?? ''}
        onChange={(e) => handleStatusChange(e.target.value === '' ? null : e.target.value)}
        disabled={updating}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
      >
        <option value="">未登録</option>
        <option value="Sold">Sold</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <StatusBadge status={currentStatus} />
    </div>
  )
}
