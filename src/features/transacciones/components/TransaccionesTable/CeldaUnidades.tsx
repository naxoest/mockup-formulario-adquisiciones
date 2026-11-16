import type { ResumenSolicitudes } from '../../types/transaccion.types'

export function CeldaUnidades({ solicitudes }: { solicitudes: ResumenSolicitudes }) {
  return (
    <span className="flex items-stretch gap-3.5">
      <span className="flex flex-col leading-tight">
        <span className="text-base font-medium text-primary-700">{solicitudes.unidades}</span>
        <span className="text-xs text-mercury-500">
          {solicitudes.unidades === 1 ? 'unidad' : 'unidades'}
        </span>
      </span>
      <span className="flex flex-col border-l border-mercury-200 pl-3.5 leading-tight">
        <span className="text-base font-medium text-mercury-900">{solicitudes.carreras}</span>
        <span className="text-xs text-mercury-500">
          {solicitudes.carreras === 1 ? 'carrera' : 'carreras'}
        </span>
      </span>
    </span>
  )
}
