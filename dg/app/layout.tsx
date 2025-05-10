import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextAuthProvider } from '@/providers/NextAuthProvider'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as ReactHotToastToaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DG - Gestão para Doces e Salgados',
  description: 'Sistema de gestão financeira para confeiteiros',
  icons: {
    icon: '/images/favicon.ico',
    apple: '/images/logo.png',
  }
}

// Configuração para páginas dinâmicas
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <NextAuthProvider>
          <ReactHotToastToaster position="top-right" />
          {children}
        </NextAuthProvider>
        <Toaster />
      </body>
    </html>
  )
} 