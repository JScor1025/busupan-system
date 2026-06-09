'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { StatusBadge } from '@/components/ui/status-badge'

interface EmsStatusSelectProps {
  emsId: string
  currentStatus: string
}

export function EmsStatusSelect({ emsId, currentStatus }: EmsStatusSelectProps) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true)
    const res = await fetch(`/api/ems/${emsId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setUpdating(false)
    if (res.ok) router.refresh()
  }

  return (
    <div className="relative">
      <select
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={updating}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
      >
        <option value="packing">梱包中</option>
        <option value="shipped">発送済</option>
        <option value="in_transit">輸送中</option>
        <option value="delivered">配達完了</option>
      </select>
      <StatusBadge status={currentStatus} type="ems" />
    </div>
  )
}
