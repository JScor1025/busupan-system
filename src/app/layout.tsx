import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '物販管理システム',
  description: 'インド輸出物販管理システム',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '物販管理',
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning className="h-full">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(() => {});
              }
            `,
          }}
        />
      </head>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  )
}
