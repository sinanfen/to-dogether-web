'use client'

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
  // Dropdown kaldırıldı, döngüsel buton eklendi
  const currentIndex = priorityOptions.findIndex(option => option.value === value)
  const nextPriority = priorityOptions[(currentIndex + 1) % priorityOptions.length].value
  const selectedOption = priorityOptions[currentIndex]

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(nextPriority)}
      disabled={disabled}
      className={`flex items-center justify-center px-2 py-1 rounded-lg border-2 bg-white text-gray-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${compact ? 'min-w-[40px]' : 'min-w-[48px]'} ${selectedOption ? `border-${selectedOption.value === 'low' ? 'green' : selectedOption.value === 'medium' ? 'yellow' : 'red'}-300` : 'border-gray-300'} ${className}`}
      title={selectedOption.label}
    >
      <span className="text-base mr-1">{selectedOption.icon}</span>
      <span className="capitalize hidden sm:inline">{selectedOption.label}</span>
    </button>
  )
} 