import { PenLine } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { RegistroBitacora } from '../../types/historial.types'
import { formatearFechaEvento } from './TransaccionHistorial.utils'

export function FilaRegistro({
  registro,
  esUltimo,
}: {
  registro: RegistroBitacora
  esUltimo: boolean
}) {
  return (
    <li className={cn('relative px-5 py-4', !esUltimo && 'border-b border-mercury-100')}>
      <span
        aria-hidden="true"
        className={cn(
          'absolute left-[1.5625rem] top-0 w-px bg-mercury-300',
          esUltimo ? 'h-3' : 'h-full',
        )}
      />

      <div className="relative pl-8">
        <span className="absolute left-0 top-1 flex size-6 -translate-x-[0.4375rem] items-center justify-center rounded-full border border-mercury-300 bg-white text-mercury-500 ring-4 ring-white">
          <PenLine aria-hidden="true" strokeWidth={2} className="size-3" />
        </span>

        <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-mercury-500">
          Registro
        </p>

        <h4 className="mt-0.5 text-[0.9375rem] font-bold text-mercury-900">{registro.titulo}</h4>

        {registro.observacion.length > 0 && (
          <p className="mt-1 text-xs leading-relaxed text-mercury-600">{registro.observacion}</p>
        )}

        <p className="mt-1 text-xs text-mercury-500">
          {formatearFechaEvento(registro.fecha)} · {registro.autor}
        </p>
      </div>
    </li>
  )
}
