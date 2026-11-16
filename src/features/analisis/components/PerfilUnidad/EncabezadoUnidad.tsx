import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { varianteCampus } from '@/features/analisis/components/RankingUnidades/columnas'
import type { UnidadPerfil } from '@/features/analisis/types/perfilUnidad.types'

interface EncabezadoUnidadProps {
  unidad?: UnidadPerfil
  cargando: boolean
}

export function EncabezadoUnidad({ unidad, cargando }: EncabezadoUnidadProps) {
  if (cargando || !unidad) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton width="40%" height={36} />
        <Skeleton width="25%" height={20} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold text-primary-900">{unidad.nombre}</h1>
      <div className="flex flex-wrap items-center gap-2 text-sm text-mercury-600">
        <Badge variant="info" size="sm">
          {unidad.tipo.label}
        </Badge>
        {unidad.sedes.map((sede) => (
          <Badge key={sede.value} variant={varianteCampus[sede.value] ?? 'neutral'} size="sm">
            {sede.label}
          </Badge>
        ))}
        <span>CR {unidad.cr}</span>
      </div>
    </div>
  )
}
