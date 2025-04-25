import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'



const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MemorEase',
  description: 'Study and Memory retention tool',
  icons: {
    icon: 'images/MemorEase_Logo_NoWords.png'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
       {children}
        </body>
    </html>
  )
}
