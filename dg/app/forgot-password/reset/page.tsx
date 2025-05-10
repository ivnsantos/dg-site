'use client'

import { Suspense } from 'react'
import { ResetForm } from './reset-form'

export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ResetForm />
    </Suspense>
  )
} 