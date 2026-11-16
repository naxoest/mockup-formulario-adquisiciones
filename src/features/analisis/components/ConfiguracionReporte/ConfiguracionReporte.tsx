import { useId, useState } from 'react'
import { FileText, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { Input } from '@/components/ui/Input'
import type { FiltrosReporte } from '@/features/analisis/types/reporte.types'

interface ConfiguracionReporteProps {
  filtros: FiltrosReporte
  cargando: boolean
  descargando: boolean
  onAnalizar: (filtros: FiltrosReporte) => void
  onDescargar: () => void
}

const aIso = (fecha: Date | null): string | null => {
  if (!fecha) return null
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

const aFecha = (iso: string | null): Date | null => {
  if (!iso) return null
  const [anio, mes, dia] = iso.split('-').map(Number)
  if (!anio || !mes || !dia) return null
  return new Date(anio, mes - 1, dia)
}

export function ConfiguracionReporte({
  filtros,
  cargando,
  descargando,
  onAnalizar,
  onDescargar,
}: ConfiguracionReporteProps) {
  const idTitulo = useId()
  const idEtiqueta = useId()
  const idDesde = useId()
  const idHasta = useId()

  const [titulo, setTitulo] = useState(filtros.titulo ?? '')
  const [etiquetaPeriodo, setEtiquetaPeriodo] = useState(filtros.etiquetaPeriodo ?? '')
  const [desde, setDesde] = useState<Date | null>(aFecha(filtros.desde))
  const [hasta, setHasta] = useState<Date | null>(aFecha(filtros.hasta))

  const analizar = () => {
    onAnalizar({
      desde: aIso(desde),
      hasta: aIso(hasta),
      titulo: titulo.trim() || null,
      etiquetaPeriodo: etiquetaPeriodo.trim() || null,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={idTitulo} className="text-xs font-medium text-mercury-700">
            Título del reporte
          </label>
          <Input
            id={idTitulo}
            value={titulo}
            onChange={(evento) => setTitulo(evento.target.value)}
            placeholder="Reporte de adquisiciones"
            maxLength={160}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={idEtiqueta} className="text-xs font-medium text-mercury-700">
            Periodo (etiqueta)
          </label>
          <Input
            id={idEtiqueta}
            value={etiquetaPeriodo}
            onChange={(evento) => setEtiquetaPeriodo(evento.target.value)}
            placeholder="agosto de 2026"
            maxLength={80}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={idDesde} className="text-xs font-medium text-mercury-700">
            Fecha inicio
          </label>
          <DatePicker
            id={idDesde}
            value={desde}
            onChange={setDesde}
            maxDate={hasta ?? undefined}
            placeholder="Sin límite inicial"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={idHasta} className="text-xs font-medium text-mercury-700">
            Fecha fin
          </label>
          <DatePicker
            id={idHasta}
            value={hasta}
            onChange={setHasta}
            minDate={desde ?? undefined}
            placeholder="Sin límite final"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-mercury-200 pt-4">
        <Button variant="primary" loading={cargando} onClick={analizar}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Analizar
        </Button>
        <Button variant="secondary" loading={descargando} disabled={cargando} onClick={onDescargar}>
          <FileText className="size-4" aria-hidden="true" />
          Descargar PDF
        </Button>
      </div>
    </div>
  )
}
