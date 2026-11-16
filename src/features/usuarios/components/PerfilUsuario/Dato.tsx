import type { ReactNode } from 'react'

interface DatoProps {
  etiqueta: string
  children: ReactNode
}

export function Dato({ etiqueta, children }: DatoProps) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-mercury-500">{etiqueta}</dt>
      <dd className="break-words text-sm text-mercury-900">{children}</dd>
    </div>
  )
}
