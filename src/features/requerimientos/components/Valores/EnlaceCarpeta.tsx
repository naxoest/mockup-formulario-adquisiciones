import type { ReactNode } from 'react'
import { FolderOpen } from 'lucide-react'

export function EnlaceCarpeta({ url, children }: { url: string; children: ReactNode }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
    >
      <FolderOpen aria-hidden="true" className="size-4 shrink-0" />
      <span>{children}</span>
      <span className="sr-only"> (se abre en una pestaña nueva)</span>
    </a>
  )
}
