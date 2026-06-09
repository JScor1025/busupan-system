'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function ProductSearch() {
  const router = useRouter()
  const sp = useSearchParams()

  const [search, setSearch] = useState(sp.get('search') ?? '')
  const [place, setPlace] = useState(sp.get('place') ?? '')
  const [sort, setSort] = useState(sp.get('sort') ?? 'id')

  const apply = () => {
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    if (place) p.set('place', place)
    if (sort && sort !== 'id') p.set('sort', sort)
    router.push(`/products?${p.toString()}`)
  }

  const reset = () => {
    setSearch('')
    setPlace('')
    setSort('id')
    router.push('/products')
  }

  const hasFilter = search || place || (sort && sort !== 'id')

  return (
    <div className="space-y-2.5">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            placeholder="商品名・商品IDで検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && apply()}
          />
        </div>
        <Button size="sm" onClick={apply} className="h-9">
          <Search className="h-3.5 w-3.5" />
          検索
        </Button>
      </div>
      <div className="flex gap-2 items-end">
        <Select
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          options={[
            { value: '', label: 'すべての場所' },
            { value: 'ems', label: 'EMS' },
            { value: 'unregistered', label: '未登録' },
          ]}
        />
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          options={[
            { value: 'id', label: 'ID順' },
            { value: 'name', label: '五十音順' },
          ]}
        />
        <div className="flex-1" />
        {hasFilter && (
          <Button size="sm" variant="ghost" onClick={reset} className="h-9">
            <X className="h-3.5 w-3.5" />
            リセット
          </Button>
        )}
      </div>
    </div>
  )
}
