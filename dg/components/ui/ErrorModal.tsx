'use client'

import React from 'react'
import { Button } from './button'
import { X, AlertTriangle } from 'lucide-react'

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  type?: 'error' | 'warning' | 'info'
}

export default function ErrorModal({ 
  isOpen, 
  onClose, 
  title = 'Erro', 
  message, 
  type = 'error' 
}: ErrorModalProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <X className="h-6 w-6 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />
      default:
        return <AlertTriangle className="h-6 w-6 text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-600 hover:bg-red-700'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700'
      default:
        return 'bg-blue-600 hover:bg-blue-700'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md mx-4 p-6 rounded-lg shadow-xl border ${getBgColor()}`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {getIcon()}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        
        {/* Message */}
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">{message}</p>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end">
          <Button
            onClick={onClose}
            className={`text-white ${getButtonColor()} transition-colors duration-200`}
          >
            Entendi
          </Button>
        </div>
      </div>
    </div>
  )
} 