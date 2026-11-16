import { formatShortDate, formatWeekday } from '@/utils/date'

function aFechaLocal(fecha: string): Date {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

export function CeldaFecha({ fecha }: { fecha: string }) {
  const valor = aFechaLocal(fecha)

  return (
    <span className="flex flex-col leading-tight">
      <span className="text-xs text-mercury-500 capitalize">{formatWeekday(valor)}</span>
      <span className="text-sm font-medium">{formatShortDate(valor)}</span>
    </span>
  )
}
