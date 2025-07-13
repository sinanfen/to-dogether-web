'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon } from './icons'

interface CategoryDropdownProps {
  value: string
  onChange: (category: string) => void
  disabled?: boolean
  className?: string
}

const categoryOptions = [
  { value: 'personal', label: 'Personal', icon: '👤' },
  { value: 'home', label: 'Home', icon: '🏠' },
  { value: 'work', label: 'Work', icon: '💼' },
  { value: 'shopping', label: 'Shopping', icon: '🛒' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'health', label: 'Health', icon: '💪' },
  { value: 'other', label: 'Other', icon: '📝' }
] as const

export default function CategoryDropdown({ 
  value, 
  onChange, 
  disabled = false, 
  className = ''
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = categoryOptions.find(option => option.value === value)

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
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full px-3 py-2 rounded-lg border border-gray-300 
          bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 
          focus:border-transparent transition-all duration-200 hover:border-gray-400
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className="flex items-center space-x-2">
          <span>{selectedOption?.icon}</span>
          <span className="capitalize">{selectedOption?.label}</span>
        </span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {categoryOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`
                w-full flex items-center space-x-2 px-3 py-2 text-sm text-left
                hover:bg-gray-50 transition-colors duration-150
                ${value === option.value ? 'bg-purple-50 text-purple-700' : 'text-gray-900'}
              `}
            >
              <span>{option.icon}</span>
              <span className="capitalize">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 