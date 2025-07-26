// components/Input.tsx
import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input(props: InputProps) {
  return (
    <input
      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand-500 focus:border-brand-500"
      {...props}
    />
  )
}
