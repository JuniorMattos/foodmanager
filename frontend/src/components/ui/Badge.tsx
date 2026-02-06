import React from 'react'

type BadgeVariant = 'default' | 'secondary'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({ variant = 'default', className = '', ...props }: BadgeProps) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium'
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-gray-900 text-white',
    secondary: 'bg-gray-100 text-gray-800',
  }

  return <span className={`${base} ${variants[variant]} ${className}`.trim()} {...props} />
}
