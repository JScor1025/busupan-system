'use client'

import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { Camera, ImagePlus, Loader2, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  className?: string
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const galleryRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    if (!file) return
    setUploading(true)
    setError('')

    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: false })

    if (uploadError) {
      setError('アップロードに失敗しました')
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    onChange(data.publicUrl)
    setUploading(false)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
    e.target.value = ''
  }

  const remove = () => onChange('')

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="text-sm font-medium text-[var(--foreground)]">商品画像</span>

      {value ? (
        <div className="relative w-full max-w-xs">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-[var(--border)]">
            <Image
              src={value}
              alt="商品画像"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <button
            type="button"
            onClick={remove}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
            title="画像を削除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* アップロードエリア */}
          <div
            onClick={() => galleryRef.current?.click()}
            className={cn(
              'flex w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-2',
              'aspect-square rounded-xl border-2 border-dashed border-[var(--border)]',
              'hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-colors',
              uploading && 'pointer-events-none opacity-50'
            )}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
            ) : (
              <ImagePlus className="h-8 w-8 text-[var(--muted-foreground)]" />
            )}
            <span className="text-xs text-[var(--muted-foreground)]">
              {uploading ? 'アップロード中...' : 'タップして選択'}
            </span>
          </div>

          {/* アルバム / カメラ ボタン */}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => galleryRef.current?.click()}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--border)]',
                'bg-[var(--card)] px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-[var(--secondary)] disabled:opacity-50 disabled:pointer-events-none'
              )}
            >
              <ImagePlus className="h-4 w-4" />
              アルバム
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => cameraRef.current?.click()}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--border)]',
                'bg-[var(--card)] px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-[var(--secondary)] disabled:opacity-50 disabled:pointer-events-none'
              )}
            >
              <Camera className="h-4 w-4" />
              撮影
            </button>
          </div>
        </div>
      )}

      {/* 既存画像があっても変更できるボタン */}
      {value && (
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            disabled={uploading}
            onClick={() => galleryRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--secondary)] transition-colors disabled:opacity-50"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            アルバムから変更
          </button>
          <button
            type="button"
            disabled={uploading}
            onClick={() => cameraRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--secondary)] transition-colors disabled:opacity-50"
          >
            <Camera className="h-3.5 w-3.5" />
            撮影して変更
          </button>
        </div>
      )}

      {error && <p className="text-xs text-[var(--destructive)]">{error}</p>}

      {/* アルバム選択 */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      {/* カメラ撮影 (環境カメラ = 背面カメラ) */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
