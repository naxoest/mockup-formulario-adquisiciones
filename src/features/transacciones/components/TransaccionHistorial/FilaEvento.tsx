import { ArrowRight, Home, MapPin, User } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatCLP } from '@/utils/currency'
import type { EventoEntidad } from '../../types/historial.types'
import {
  IconoUnidad,
  formatearFechaEvento,
  llaveEntidad,
  presentacionEntidad,
  presentacionPorTono,
} from './TransaccionHistorial.utils'

export function FilaEvento({ evento, esUltimo }: { evento: EventoEntidad; esUltimo: boolean }) {
  const tono = presentacionPorTono[evento.transicion.tono]
  const entidad = presentacionEntidad[evento.entidad.tipo]
  const IconoEntidad = entidad.Icono
  const IconoTono = tono.Icono
  const unidad = evento.contexto.unidad

  const detenido = evento.transicion.tono === 'detenido'
  const relacionadas = evento.contexto.relacionadas ?? []
  const hayContexto =
    relacionadas.length > 0 ||
    unidad !== undefined ||
    evento.contexto.campus !== undefined ||
    evento.contexto.proveedor !== undefined

  return (
    <li className={cn('relative px-5 py-5', !esUltimo && 'border-b border-mercury-100')}>
      <span
        aria-hidden="true"
        className={cn(
          'absolute left-[1.5625rem] top-0 w-px bg-mercury-200',
          esUltimo ? 'h-3' : 'h-full',
        )}
      />

      <div className="relative pl-8">
        <span
          className={cn(
            'absolute left-0 top-1 flex size-[1.375rem] -translate-x-1.5 items-center justify-center rounded-full ring-4 ring-white',
            tono.clasesMarcador,
          )}
        >
          <IconoTono aria-hidden="true" strokeWidth={tono.trazo} className="size-3" />
        </span>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-mercury-300 bg-white px-2 py-1 text-xs font-semibold text-mercury-800">
            <IconoEntidad aria-hidden="true" className="size-3.5 text-mercury-600" />
            <span>{entidad.etiqueta}</span>
            <span translate="no">{evento.entidad.codigo}</span>
          </span>
          <time dateTime={evento.fecha} className="text-xs tabular-nums text-mercury-600">
            {formatearFechaEvento(evento.fecha)}
          </time>
        </div>

        {hayContexto && (
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-mercury-600">
            {relacionadas.length > 0 && (
              <span className="flex flex-wrap items-center gap-2">
                <span className="shrink-0">{entidad.etiquetaRelacionadas}</span>
                {relacionadas.map((referencia) => {
                  const IconoRelacionada = presentacionEntidad[referencia.tipo].Icono
                  return (
                    <span
                      key={llaveEntidad(referencia)}
                      className="inline-flex items-center gap-1 rounded border border-mercury-200 bg-mercury-50 px-1.5 py-0.5 text-mercury-700"
                    >
                      <IconoRelacionada aria-hidden="true" className="size-3" />
                      <span translate="no">{referencia.codigo}</span>
                    </span>
                  )
                })}
              </span>
            )}

            {unidad && (
              <span className="inline-flex items-center gap-1">
                <IconoUnidad aria-hidden="true" className="size-3.5" />
                {unidad.nombre}
              </span>
            )}

            {evento.contexto.campus !== undefined && (
              <span className="inline-flex items-center gap-1">
                <MapPin aria-hidden="true" className="size-3.5" />
                {evento.contexto.campus}
              </span>
            )}

            {evento.contexto.proveedor !== undefined && (
              <span className="inline-flex items-center gap-1">
                <Home aria-hidden="true" className="size-3.5" />
                {evento.contexto.proveedor}
              </span>
            )}
          </p>
        )}

        <h4
          className={cn(
            'mt-2.5 text-[0.9375rem] font-semibold leading-snug',
            detenido ? 'text-scarlet-800' : 'text-mercury-900',
          )}
        >
          {evento.monto === null ? (
            evento.titulo
          ) : (
            <>
              {evento.titulo} <span className="tabular-nums">{formatCLP(evento.monto)}</span>
            </>
          )}
        </h4>

        <p className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {evento.transicion.anterior === null ? (
            <span className="text-mercury-600">Nace en estado</span>
          ) : (
            <>
              <span className="sr-only">Pasó de</span>
              <span className="rounded border border-mercury-200 bg-white px-2 py-0.5 text-mercury-600">
                {evento.transicion.anterior}
              </span>
              <ArrowRight
                aria-hidden="true"
                strokeWidth={2.5}
                className="size-3 text-mercury-600"
              />
              <span className="sr-only">a</span>
            </>
          )}
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-semibold',
              tono.clasesEstado,
            )}
          >
            <IconoTono aria-hidden="true" strokeWidth={tono.trazo} className="size-3" />
            {evento.transicion.posterior}
          </span>
        </p>

        <p
          className={cn(
            'mt-3 max-w-2xl rounded-md px-3.5 py-3 text-sm leading-relaxed',
            detenido
              ? 'border border-scarlet-200 bg-scarlet-50 text-mercury-800'
              : 'bg-mercury-50 text-mercury-700',
          )}
        >
          {evento.observacion}
        </p>

        <p className="mt-3 flex items-center gap-1.5 border-t border-mercury-100 pt-3 text-xs text-mercury-600">
          <User aria-hidden="true" className="size-3.5" />
          <span>Registrado por</span>
          <span className="font-semibold text-mercury-800">{evento.autor}</span>
        </p>
      </div>
    </li>
  )
}
