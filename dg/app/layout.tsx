import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextAuthProvider } from '@/providers/NextAuthProvider'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as ReactHotToastToaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DG - Gestão Financeira para Confeiteiros',
  description: 'Sistema de gestão financeira para Confeiteiros',
  icons: {
    icon: '/images/favicon.ico',
    apple: '/images/logo.png',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
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