import { useState } from 'react'

interface ErrorModalState {
  isOpen: boolean
  title: string
  message: string
  type: 'error' | 'warning' | 'info'
}

export function useErrorModal() {
  const [modalState, setModalState] = useState<ErrorModalState>({
    isOpen: false,
    title: 'Erro',
    message: '',
    type: 'error'
  })

  const showError = (message: string, title: string = 'Erro', type: 'error' | 'warning' | 'info' = 'error') => {
    setModalState({
      isOpen: true,
      title,
      message,
      type
    })
  }

  const hideError = () => {
    setModalState(prev => ({
      ...prev,
      isOpen: false
    }))
  }

  return {
    modalState,
    showError,
    hideError
  }
} 