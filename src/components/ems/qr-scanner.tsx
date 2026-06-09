'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Camera, Keyboard, X, Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface QrScannerProps {
  emsId: string
}

export function QrScanner({ emsId }: QrScannerProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'idle' | 'camera' | 'manual'>('idle')
  const [manualCode, setManualCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const scannerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const addProduct = async (code: string) => {
    if (!code.trim()) return
    setLoading(true)
    setMessage(null)

    const res = await fetch(`/api/ems/${emsId}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_code: code.trim() }),
    })

    const json = await res.json()

    if (res.ok) {
      setMessage({ type: 'success', text: `${json.products?.name ?? code} を追加しました` })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: json.error ?? 'エラーが発生しました' })
    }
    setLoading(false)
  }

  const startCamera = async () => {
    setMode('camera')
    setMessage(null)

    // html5-qrcode を動的インポート
    const { Html5Qrcode } = await import('html5-qrcode')
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText: string) => {
          await addProduct(decodedText)
        },
        () => {}
      )
    } catch {
      setMessage({ type: 'error', text: 'カメラを起動できませんでした' })
      setMode('idle')
    }
  }

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
      } catch {}
      scannerRef.current = null
    }
    setMode('idle')
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  return (
    <div className="space-y-3">
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

      {mode === 'idle' && (
        <div className="flex gap-2">
          <Button size="sm" onClick={startCamera}>
            <Camera className="h-3.5 w-3.5" />
            カメラでスキャン
          </Button>
          <Button size="sm" variant="outline" onClick={() => setMode('manual')}>
            <Keyboard className="h-3.5 w-3.5" />
            手入力
          </Button>
          <Link href={`/ems/${emsId}/add-products`}>
            <Button size="sm" variant="outline">
              <Check className="h-3.5 w-3.5" />
              選ぶ
            </Button>
          </Link>
        </div>
      )}

      {mode === 'camera' && (
        <div className="space-y-3">
          <div id="qr-reader" ref={containerRef} className="w-full max-w-sm rounded-lg overflow-hidden" />
          <Button size="sm" variant="outline" onClick={stopCamera}>
            <X className="h-3.5 w-3.5" />
            スキャン停止
          </Button>
        </div>
      )}

      {mode === 'manual' && (
        <div className="flex gap-2 items-end">
          <Input
            placeholder="商品ID (例: A000001)"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addProduct(manualCode)
                setManualCode('')
              }
            }}
          />
          <Button
            size="sm"
            loading={loading}
            onClick={() => {
              addProduct(manualCode)
              setManualCode('')
            }}
          >
            追加
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setMode('idle')}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}
