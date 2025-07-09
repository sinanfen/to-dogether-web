import { useState } from 'react'
import { clsx } from 'clsx'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  className?: string
}

const predefinedColors = [
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Violet', value: '#7C3AED' },
  { name: 'Amber', value: '#D97706' },
]

export function ColorPicker({ value, onChange, label, className }: ColorPickerProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customColor, setCustomColor] = useState(value)

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color)
    onChange(color)
  }

  return (
    <div className={clsx('space-y-3', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      {/* Current Color Display */}
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <div 
          className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
          style={{ backgroundColor: value }}
        />
        <div>
          <p className="text-sm font-medium text-gray-900">Selected Color</p>
          <p className="text-xs text-gray-500">{value}</p>
        </div>
      </div>

      {/* Predefined Colors Grid */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Choose from popular colors:</p>
        <div className="grid grid-cols-6 gap-3">
          {predefinedColors.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => onChange(color.value)}
              className={clsx(
                'w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500',
                value === color.value 
                  ? 'border-gray-800 ring-2 ring-gray-400' 
                  : 'border-white shadow-md hover:shadow-lg'
              )}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Custom Color Section */}
      <div className="border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className="text-sm font-medium text-purple-600 hover:text-purple-500 transition-colors"
        >
          {showCustom ? '▼' : '▶'} Custom Color
        </button>
        
        {showCustom && (
          <div className="mt-3 space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  placeholder="#000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 