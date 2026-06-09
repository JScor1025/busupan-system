'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUp, Package, Users } from 'lucide-react'
import { useRef, useState } from 'react'

type ImportTarget = 'products' | 'customers'

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })
}

function CsvImportCard({
  title,
  icon: Icon,
  target,
  templateColumns,
  description,
}: {
  title: string
  icon: React.ElementType
  target: ImportTarget
  templateColumns: string[]
  description: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<Record<string, string>[]>([])
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setResult(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setPreview(parseCsv(text).slice(0, 5))
    }
    reader.readAsText(file, 'UTF-8')
  }

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setLoading(true)
    setResult(null)

    const text = await file.text()
    const rows = parseCsv(text)

    const res = await fetch(`/api/${target}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows }),
    })

    const json = await res.json()
    if (res.ok) {
      setResult({ type: 'success', message: `${json.imported} 件インポートしました` })
      setPreview([])
      setFileName('')
      if (fileRef.current) fileRef.current.value = ''
    } else {
      setResult({ type: 'error', message: json.error ?? 'インポートに失敗しました' })
    }
    setLoading(false)
  }

  const downloadTemplate = () => {
    const csv = templateColumns.join(',') + '\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${target}_template.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-[var(--primary)]" />
          <CardTitle>{title}</CardTitle>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {result && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              result.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {result.message}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button size="sm" variant="outline" onClick={downloadTemplate}>
            テンプレートCSVをダウンロード
          </Button>
        </div>

        <div
          className="rounded-xl border-2 border-dashed border-[var(--border)] p-8 text-center cursor-pointer hover:border-[var(--primary)] transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <FileUp className="h-8 w-8 mx-auto text-[var(--muted-foreground)] mb-2" />
          <p className="text-sm text-[var(--muted-foreground)]">
            {fileName ? fileName : 'CSVファイルを選択またはドロップ'}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        {preview.length > 0 && (
          <div>
            <p className="text-xs text-[var(--muted-foreground)] mb-2">プレビュー (最初の5行)</p>
            <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[var(--muted)]">
                    {Object.keys(preview[0]).map((k) => (
                      <th key={k} className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)]">
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t border-[var(--border)]">
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="px-3 py-2">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {fileName && (
          <Button onClick={handleImport} loading={loading} disabled={!fileName}>
            インポート実行
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="CSVインポート"
        description="既存のExcelデータをCSV形式でインポートします"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CsvImportCard
          title="商品データ"
          icon={Package}
          target="products"
          templateColumns={['商品名', '仕入先', '仕入価格', '国内送料', '販売価格', '重量', '商品説明', '保管場所', '仕入日']}
          description="商品名・仕入先・価格などをインポートします。商品IDは自動採番されます。"
        />

        <CsvImportCard
          title="顧客データ"
          icon={Users}
          target="customers"
          templateColumns={['顧客名', 'メール', '電話番号', '住所', '国']}
          description="顧客名・連絡先などをインポートします。"
        />
      </div>
    </div>
  )
}
