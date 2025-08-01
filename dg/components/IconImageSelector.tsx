'use client'

import React from 'react'
import { Label } from './ui/label'

interface IconImageSelectorProps {
  selectedIcon: string
  selectedImageUrl: string
  onIconChange: (icon: string) => void
  onImageUrlChange: (imageUrl: string) => void
  iconOptions?: string[]
  imageOptions?: Array<{
    value: string
    label: string
    preview: string
  }>
}

export default function IconImageSelector({
  selectedIcon,
  selectedImageUrl,
  onIconChange,
  onImageUrlChange,
  iconOptions = [
    '🔗', '📱', '💻', '📧', '📷', '🎵', '📺', '📚', '🛒', '💰', 
    '🎨', '🍕', '☕', '🍰', '🎂', '🍪', '🍦', '🥤', '🍷', '🍺',
    '📞', '💬', '📢', '⭐', '❤️', '👍', '🎉', '🎊', '🎈', '🎁'
  ],
  imageOptions = [
    { value: '/images/ifood.png', label: 'iFood', preview: '/images/ifood.png' },
    { value: '/images/insta.png', label: 'Instagram', preview: '/images/insta.png' },
    { value: '/images/pediu comeu.jpg', label: 'Pediu Comeu', preview: '/images/pediu comeu.jpg' },
    { value: '/images/delivery.jpg', label: 'Delivery', preview: '/images/delivery.jpg' }
  ]
}: IconImageSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Seleção de Ícone */}
      <div>
        <Label className="block mb-2">Ícone:</Label>
        <select
          value={selectedIcon}
          onChange={(e) => onIconChange(e.target.value)}
          className="w-full border border-input bg-background px-3 py-2 rounded-md"
        >
          {iconOptions.map((icon, i) => (
            <option key={i} value={icon}>
              {icon}
            </option>
          ))}
        </select>
      </div>

      {/* Opção de Imagem */}
      <div>
        <Label className="block mb-2">Ou escolha uma imagem:</Label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div
            className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
              selectedImageUrl === '' ? 'border-[#0B7A48] bg-[#0B7A48]/10' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onImageUrlChange('')}
          >
            <div className="text-center">
              <span className="text-2xl">{selectedIcon}</span>
              <p className="text-xs mt-1 text-gray-600">Usar ícone</p>
            </div>
          </div>
          
          {imageOptions.map((image, imgIndex) => (
            <div
              key={imgIndex}
              className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                selectedImageUrl === image.value ? 'border-[#0B7A48] bg-[#0B7A48]/10' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onImageUrlChange(image.value)}
            >
              <div className="text-center">
                <img 
                  src={image.preview} 
                  alt={image.label}
                  className="w-8 h-8 mx-auto object-contain"
                />
                <p className="text-xs mt-1 text-gray-600">{image.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 