import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`
  }
  return `${grams} g`
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  try {
    return format(parseISO(dateStr), 'yyyy/MM/dd', { locale: ja })
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—'
  try {
    return format(parseISO(dateStr), 'yyyy/MM/dd HH:mm', { locale: ja })
  } catch {
    return dateStr
  }
}

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  purchasing: '購入中',
  in_stock: '在庫品',
  ems_registered: 'EMS登録済',
  shipped: '発送済み',
  delivered: '客に到着',
  sold: '入金済み',
  cancelled: 'キャンセル',
  defective: '欠陥品',
}

export const EMS_STATUS_LABELS: Record<string, string> = {
  packing: '梱包中',
  shipped: '発送済',
  in_transit: '輸送中',
  delivered: '配達完了',
}

export const SUPPLIER_OPTIONS = [
  'メルカリ',
  'ヤフオク',
  'Yahooフリマ',
  'ラクマ',
  'Amazon',
  '駿河屋',
  'ハードオフ',
  'その他',
] as const
