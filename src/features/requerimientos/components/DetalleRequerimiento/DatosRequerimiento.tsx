import type { ReactNode } from 'react'
import { InsigniaEstadoRequerimiento } from '@/features/requerimientos/components/InsigniaEstadoRequerimiento'
import { InsigniaVigencia } from '@/features/requerimientos/components/InsigniaVigencia'
import {
  EnlaceCarpeta,
  FechaCivil,
  Instante,
  SinDato,
} from '@/features/requerimientos/components/Valores'
import type { Requerimiento } from '@/features/requerimientos/types/requerimiento.types'
import { formatearCantidad, formatearSolicitante } from '@/features/requerimientos/utils/formato'
import {
  ETIQUETA_IDENTIFICADOR,
  ETIQUETAS_CAMPO,
} from '@/features/requerimientos/utils/trazabilidad'
import { cn } from '@/utils/cn'

interface Dato {
  etiqueta: string
  valor: ReactNode
  anchoCompleto?: boolean
}

function textoOpcional(valor: string | null): ReactNode {
  return valor ?? <SinDato />
}

export function DatosRequerimiento({ requerimiento }: { requerimiento: Requerimiento }) {
  const datos: Dato[] = [
    { etiqueta: 'Solicitante', valor: formatearSolicitante(requerimiento.solicitante) },
    { etiqueta: ETIQUETA_IDENTIFICADOR, valor: requerimiento.identificador },
    { etiqueta: 'Vigencia', valor: <InsigniaVigencia eliminado={requerimiento.eliminado} /> },
    { etiqueta: ETIQUETAS_CAMPO.materiales, valor: requerimiento.materiales },
    {
      etiqueta: ETIQUETAS_CAMPO.descripcion,
      valor: textoOpcional(requerimiento.descripcion),
      anchoCompleto: true,
    },
    { etiqueta: ETIQUETAS_CAMPO.cantidad, valor: formatearCantidad(requerimiento.cantidad) },
    {
      etiqueta: ETIQUETAS_CAMPO.estado,
      valor: <InsigniaEstadoRequerimiento estado={requerimiento.estado} />,
    },
    {
      etiqueta: ETIQUETAS_CAMPO.modalidad,
      valor: textoOpcional(requerimiento.modalidad?.label ?? null),
    },
    { etiqueta: ETIQUETAS_CAMPO.ordenDeCompra, valor: textoOpcional(requerimiento.ordenDeCompra) },
    {
      etiqueta: ETIQUETAS_CAMPO.fechaMaximaLlegada,
      valor: <FechaCivil valor={requerimiento.fechaMaximaLlegada} />,
    },
    {
      etiqueta: ETIQUETAS_CAMPO.fechaLlegada,
      valor: <FechaCivil valor={requerimiento.fechaLlegada} />,
    },
    {
      etiqueta: ETIQUETAS_CAMPO.carpeta,
      valor:
        requerimiento.carpeta === null ? (
          <SinDato />
        ) : (
          <EnlaceCarpeta url={requerimiento.carpeta}>Abrir carpeta</EnlaceCarpeta>
        ),
    },
    { etiqueta: 'Última actualización', valor: <Instante valor={requerimiento.actualizadoEn} /> },
    {
      etiqueta: ETIQUETAS_CAMPO.observaciones,
      valor: textoOpcional(requerimiento.observaciones),
      anchoCompleto: true,
    },
  ]

  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {datos.map(({ etiqueta, valor, anchoCompleto }) => (
        <div key={etiqueta} className={cn(anchoCompleto && 'sm:col-span-2')}>
          <dt className="text-xs font-semibold text-mercury-600">{etiqueta}</dt>
          <dd className="mt-1 text-sm text-mercury-900">{valor}</dd>
        </div>
      ))}
    </dl>
  )
}
