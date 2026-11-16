import { formatearInstante } from '@/features/requerimientos/utils/formato'

export function Instante({ valor }: { valor: string }) {
  return (
    <time dateTime={valor} className="whitespace-nowrap">
      {formatearInstante(valor)}
    </time>
  )
}
