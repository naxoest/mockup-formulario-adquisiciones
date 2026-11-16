import type { ReactNode } from 'react'
import type { CabeceraHistorial } from '../../types/historial.types'
import { NombreTransaccion } from '@/features/transacciones/components/NombreTransaccion'
import { descripcionContenido, formatearFecha } from './TransaccionHistorial.utils'

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-mercury-500">
        {etiqueta}
      </dt>
      <dd className="mt-0.5 text-sm text-mercury-800">{children}</dd>
    </div>
  )
}

export function EncabezadoTransaccion({ cabecera }: { cabecera: CabeceraHistorial }) {
  const { principal, apoyo } = cabecera.analistas

  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-mercury-500" translate="no">
        {cabecera.codigo}
      </p>
      <p className="mt-1 text-base font-semibold text-mercury-900">
        <NombreTransaccion nombre={cabecera.nombre} enlace={cabecera.linkCarpetaAntecedentes} />
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-mercury-200 pt-4 sm:grid-cols-4">
        <Dato etiqueta="Modalidad">{cabecera.modalidad}</Dato>

        <Dato etiqueta="Contiene">{descripcionContenido(cabecera)}</Dato>
        <Dato etiqueta="Abierta desde">
          <time dateTime={cabecera.fechaApertura}>{formatearFecha(cabecera.fechaApertura)}</time>
        </Dato>
        <Dato etiqueta="Analista principal">
          {principal === null ? 'Sin principal' : principal.nombre}
        </Dato>
        <Dato etiqueta="Analistas de apoyo">
          {apoyo.length === 0
            ? 'Sin analistas de apoyo'
            : apoyo.map((analista) => analista.nombre).join(', ')}
        </Dato>
      </dl>
    </div>
  )
}
