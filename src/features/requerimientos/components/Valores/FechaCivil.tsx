import { formatearFechaCivil } from '@/features/requerimientos/utils/formato'
import { SinDato } from './SinDato'

export function FechaCivil({ valor }: { valor: string | null }) {
  if (valor === null) {
    return <SinDato />
  }

  return (
    <time dateTime={valor} className="whitespace-nowrap">
      {formatearFechaCivil(valor)}
    </time>
  )
}
