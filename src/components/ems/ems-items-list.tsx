'use client'

import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatWeight } from '@/lib/utils/format'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface EmsItem {
  id: string
  ems_id: string
  product_id: string
  quantity: number
  products: {
    id: string
    product_code: string
    name: string
    purchase_price: number
    domestic_shipping: number
    selling_price: number
    weight: number
    status: string | null
  }
}

interface EmsItemsListProps {
  emsId: string
  items: EmsItem[]
  isPacking: boolean
}

export function EmsItemsList({ emsId, items, isPacking }: EmsItemsListProps) {
  const router = useRouter()
  const [removing, setRemoving] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const removeItem = async (productId: string) => {
    if (!confirm('この商品をEMSから削除しますか？')) return
    setRemoving(productId)
    await fetch(`/api/ems/${emsId}/items/${productId}`, { method: 'DELETE' })
    setRemoving(null)
    router.refresh()
  }

  const updateProductStatus = async (productId: string, newStatus: string | null) => {
    setUpdatingStatus(productId)
    await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setUpdatingStatus(null)
    router.refresh()
  }

  if (items.length === 0) {
    return (
      <div className="px-6 py-8 text-center text-sm text-[var(--muted-foreground)]">
        商品が登録されていません
      </div>
    )
  }

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
            <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">商品</th>
            <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)] hidden sm:table-cell">状態</th>
            <th className="px-4 py-3 text-right font-medium text-[var(--muted-foreground)] hidden md:table-cell">仕入</th>
            <th className="px-4 py-3 text-right font-medium text-[var(--muted-foreground)] hidden md:table-cell">販売</th>
            <th className="px-4 py-3 text-right font-medium text-[var(--muted-foreground)] hidden lg:table-cell">重量</th>
            {isPacking && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className={cn(
                'border-b transition-colors',
                item.products.status === 'Sold'
                  ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800'
                  : item.products.status === 'cancelled'
                  ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
                  : 'border-[var(--border)] hover:bg-[var(--muted)]'
              )}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {item.products.status === 'Sold' && (
                    <span className="text-purple-600 dark:text-purple-400 text-lg leading-none">•</span>
                  )}
                  {item.products.status === 'cancelled' && (
                    <span className="text-red-600 dark:text-red-400 text-lg leading-none">•</span>
                  )}
                  {!item.products.status && (
                    <span className="text-blue-600 dark:text-blue-400 text-lg leading-none">•</span>
                  )}
                  <div>
                    <Link
                      href={`/products/${item.products.id}`}
                      className="font-medium hover:text-[var(--primary)] transition-colors"
                    >
                      {item.products.name}
                    </Link>
                    <p className="font-mono text-xs text-[var(--muted-foreground)]">
                      {item.products.product_code}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <div className="relative inline-block">
                  <select
                    value={item.products.status ?? ''}
                    onChange={(e) => updateProductStatus(item.products.id, e.target.value === '' ? null : e.target.value)}
                    disabled={updatingStatus === item.products.id}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
                  >
                    <option value="">未登録</option>
                    <option value="Sold">Sold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <StatusBadge status={item.products.status} className="pointer-events-none" />
                </div>
              </td>
              <td className="px-4 py-3 text-right hidden md:table-cell">
                {formatCurrency(item.products.purchase_price + item.products.domestic_shipping)}
              </td>
              <td className="px-4 py-3 text-right hidden md:table-cell">
                {formatCurrency(item.products.selling_price)}
              </td>
              <td className="px-4 py-3 text-right hidden lg:table-cell">
                {formatWeight(item.products.weight)}
              </td>
              {isPacking && (
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={removing === item.product_id}
                    onClick={() => removeItem(item.product_id)}
                    className="text-[var(--destructive)] hover:text-[var(--destructive)]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
