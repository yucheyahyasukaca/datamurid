import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Data Murid - SMA Negeri 1 Pati',
  description: 'Portal Resmi Data Murid SMA Negeri 1 Pati',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
