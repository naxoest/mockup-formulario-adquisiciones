import { cn } from '@/utils/cn'
import { proporcionesDeBarra, type EstadoConciliacion } from '../../utils/conciliacion'
import { clasesSegmentoEstaOrden, clasesSegmentoOtrasOrdenes } from './BarraConciliacion.utils'

export function BarraConciliacion({
  precomprometido,
  comprometido,
  estado,
  aporte,
}: {
  precomprometido: number | null
  comprometido: number
  estado: EstadoConciliacion
  aporte?: number
}) {
  if (precomprometido === null) {
    return <span aria-hidden="true" className="block h-1.5" />
  }

  const { otrasOrdenes, estaOrden, exceso } = proporcionesDeBarra(
    precomprometido,
    comprometido,
    aporte,
  )

  return (
    <span aria-hidden="true" className="flex h-1.5 overflow-hidden rounded-full bg-mercury-200">
      {otrasOrdenes > 0 && (
        <span
          className={cn('h-full', clasesSegmentoOtrasOrdenes[estado])}
          style={{ width: `${otrasOrdenes}%` }}
        />
      )}
      {estaOrden > 0 && (
        <span
          className={cn('h-full', clasesSegmentoEstaOrden[estado])}
          style={{ width: `${estaOrden}%` }}
        />
      )}
      {exceso > 0 && <span className="h-full bg-scarlet-600" style={{ width: `${exceso}%` }} />}
    </span>
  )
}
