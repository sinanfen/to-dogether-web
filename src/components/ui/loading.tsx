import { clsx } from 'clsx'

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'overlay'
  className?: string
}

export function Loading({ size = 'md', variant = 'spinner', className }: LoadingProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  const spinnerClasses = clsx(
    'animate-spin rounded-full border-2 border-gray-300 border-t-primary-600',
    sizes[size],
    className
  )

  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className={spinnerClasses} />
      </div>
    )
  }

  return <div className={spinnerClasses} />
}

export function LoadingPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loading size="lg" />
        <p className="mt-4 text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export function LoadingOverlay({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <Loading size="lg" />
      </div>
      {children}
    </div>
  )
} 