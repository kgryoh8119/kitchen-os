import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KitchenOS — 料理スケジューラ',
  description: '料理をプロジェクト管理として扱う。複数メニューの調理を自動スケジューリング。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
