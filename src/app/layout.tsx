import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '物販管理システム',
  description: 'インド輸出物販管理システム',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning className="h-full">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  )
}
