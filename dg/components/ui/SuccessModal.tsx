'use client'

import { Button } from './button'
import { CheckCircle2 } from 'lucide-react'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  onConfirm?: () => void
  confirmText?: string
}

export default function SuccessModal({ 
  isOpen, 
  onClose, 
  title = 'Sucesso!', 
  message,
  onConfirm,
  confirmText = 'Entendi'
}: SuccessModalProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 p-6 rounded-lg shadow-xl border bg-white">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 text-center">{title}</h3>
        </div>
        
        {/* Message */}
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed text-center">{message}</p>
        </div>
        
        {/* Actions */}
        <div className="flex justify-center">
          <Button
            onClick={handleConfirm}
            className="bg-[#0B7A48] hover:bg-[#0B7A48]/90 text-white px-6"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

