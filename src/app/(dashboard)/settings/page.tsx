'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { Download, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SoldProduct {
  id: string
  product_code: string
  name: string
  supplier: string
  purchase_price: number
  selling_price: number
  created_at: string
}

export default function SettingsPage() {
  const [soldProducts, setSoldProducts] = useState<SoldProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchSoldProducts()
  }, [])

  const fetchSoldProducts = async () => {
    try {
      const res = await fetch('/api/products?status=Sold&limit=1000')
      const json = await res.json()
      setSoldProducts(json.data || [])
    } catch (err) {
      console.error('Failed to fetch sold products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBackup = async () => {
    if (soldProducts.length === 0) return

    const csv = [
      ['商品ID', '商品名', '仕入先', '仕入価格', '販売価格', '登録日']
        .map(h => `"${h}"`)
        .join(','),
      ...soldProducts.map(p =>
        [
          p.product_code,
          p.name,
          p.supplier,
          p.purchase_price,
          p.selling_price,
          formatDate(p.created_at),
        ]
          .map(v => `"${v}"`)
          .join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `sold-products-${new Date().toISOString().split('T')[0]}.csv`)
    link.click()
  }

  const handleDeleteAll = async () => {
    if (!confirm(`${soldProducts.length}件の入金済み商品を削除します。この操作は取り消せません。よろしいですか？`)) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch('/api/products/sold', {
        method: 'DELETE',
      })

      if (!res.ok) {
        alert('削除に失敗しました')
        return
      }

      alert('削除完了しました')
      setSoldProducts([])
    } catch (err) {
      console.error('Delete failed:', err)
      alert('削除に失敗しました')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <PageHeader title="設定" description="過去の取引管理" />

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">入金済み商品</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              {soldProducts.length} 件の入金済み商品があります
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleBackup}
              disabled={soldProducts.length === 0}
              variant="outline"
            >
              <Download className="h-4 w-4" />
              バックアップ (CSV)
            </Button>
            <Button
              onClick={handleDeleteAll}
              disabled={soldProducts.length === 0 || deleting}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? '削除中...' : 'すべて削除'}
            </Button>
          </div>
        </div>
      </Card>

      {/* 入金済み商品一覧 */}
      {soldProducts.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                  <th className="px-4 py-3 text-left font-medium">商品ID</th>
                  <th className="px-4 py-3 text-left font-medium">商品名</th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">仕入先</th>
                  <th className="px-4 py-3 text-right font-medium hidden md:table-cell">仕入価格</th>
                  <th className="px-4 py-3 text-right font-medium hidden md:table-cell">販売価格</th>
                  <th className="px-4 py-3 text-left font-medium">登録日</th>
                </tr>
              </thead>
              <tbody>
                {soldProducts.map((product) => (
                  <tr key={product.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]">
                    <td className="px-4 py-3 font-mono text-xs">{product.product_code}</td>
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs">{product.supplier}</td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">{formatCurrency(product.purchase_price)}</td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">{formatCurrency(product.selling_price)}</td>
                    <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">{formatDate(product.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {loading && (
        <div className="text-center py-8 text-[var(--muted-foreground)]">
          読み込み中...
        </div>
      )}

      {!loading && soldProducts.length === 0 && (
        <div className="text-center py-8 text-[var(--muted-foreground)]">
          入金済み商品はありません
        </div>
      )}
    </div>
  )
}
