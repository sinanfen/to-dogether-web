import { forwardRef, type InputHTMLAttributes, useState } from 'react'
import { clsx } from 'clsx'
import { EyeIcon, EyeSlashIcon } from './icons'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  showPasswordToggle?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, showPasswordToggle, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [inputType, setInputType] = useState(type)

    const togglePasswordVisibility = () => {
      if (type === 'password') {
        setShowPassword(!showPassword)
        setInputType(showPassword ? 'password' : 'text')
      }
    }

    const isPasswordField = type === 'password' && showPasswordToggle

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-900">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={inputType}
            className={clsx(
              'flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
              isPasswordField && 'pr-10',
              error && 'border-red-300 focus:ring-red-500',
              className
            )}
            ref={ref}
            {...props}
          />
          {isPasswordField && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input } 