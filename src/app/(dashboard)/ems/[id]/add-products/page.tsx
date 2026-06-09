'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Product {
  id: string
  product_code: string
  name: string
  supplier: string
}

export default function AddProductsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [emsId, setEmsId] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      const { id } = await params
      setEmsId(id)
      fetchProducts()
    }
    load()
  }, [params])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?status=null&limit=1000')
      const json = await res.json()
      setProducts(json.data || [])
    } catch (err) {
      console.error('Failed to fetch products:', err)
      setMessage({ type: 'error', text: 'データ取得に失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (productId: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelected(newSelected)
  }

  const handleAddProducts = async () => {
    if (selected.size === 0) return
    setAdding(true)
    setMessage(null)

    try {
      const codes = products
        .filter(p => selected.has(p.id))
        .map(p => p.product_code)

      for (const code of codes) {
        const res = await fetch(`/api/ems/${emsId}/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_code: code }),
        })

        if (!res.ok) {
          const json = await res.json()
          setMessage({ type: 'error', text: json.error ?? 'エラーが発生しました' })
          setAdding(false)
          return
        }
      }

      setMessage({ type: 'success', text: `${codes.length}件の商品を追加しました` })
      setTimeout(() => {
        router.push(`/ems/${emsId}`)
        router.refresh()
      }, 1000)
    } catch (err) {
      setMessage({ type: 'error', text: 'エラーが発生しました' })
      setAdding(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Link href={`/ems/${emsId}`}>
          <Button size="sm" variant="outline">
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">商品を追加</h1>
      </div>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <Card>
        {loading ? (
          <div className="p-8 text-center text-[var(--muted-foreground)]">読み込み中...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-[var(--muted-foreground)]">未登録の商品がありません</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                    <th className="w-10 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selected.size === products.length && products.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelected(new Set(products.map(p => p.id)))
                          } else {
                            setSelected(new Set())
                          }
                        }}
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">商品ID</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">商品名</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)] hidden sm:table-cell">
                      仕入先
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
                    >
                      <td className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(product.id)}
                          onChange={() => toggleSelect(product.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                          <span className="font-mono">{product.product_code}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3 text-[var(--muted-foreground)] hidden sm:table-cell text-xs">
                        {product.supplier}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[var(--border)] px-4 py-4">
              <Button
                onClick={handleAddProducts}
                disabled={selected.size === 0 || adding}
                loading={adding}
              >
                <Check className="h-4 w-4" />
                {selected.size}件追加
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
