import { useId, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { GrupoFiltro } from './TransaccionHistorial.utils'

const CLASES_BASE =
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'

const CLASES_ACTIVO = 'border-primary-700 bg-primary-700 text-white'

const CLASES_INACTIVO =
  'border-mercury-300 bg-white text-mercury-700 hover:border-primary-400 hover:bg-primary-50'

function BotonFiltro({
  activo,
  onClick,
  children,
}: {
  activo: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={cn(CLASES_BASE, activo ? CLASES_ACTIVO : CLASES_INACTIVO)}
    >
      {activo && <Check aria-hidden="true" strokeWidth={3} className="size-3 shrink-0" />}
      {children}
    </button>
  )
}

export function FiltroEntidades({
  grupos,
  seleccion,
  onAlternar,
  onLimpiar,
}: {
  grupos: GrupoFiltro[]
  seleccion: ReadonlySet<string>
  onAlternar: (clave: string) => void
  onLimpiar: () => void
}) {
  const idBase = useId()
  const sinFiltro = seleccion.size === 0

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span
          id={`${idBase}-todo`}
          className="w-24 shrink-0 text-[0.6875rem] font-semibold uppercase tracking-wider text-mercury-500"
        >
          Ver
        </span>
        <div role="group" aria-labelledby={`${idBase}-todo`} className="flex flex-wrap gap-1.5">
          <BotonFiltro activo={sinFiltro} onClick={onLimpiar}>
            Todo
          </BotonFiltro>
        </div>
      </div>

      {grupos.map((grupo) => (
        <div key={grupo.tipo} className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span
            id={`${idBase}-${grupo.tipo}`}
            className="w-24 shrink-0 text-[0.6875rem] font-semibold uppercase tracking-wider text-mercury-500"
          >
            {grupo.etiqueta}
          </span>
          <div
            role="group"
            aria-labelledby={`${idBase}-${grupo.tipo}`}
            className="flex flex-wrap gap-1.5"
          >
            {grupo.entidades.map((entidad) => (
              <BotonFiltro
                key={entidad.llave}
                activo={seleccion.has(entidad.llave)}
                onClick={() => onAlternar(entidad.llave)}
              >
                <span translate="no">{entidad.codigo}</span>
                {entidad.descriptor !== null && (
                  <span className="font-normal">· {entidad.descriptor}</span>
                )}
              </BotonFiltro>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
