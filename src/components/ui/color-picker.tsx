import { useState } from 'react'
import { clsx } from 'clsx'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  className?: string
}

const predefinedColors = [
  { name: 'Mor', value: '#8B5CF6' },
  { name: 'Pembe', value: '#EC4899' },
  { name: 'Mavi', value: '#3B82F6' },
  { name: 'Yeşil', value: '#10B981' },
  { name: 'Kırmızı', value: '#EF4444' },
  { name: 'Turuncu', value: '#F59E0B' },
  { name: 'İndigo', value: '#6366F1' },
  { name: 'Zümrüt', value: '#059669' },
  { name: 'Gül', value: '#F43F5E' },
  { name: 'Turkuaz', value: '#06B6D4' },
  { name: 'Menekşe', value: '#7C3AED' },
  { name: 'Kehribar', value: '#D97706' },
]

// Hex validation function
const isValidHex = (hex: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
}

// Normalize hex (convert 3-digit to 6-digit)
const normalizeHex = (hex: string): string => {
  if (hex.length === 4) {
    return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
  }
  return hex.toUpperCase()
}

export function ColorPicker({ value, onChange, label, className }: ColorPickerProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customColor, setCustomColor] = useState(value)
  const [hexInput, setHexInput] = useState(value)
  const [hexError, setHexError] = useState<string | null>(null)

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color)
    setHexInput(color)
    setHexError(null)
    onChange(color)
  }

  const handleHexInputChange = (inputValue: string) => {
    setHexInput(inputValue)
    
    // Clear error when user starts typing
    if (hexError) setHexError(null)
    
    // Auto-add # if missing
    let processedValue = inputValue
    if (processedValue && !processedValue.startsWith('#')) {
      processedValue = '#' + processedValue
    }
    
    // Validate and update if valid
    if (processedValue.length >= 4) {
      if (isValidHex(processedValue)) {
        const normalizedHex = normalizeHex(processedValue)
        setCustomColor(normalizedHex)
        onChange(normalizedHex)
        setHexError(null)
      } else {
        setHexError('Geçersiz hex renk kodu')
      }
    }
  }

  const handleHexInputBlur = () => {
    // Final validation on blur
    if (hexInput && !isValidHex(hexInput)) {
      setHexError('Lütfen geçerli bir hex renk kodu girin (örn: #FF0000)')
      setHexInput(value) // Reset to current valid value
    }
  }

  return (
    <div className={clsx('space-y-4', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      {/* Current Color Display */}
      <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
        <div 
          className="w-10 h-10 rounded-xl border-2 border-white shadow-lg ring-1 ring-gray-200"
          style={{ backgroundColor: value }}
        />
        <div>
          <p className="text-sm font-semibold text-gray-900">Seçilen Renk</p>
          <p className="text-xs text-gray-500 font-mono">{value}</p>
        </div>
      </div>

      {/* Predefined Colors Grid */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-4">Popüler Renkler</p>
        <div className="grid grid-cols-6 gap-3">
          {predefinedColors.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => onChange(color.value)}
              className={clsx(
                'relative w-12 h-12 rounded-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 group',
                value === color.value 
                  ? 'ring-2 ring-purple-500 shadow-lg scale-105' 
                  : 'hover:shadow-lg'
              )}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {value === color.value && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Section */}
      <div className="border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className="flex items-center space-x-2 text-sm font-medium text-purple-600 hover:text-purple-500 transition-all duration-200 hover:bg-purple-50 px-3 py-2 rounded-lg group"
        >
          <svg 
            className={clsx(
              'w-4 h-4 transition-transform duration-300',
              showCustom ? 'rotate-90' : 'rotate-0'
            )} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span>Özel Renk</span>
        </button>
        
        <div className={clsx(
          'overflow-hidden transition-all duration-300 ease-out',
          showCustom ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0'
        )}>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="space-y-4">
              {/* Color Preview */}
              <div className="flex items-center space-x-3">
                <div 
                  className="w-16 h-16 rounded-xl border-2 border-gray-200 shadow-inner"
                  style={{ backgroundColor: customColor }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-1">Önizleme</p>
                  <p className="text-xs text-gray-500">Özel renginizin canlı önizlemesi</p>
                </div>
              </div>

              {/* Color Input Controls */}
              <div className="grid grid-cols-2 gap-3">
                {/* Native Color Picker */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Renk Seçici
                  </label>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer hover:border-purple-400 transition-colors"
                  />
                </div>

                {/* Hex Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Hex Kodu
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={hexInput}
                      onChange={(e) => handleHexInputChange(e.target.value)}
                      onBlur={handleHexInputBlur}
                      placeholder="#FF0000"
                      maxLength={7}
                      className={clsx(
                        'w-full h-12 px-3 py-2 border rounded-lg font-mono text-sm transition-all duration-200 focus:ring-2 focus:ring-offset-1',
                        hexError 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400'
                      )}
                    />
                    {hexError && (
                      <div className="absolute -bottom-6 left-0 text-xs text-red-600 animate-fade-in">
                        {hexError === 'Invalid hex color code' ? 'Geçersiz hex renk kodu' : 
                         hexError === 'Please enter a valid hex color (e.g., #FF0000)' ? 'Lütfen geçerli bir hex renk kodu girin (örn: #FF0000)' : 
                         hexError}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    if (isValidHex(customColor)) {
                      onChange(customColor)
                      setShowCustom(false)
                    }
                  }}
                  disabled={!!hexError || !isValidHex(customColor)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
                >
                  Özel Rengi Uygula
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 