import { CircleCheck } from 'lucide-react'
import type { Importacion } from '@/features/requerimientos/types/importacion.types'

function conteo(cantidad: number, singular: string, plural: string): string {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`
}

export function PasoResultado({ importacion }: { importacion: Importacion }) {
  const resumen = [
    conteo(importacion.filasNuevas, 'requerimiento nuevo', 'requerimientos nuevos'),
    conteo(importacion.filasRestauradas, 'requerimiento restaurado', 'requerimientos restaurados'),
    conteo(importacion.filasConCambios, 'requerimiento actualizado', 'requerimientos actualizados'),
    conteo(
      importacion.requerimientosEliminados,
      'requerimiento eliminado',
      'requerimientos eliminados',
    ),
  ]

  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <CircleCheck aria-hidden="true" className="size-12 text-jade-600" />
      <p className="text-lg font-semibold text-mercury-900">
        {`Importación #${importacion.id} confirmada`}
      </p>
      <ul className="flex flex-col gap-0.5 text-sm text-mercury-700">
        {resumen.map((linea) => (
          <li key={linea}>{linea}</li>
        ))}
      </ul>
      <p className="max-w-xl text-sm text-mercury-600">
        Cada creación, actualización, restauración y eliminación quedó registrada como un evento del
        requerimiento correspondiente.
      </p>
    </div>
  )
}
