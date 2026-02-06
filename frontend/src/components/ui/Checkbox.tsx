import React from 'react'

export interface CheckboxProps {
  id?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
}

export function Checkbox({ id, checked = false, onChange, disabled }: CheckboxProps) {
  return (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.checked)}
      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
    />
  )
}
