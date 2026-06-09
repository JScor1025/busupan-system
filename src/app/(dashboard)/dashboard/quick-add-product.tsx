'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { SUPPLIER_OPTIONS } from '@/lib/utils/format'
import { Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export function QuickAddProduct() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    supplier: '',
    purchase_price: '',
    quantity: '1',
    status: null,
  })

  useEffect(() => {
    if (open) setTimeout(() => nameRef.current?.focus(), 50)
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.supplier) return
    setLoading(true)
    setError('')

    const quantity = parseInt(form.quantity) || 1
    const payload = {
      name: form.name,
      supplier: form.supplier,
      purchase_price: parseFloat(form.purchase_price) || 0,
      selling_price: 0,
      status: form.status,
      location: 'japan',
      domestic_shipping: 0,
      weight: 0,
    }

    try {
      for (let i = 0; i < quantity; i++) {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const j = await res.json()
          setError(j.error ?? '登録に失敗しました')
          setLoading(false)
          return
        }
      }

      setForm({ name: '', supplier: '', purchase_price: '', quantity: '1', status: null })
      setOpen(false)
      setLoading(false)
      router.refresh()
    } catch (err) {
      setError('登録に失敗しました')
      setLoading(false)
    }
  }

  const supplierOptions = SUPPLIER_OPTIONS.map(s => ({ value: s, label: s }))

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-sm"
      >
        <Plus className="h-4 w-4" />
        商品を追加
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <h2 className="font-bold text-base">商品を追加</h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-[var(--muted)]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</p>
              )}

              <Input
                ref={nameRef}
                label="商品名 *"
                placeholder="例: ワンピース フィギュア"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />

              <Select
                label="仕入先 *"
                options={supplierOptions}
                placeholder="選択"
                value={form.supplier}
                onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="仕入価格 (円)"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.purchase_price}
                  onChange={e => setForm(f => ({ ...f, purchase_price: e.target.value }))}
                />
                <Input
                  label="個数"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <Button type="submit" loading={loading} className="flex-1">
                  登録する
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  キャンセル
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
