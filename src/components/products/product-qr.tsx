'use client'

import { Button } from '@/components/ui/button'
import { Download, Printer } from 'lucide-react'
import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface ProductQrProps {
  productCode: string
}

export function ProductQr({ productCode }: ProductQrProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, productCode, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      })
    }
  }, [productCode])

  const download = () => {
    if (!canvasRef.current) return
    const url = canvasRef.current.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-${productCode}.png`
    a.click()
  }

  const print = () => {
    if (!canvasRef.current) return
    const url = canvasRef.current.toDataURL('image/png')
    const win = window.open('')
    if (!win) return
    win.document.write(`
      <html><head><title>QR ${productCode}</title></head>
      <body style="text-align:center;padding:20px">
        <img src="${url}" />
        <p style="font-family:monospace;font-size:16px">${productCode}</p>
        <script>window.onload=()=>{window.print();window.close()}</script>
      </body></html>
    `)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="rounded-lg border border-[var(--border)]" />
      <p className="font-mono text-sm text-[var(--muted-foreground)]">{productCode}</p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={download}>
          <Download className="h-3.5 w-3.5" />
          ダウンロード
        </Button>
        <Button size="sm" variant="outline" onClick={print}>
          <Printer className="h-3.5 w-3.5" />
          印刷
        </Button>
      </div>
    </div>
  )
}
