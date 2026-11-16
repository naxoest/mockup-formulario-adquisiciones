import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import { zodResolver } from '@/lib/zodResolver'
import { Button } from '@/components/ui/Button'
import { Modal, useConfirm } from '@/components/ui/Modal'
import { Stepper, useStepper } from '@/components/ui/Stepper'
import {
  confirmarImportacion,
  crearImportacion,
  descartarImportacion,
  importacionesRequerimientosQueryOptions,
} from '@/features/requerimientos/api/importaciones'
import { requerimientosQueryOptions } from '@/features/requerimientos/api/requerimientos'
import {
  importacionFormSchema,
  type ImportacionFormValores,
} from '@/features/requerimientos/schemas/importacionForm.schema'
import type {
  Importacion,
  RevisionImportacion,
} from '@/features/requerimientos/types/importacion.types'
import { prepararImportacion } from '@/features/requerimientos/utils/prepararImportacion'
import type { ImportacionPlanillaModalProps } from './ImportacionPlanillaModal.types'
import { PasoArchivo } from './PasoArchivo'
import { PasoResultado } from './PasoResultado'
import { PasoRevision } from './PasoRevision'

const PASO_ARCHIVO = 0
const PASO_REVISION = 1
const PASO_RESULTADO = 2

interface RevisionEnCurso {
  revision: RevisionImportacion
  avisosLectura: string[]
}

type ResultadoRevisar =
  | { tipo: 'lectura_invalida'; error: string }
  | ({ tipo: 'revision' } & RevisionEnCurso)

interface DatosRevisar {
  archivo: File
  solicitanteId: number
}

function mensajeError(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado'
}

export function ImportacionPlanillaModal({
  open,
  onExited,
  resolve,
}: ImportacionPlanillaModalProps) {
  const queryClient = useQueryClient()
  const pedirConfirmacion = useConfirm()
  const stepper = useStepper({ totalSteps: 3 })
  const [enCurso, setEnCurso] = useState<RevisionEnCurso | null>(null)
  const [confirmada, setConfirmada] = useState<Importacion | null>(null)

  const form = useForm<ImportacionFormValores>({
    resolver: zodResolver(importacionFormSchema),
    defaultValues: { tipoSolicitante: '', campus: '', solicitante: '', archivo: [] },
  })

  const invalidarImportaciones = () =>
    queryClient.invalidateQueries({
      queryKey: importacionesRequerimientosQueryOptions.queryKey,
    })

  const revisar = useMutation({
    mutationFn: async ({ archivo, solicitanteId }: DatosRevisar): Promise<ResultadoRevisar> => {
      const preparacion = await prepararImportacion(archivo, solicitanteId)

      if (!preparacion.valida) {
        return { tipo: 'lectura_invalida', error: preparacion.error }
      }

      const revision = await crearImportacion(preparacion.solicitud)
      return { tipo: 'revision', revision, avisosLectura: preparacion.avisos }
    },
    onSuccess: (resultado) => {
      if (resultado.tipo === 'lectura_invalida') {
        form.setError('archivo', { message: resultado.error })
        return
      }

      setEnCurso({ revision: resultado.revision, avisosLectura: resultado.avisosLectura })
      void invalidarImportaciones()
      stepper.goTo(PASO_REVISION)
    },
    onError: (error) => {
      toast.error(mensajeError(error))
    },
  })

  const confirmar = useMutation({
    mutationFn: (importacionId: number) => confirmarImportacion(importacionId),
    onSuccess: (importacion) => {
      setConfirmada(importacion)
      void queryClient.invalidateQueries({
        queryKey: requerimientosQueryOptions.queryKey,
      })
      stepper.goTo(PASO_RESULTADO)
    },
    onError: (error) => {
      toast.error(mensajeError(error))
    },
  })

  const descartar = useMutation({
    mutationFn: (importacionId: number) => descartarImportacion(importacionId),
    onSuccess: (importacion) => {
      void invalidarImportaciones()
      toast.success(
        `La importación #${importacion.id} se descartó y quedó registrada en el historial.`,
      )
      resolve(null)
    },
    onError: (error) => {
      toast.error(mensajeError(error))
    },
  })

  const ocupado = revisar.isPending || confirmar.isPending || descartar.isPending

  const enviar = (valores: ImportacionFormValores) => {
    const seleccionado = valores.archivo[0]

    if (seleccionado.kind !== 'pending') {
      form.setError('archivo', { message: 'Seleccione nuevamente la planilla.' })
      return
    }

    revisar.mutate({ archivo: seleccionado.file, solicitanteId: Number(valores.solicitante) })
  }

  const solicitarConfirmacion = async (revision: RevisionImportacion) => {
    const eliminaciones = revision.requerimientosEliminados

    if (eliminaciones > 0) {
      const aceptada = await pedirConfirmacion({
        title: 'Confirmar eliminaciones',
        message:
          eliminaciones === 1
            ? 'Se eliminará 1 requerimiento que no figura en el archivo. ¿Desea confirmar la importación?'
            : `Se eliminarán ${eliminaciones} requerimientos que no figuran en el archivo. ¿Desea confirmar la importación?`,
        variant: 'error',
        confirmText: 'Confirmar importación',
      })

      if (!aceptada) {
        return
      }
    }

    confirmar.mutate(revision.id)
  }

  const cerrar = () => {
    if (ocupado) {
      return
    }

    if (stepper.active === PASO_REVISION && enCurso !== null) {
      descartar.mutate(enCurso.revision.id)
      return
    }

    resolve(null)
  }

  return (
    <Modal open={open} onClose={cerrar} onExited={onExited} size="xl">
      <Modal.Header
        icon={<FileSpreadsheet aria-hidden="true" className="size-5 text-primary-700" />}
      >
        Importar planilla
      </Modal.Header>
      <Modal.Body>
        <Stepper active={stepper.active} size="sm">
          <Stepper.Step label="Archivo" description="Solicitante y planilla">
            <PasoArchivo form={form} onSubmit={enviar} />
          </Stepper.Step>
          <Stepper.Step label="Revisión" description="Resultado por fila">
            {enCurso !== null && (
              <PasoRevision revision={enCurso.revision} avisosLectura={enCurso.avisosLectura} />
            )}
          </Stepper.Step>
          <Stepper.Step label="Resultado" description="Importación confirmada">
            {confirmada !== null && <PasoResultado importacion={confirmada} />}
          </Stepper.Step>
        </Stepper>
      </Modal.Body>
      <Modal.Footer>
        {stepper.active === PASO_ARCHIVO && (
          <>
            <Button variant="secondary" onClick={cerrar} disabled={ocupado}>
              Cancelar
            </Button>
            <Button onClick={() => void form.handleSubmit(enviar)()} loading={revisar.isPending}>
              Revisar archivo
            </Button>
          </>
        )}
        {stepper.active === PASO_REVISION && enCurso !== null && (
          <>
            <Button
              variant="secondary"
              onClick={() => descartar.mutate(enCurso.revision.id)}
              loading={descartar.isPending}
              disabled={confirmar.isPending}
            >
              Descartar importación
            </Button>
            <Button
              onClick={() => void solicitarConfirmacion(enCurso.revision)}
              loading={confirmar.isPending}
              disabled={enCurso.revision.filasConErrores > 0 || descartar.isPending}
            >
              Confirmar importación
            </Button>
          </>
        )}
        {stepper.active === PASO_RESULTADO && (
          <>
            <Button variant="secondary" onClick={() => resolve('importaciones')}>
              Ver historial de importaciones
            </Button>
            <Button onClick={() => resolve('requerimientos')}>Ver requerimientos</Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  )
}
