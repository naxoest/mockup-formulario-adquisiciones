import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Eye, FileCheck2, FilePlus2, Gavel, Handshake } from 'lucide-react'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable, type ColumnDef, type RowAction } from '@/components/ui/DataTable'
import { useModal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageLayout } from '@/components/ui/PageLayout'
import { Tabs, type TabItem } from '@/components/ui/Tabs'
import { exigirPermiso } from '@/features/auth/permisos'
import { formulariosAdquisicionQueryOptions } from '@/features/formularios/api/formulariosAdquisicion'
import { DetalleFormularioModal } from '@/features/formularios/components/DetalleFormularioModal'
import { LicitacionWizardModal } from '@/features/formularios/components/LicitacionWizard'
import { TratoDirectoWizardModal } from '@/features/formularios/components/TratoDirectoWizard'
import type {
  EstadoFormularioAdquisicion,
  FormularioAdquisicion,
} from '@/features/formularios/types/formularioAdquisicion.types'
import {
  ETIQUETAS_ESTADO_FORMULARIO,
  ETIQUETAS_MODALIDAD_FORMULARIO,
  ETIQUETAS_TIPO_SOLICITUD,
} from '@/features/formularios/utils/catalogosFormulario'
import { formatCLP } from '@/utils/currency'

type PestanaModalidad = 'todos' | 'licitacion_publica' | 'trato_directo'

const VARIANTE_BADGE_ESTADO: Record<EstadoFormularioAdquisicion, BadgeVariant> = {
  borrador: 'neutral',
  en_revision: 'info',
  aprobado: 'success',
  observado: 'warning',
}

export const Route = createFileRoute('/_app/formularios')({
  beforeLoad: ({ context }) => {
    exigirPermiso(context.sesion.roles, 'requerimientos:ver')
  },
  component: FormulariosAdquisicionPage,
})

function construirColumnas(): ColumnDef<FormularioAdquisicion>[] {
  return [
    {
      field: 'folio',
      header: 'Folio / E-delfos',
      sortable: true,
      width: 'w-[16%] min-w-36',
      getSearchText: (fila) => `${fila.folio} ${fila.codigoEdelfos} ${fila.tipoSolicitud}`,
      renderCell: (fila) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold text-primary-700">{fila.folio}</span>
          <span className="font-mono text-xs text-mercury-500">{fila.codigoEdelfos}</span>
        </div>
      ),
    },
    {
      field: 'titulo',
      header: 'Requerimiento y Unidad (CR)',
      sortable: true,
      width: 'w-[34%] min-w-64',
      getSearchText: (fila) =>
        `${fila.titulo} ${fila.coordinador.crNombre} ${fila.coordinador.nombreCompleto}`,
      renderCell: (fila) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-mercury-900">{fila.titulo}</span>
          <span className="text-xs text-mercury-500">
            CR #{fila.coordinador.crCodigo} · {fila.coordinador.crNombre}
          </span>
        </div>
      ),
    },
    {
      field: 'modalidad',
      header: 'Modalidad / Tipo',
      sortable: true,
      width: 'w-[18%] min-w-40',
      renderCell: (fila) => (
        <div className="flex flex-col items-start gap-1">
          <Badge variant={fila.modalidad === 'licitacion_publica' ? 'info' : 'neutral'} size="sm">
            {ETIQUETAS_MODALIDAD_FORMULARIO[fila.modalidad]}
          </Badge>
          <span className="text-xs text-mercury-500">
            {ETIQUETAS_TIPO_SOLICITUD[fila.tipoSolicitud]}
          </span>
        </div>
      ),
    },
    {
      field: 'montoEstimadoClp',
      header: 'Monto / UTM',
      sortable: true,
      type: 'currency',
      width: 'w-[16%] min-w-36',
      renderCell: (fila) => (
        <div className="flex flex-col tabular-nums">
          <span className="font-semibold text-mercury-900">{formatCLP(fila.montoEstimadoClp)}</span>
          <span className="text-xs font-medium text-primary-700">
            {fila.montoEstimadoUtm.toLocaleString('es-CL')} UTM
          </span>
        </div>
      ),
    },
    {
      field: 'estado',
      header: 'Estado',
      sortable: true,
      width: 'w-[16%] min-w-32',
      renderCell: (fila) => (
        <Badge variant={VARIANTE_BADGE_ESTADO[fila.estado]} dot>
          {ETIQUETAS_ESTADO_FORMULARIO[fila.estado]}
        </Badge>
      ),
    },
  ]
}

function FormulariosAdquisicionPage() {
  const [pestana, setPestana] = useState<PestanaModalidad>('todos')
  const modal = useModal()
  const { data: formularios = [], isPending } = useQuery(formulariosAdquisicionQueryOptions)

  const columnas = useMemo(() => construirColumnas(), [])

  const formulariosFiltrados = useMemo(() => {
    if (pestana === 'todos') return formularios
    return formularios.filter((item) => item.modalidad === pestana)
  }, [formularios, pestana])

  const abrirNuevaLicitacion = async () => {
    await modal.open(LicitacionWizardModal, {})
  }

  const abrirNuevoTratoDirecto = async () => {
    await modal.open(TratoDirectoWizardModal, {})
  }

  const abrirDetalle = async (formulario: FormularioAdquisicion) => {
    await modal.open(DetalleFormularioModal, { formulario })
  }

  const accionesFila: RowAction<FormularioAdquisicion>[] = [
    {
      key: 'ver-ficha',
      label: 'Ver ficha completa',
      icon: <Eye size={16} />,
      onClick: (fila) => {
        void abrirDetalle(fila)
      },
    },
  ]

  const tablaActual = (
    <DataTable
      columns={columnas}
      data={formulariosFiltrados}
      loading={isPending}
      searchable
      pagination
      exportable
      ariaLabel="Listado de formularios de adquisición"
      onRowClick={(fila) => {
        void abrirDetalle(fila)
      }}
      actions={accionesFila}
    />
  )

  const itemsTabs: TabItem<PestanaModalidad>[] = [
    {
      key: 'todos',
      label: `Todos (${formularios.length})`,
      icon: <FileCheck2 className="size-4" />,
      content: tablaActual,
    },
    {
      key: 'licitacion_publica',
      label: `Licitación Pública (${formularios.filter((f) => f.modalidad === 'licitacion_publica').length})`,
      icon: <Gavel className="size-4" />,
      content: tablaActual,
    },
    {
      key: 'trato_directo',
      label: `Trato Directo (${formularios.filter((f) => f.modalidad === 'trato_directo').length})`,
      icon: <Handshake className="size-4" />,
      content: tablaActual,
    },
  ]

  return (
    <PageLayout maxWidth="none">
      <PageHeader
        title="Formularios de Adquisición"
        description="Elaboración y control de formularios de Licitación Pública y Trato Directo vinculados a E-delfos."
        icon={<FileCheck2 className="size-5" />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => void abrirNuevoTratoDirecto()}>
              <Handshake className="mr-1.5 size-4" />
              Nuevo Trato Directo
            </Button>
            <Button variant="primary" onClick={() => void abrirNuevaLicitacion()}>
              <FilePlus2 className="mr-1.5 size-4" />
              Nueva Licitación Pública
            </Button>
          </div>
        }
      />

      <Tabs
        items={itemsTabs}
        value={pestana}
        onChange={setPestana}
        ariaLabel="Filtrar formularios por modalidad de compra"
      />
    </PageLayout>
  )
}
