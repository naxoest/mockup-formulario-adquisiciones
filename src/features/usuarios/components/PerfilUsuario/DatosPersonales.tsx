import { useId } from 'react'
import { Card } from '@/components/ui/Card'
import { formatRun } from '@/utils/run'
import { Dato } from './Dato'

interface DatosPersonalesProps {
  run: number
  digitoVerificador: string
  correoInstitucional: string | null
  correoEstudiantil: string | null
}

export function DatosPersonales({
  run,
  digitoVerificador,
  correoInstitucional,
  correoEstudiantil,
}: DatosPersonalesProps) {
  const idTitulo = useId()

  return (
    <Card as="section" aria-labelledby={idTitulo}>
      <Card.Header>
        <h2 id={idTitulo} className="text-base font-semibold text-mercury-900">
          Datos personales
        </h2>
      </Card.Header>
      <Card.Body className="pt-0">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Dato etiqueta="RUN">
            <span className="tabular-nums">{formatRun(run, digitoVerificador)}</span>
          </Dato>
          <Dato etiqueta="Correo institucional">{correoInstitucional ?? 'Sin registro'}</Dato>
          {correoEstudiantil !== null && (
            <Dato etiqueta="Correo estudiantil">{correoEstudiantil}</Dato>
          )}
        </dl>
      </Card.Body>
    </Card>
  )
}
