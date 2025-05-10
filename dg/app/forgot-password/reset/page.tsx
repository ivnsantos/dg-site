'use client'

import { Suspense } from 'react'
import { ResetForm } from './reset-form'

export default function ResetPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ResetForm />
    </Suspense>
  )
} 