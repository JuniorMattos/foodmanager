import React from 'react'

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

  const sizes: Record<ButtonSize, string> = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-primary-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  }

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <button
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabledClasses} ${className}`.trim()}
      {...props}
    />
  )
}
