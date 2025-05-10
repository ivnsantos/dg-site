'use client'

import { useState, ReactNode } from 'react'
import { ChevronUpIcon, ChevronDownIcon, SparklesIcon } from '@heroicons/react/24/outline'

// Componente para seções expansíveis
interface ExpandableSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  comingSoon?: boolean;
  accentColor?: string;
}

export function ExpandableSection({ 
  title, 
  icon, 
  children, 
  comingSoon = false,
  accentColor = 'bg-gradient-to-r from-purple-500 to-pink-500'
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
      <div 
        className="p-6 border-b flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {comingSoon && (
            <span className={`text-xs px-2 py-0.5 text-white rounded-full shadow-sm ml-2 ${accentColor}`}>
              Em breve
              <SparklesIcon className="h-3 w-3 inline ml-1" />
            </span>
          )}
        </div>
        <button className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
          {isExpanded ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
        </button>
      </div>
      {isExpanded && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  )
} 