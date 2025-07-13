'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon } from './icons'

interface PriorityDropdownProps {
  value: 'low' | 'medium' | 'high'
  onChange: (priority: 'low' | 'medium' | 'high') => void
  disabled?: boolean
  className?: string
  compact?: boolean
}

const priorityOptions = [
  { value: 'low', label: 'Low', icon: '🟢', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  { value: 'medium', label: 'Medium', icon: '🟡', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  { value: 'high', label: 'High', icon: '🔴', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
] as const

export default function PriorityDropdown({ 
  value, 
  onChange, 
  disabled = false, 
  className = '',
  compact = false 
}: PriorityDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = priorityOptions.find(option => option.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className={`relative z-[9999] ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between px-3 py-2 rounded-lg border-2
          bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 
          focus:border-transparent transition-all duration-200 hover:border-gray-400
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${compact ? 'min-w-[80px]' : 'min-w-[100px]'}
          ${selectedOption ? `border-${selectedOption.value === 'low' ? 'green' : selectedOption.value === 'medium' ? 'yellow' : 'red'}-300` : 'border-gray-300'}
        `}
      >
        <span className="flex items-center space-x-1">
          <span>{selectedOption?.icon}</span>
          {!compact && <span className="capitalize font-medium">{selectedOption?.label}</span>}
        </span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-[9999]">
          {priorityOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`
                w-full flex items-center space-x-2 px-3 py-2 text-sm text-left
                transition-all duration-150 first:rounded-t-lg last:rounded-b-lg
                ${value === option.value 
                  ? `${option.bgColor} ${option.color} font-semibold border-l-4 border-l-${option.value === 'low' ? 'green' : option.value === 'medium' ? 'yellow' : 'red'}-500` 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <span className="text-base">{option.icon}</span>
              {!compact && <span className="capitalize">{option.label}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 