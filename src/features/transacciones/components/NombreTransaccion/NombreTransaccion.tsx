import { ExternalLink } from 'lucide-react'

interface NombreTransaccionProps {
  nombre: string
  enlace: string | null
}

export function NombreTransaccion({ nombre, enlace }: NombreTransaccionProps) {
  if (enlace === null) {
    return <span>{nombre}</span>
  }

  const corte = nombre.lastIndexOf(' ') + 1

  return (
    <a
      href={enlace}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
    >
      {nombre.slice(0, corte)}
      <span className="whitespace-nowrap">
        {nombre.slice(corte)}
        <ExternalLink aria-hidden="true" className="ml-1 inline size-3.5 align-middle" />
      </span>
      <span className="sr-only"> (se abre en una pestaña nueva)</span>
    </a>
  )
}
