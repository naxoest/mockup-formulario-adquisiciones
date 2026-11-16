import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable } from '@/components/ui/DataTable'
import { construirFilaMonitoreo } from '@/features/transacciones/utils/criticidad'
import { calcularEvaluacion } from '@/mocks/handlers/monitoreo.derivacion'
import { columnasMonitoreo } from './columnas'
import type {
  FactoresCriticidad,
  FilaMonitoreo,
  RegistroMonitoreo,
} from '@/features/transacciones/types/monitoreo.types'

const referencia = new Date(2026, 7, 18)

function registro(transaccionId: number, factores: FactoresCriticidad | null): RegistroMonitoreo {
  return {
    transaccionId,
    nombre: `Proceso ${transaccionId}`,
    analista: null,
    evaluacion: factores === null ? null : calcularEvaluacion(factores),
    ultimoMovimiento: null,
    proximaAccion: null,
    fechaProximaRevision: null,
    bloqueadorPrincipal: null,
    escalarAJefatura: false,
    cerrado: false,
    observaciones: null,
  }
}

function fila(transaccionId: number, factores: FactoresCriticidad | null): FilaMonitoreo {
  return construirFilaMonitoreo(registro(transaccionId, factores), referencia)
}

const CRITICA = {
  impactoAcademico: 5,
  urgenciaTemporal: 5,
  exposicionInstitucional: 5,
  riesgoOperacional: 5,
} as const
const CONTROLADA = {
  impactoAcademico: 2,
  urgenciaTemporal: 2,
  exposicionInstitucional: 2,
  riesgoOperacional: 2,
} as const

const filas: FilaMonitoreo[] = [fila(1, CRITICA), fila(2, null), fila(3, CONTROLADA)]

function criticidadPorFila(): string[] {
  const [, ...cuerpo] = screen.getAllByRole('row')

  return cuerpo.map((celda) => {
    const texto = celda.textContent ?? ''
    if (texto.includes('Sin evaluar')) return 'Sin evaluar'
    if (texto.includes('5,0')) return '5,0'
    if (texto.includes('2,0')) return '2,0'
    return 'desconocido'
  })
}

describe('columnasMonitoreo - orden por criticidad', () => {
  it('presenta las filas en el orden recibido antes de ordenar', () => {
    render(<DataTable<FilaMonitoreo> columns={columnasMonitoreo} data={filas} pagination={false} />)
    expect(criticidadPorFila()).toEqual(['5,0', 'Sin evaluar', '2,0'])
  })

  it('deja las mas criticas al inicio con el primer clic', async () => {
    const user = userEvent.setup()
    render(<DataTable<FilaMonitoreo> columns={columnasMonitoreo} data={filas} pagination={false} />)

    await user.click(screen.getByText('Criticidad'))

    expect(criticidadPorFila()).toEqual(['5,0', '2,0', 'Sin evaluar'])
  })

  it('invierte el orden con el segundo clic y agrupa las no evaluadas en el otro extremo', async () => {
    const user = userEvent.setup()
    render(<DataTable<FilaMonitoreo> columns={columnasMonitoreo} data={filas} pagination={false} />)

    await user.click(screen.getByText('Criticidad'))
    await user.click(screen.getByText('Criticidad'))

    expect(criticidadPorFila()).toEqual(['Sin evaluar', '2,0', '5,0'])
  })
})
