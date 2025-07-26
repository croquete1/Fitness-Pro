// components/Container.tsx
import React from 'react'

export function Container({ children }: { children: React.ReactNode }) {
  return <div className="max-w-3xl mx-auto px-4">{children}</div>
}
