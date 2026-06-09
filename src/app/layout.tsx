import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '物販管理システム',
  description: 'インド輸出物販管理システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
