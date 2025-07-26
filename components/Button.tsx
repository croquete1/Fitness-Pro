// components/Button.tsx
import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline'
}

export function Button({ variant = 'primary', children, ...props }: ButtonProps) {
  const base = 'font-semibold rounded focus:outline-none focus:ring-2 focus:ring-offset-2'
  const styles = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-300',
    outline: 'border border-brand-500 text-brand-500 hover:bg-brand-50 focus:ring-brand-300',
  }

  return (
    <button className={`${base} ${styles[variant]}`} {...props}>
      {children}
    </button>
  )
}
