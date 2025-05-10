'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { VerifyForm } from './verify-form'

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <VerifyForm />
    </Suspense>
  )
} 