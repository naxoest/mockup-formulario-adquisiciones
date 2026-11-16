import { toast } from 'sonner'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal, type ModalComponentProps } from '@/components/ui/Modal'
import { useCambiarEstadoFormulario } from '@/features/formularios/api/formulariosAdquisicion'
import type {
  EstadoFormularioAdquisicion,
  FormularioAdquisicion,
} from '@/features/formularios/types/formularioAdquisicion.types'
import {
  ETIQUETAS_CATEGORIA_LICITACION,
  ETIQUETAS_CAUSAL_TRATO_DIRECTO,
  ETIQUETAS_ESTADO_FORMULARIO,
  ETIQUETAS_FORMALIZACION,
  ETIQUETAS_MODALIDAD_FORMULARIO,
  ETIQUETAS_TIPO_SOLICITUD,
} from '@/features/formularios/utils/catalogosFormulario'
import { formatCLP } from '@/utils/currency'

export interface DetalleFormularioModalProps extends ModalComponentProps<void> {
  formulario: FormularioAdquisicion
}

const VARIANTE_BADGE_ESTADO: Record<EstadoFormularioAdquisicion, BadgeVariant> = {
  borrador: 'neutral',
  en_revision: 'info',
  aprobado: 'success',
  observado: 'warning',
}

export function DetalleFormularioModal({
  formulario,
  open,
  resolve,
  onExited,
}: DetalleFormularioModalProps) {
  const mutacionEstado = useCambiarEstadoFormulario()

  const actualizarEstado = (nuevoEstado: EstadoFormularioAdquisicion) => {
    mutacionEstado.mutate(
      { id: formulario.id, estado: nuevoEstado },
      {
        onSuccess: () => {
          toast.success(
            `Formulario ${formulario.folio} marcado como "${ETIQUETAS_ESTADO_FORMULARIO[nuevoEstado]}"`,
          )
          resolve()
        },
        onError: () => {
          toast.error('No se pudo actualizar el estado del formulario')
        },
      },
    )
  }

  return (
    <Modal open={open} onClose={() => resolve()} onExited={onExited} size="xl">
      <Modal.Header>
        Ficha de Adquisición {formulario.folio} —{' '}
        {ETIQUETAS_MODALIDAD_FORMULARIO[formulario.modalidad]}
      </Modal.Header>

      <Modal.Body className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-mercury-200 bg-mercury-50 p-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary-700">
                {formulario.folio}
              </span>
              <Badge variant={VARIANTE_BADGE_ESTADO[formulario.estado]}>
                {ETIQUETAS_ESTADO_FORMULARIO[formulario.estado]}
              </Badge>
              <Badge variant="neutral">{ETIQUETAS_TIPO_SOLICITUD[formulario.tipoSolicitud]}</Badge>
            </div>
            <h3 className="text-base font-semibold text-mercury-900">{formulario.titulo}</h3>
            <p className="text-xs text-mercury-600">
              Solicitud E-delfos: <strong className="font-mono">{formulario.codigoEdelfos}</strong>
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-mercury-500">Monto estimado</p>
            <p className="text-lg font-bold tabular-nums text-mercury-900">
              {formatCLP(formulario.montoEstimadoClp)}
            </p>
            <p className="text-xs font-semibold tabular-nums text-primary-700">
              {formulario.montoEstimadoUtm.toLocaleString('es-CL')} UTM
            </p>
          </div>
        </div>

        <div className="grid gap-4 rounded-xl border border-mercury-200 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-mercury-500">
              Coordinador / Supervisor del Contrato
            </p>
            <p className="mt-1 text-sm font-semibold text-mercury-900">
              {formulario.coordinador.nombreCompleto}
            </p>
            <p className="text-xs text-mercury-600">
              RUN: {formulario.coordinador.run} · {formulario.coordinador.cargo}
            </p>
            <p className="text-xs text-mercury-600">{formulario.coordinador.correo}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-mercury-500">
              Centro de Responsabilidad (CR)
            </p>
            <p className="mt-1 text-sm font-semibold text-mercury-900">
              CR #{formulario.coordinador.crCodigo}
            </p>
            <p className="text-xs text-mercury-600">{formulario.coordinador.crNombre}</p>
          </div>
        </div>

        {formulario.modalidad === 'licitacion_publica' ? (
          <div className="space-y-4">
            <div className="grid gap-4 rounded-xl border border-mercury-200 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-mercury-500">Categoría del requerimiento</p>
                <p className="text-sm font-semibold text-mercury-900">
                  {ETIQUETAS_CATEGORIA_LICITACION[formulario.licitacion.categoriaRequerimiento]}
                </p>
              </div>
              <div>
                <p className="text-xs text-mercury-500">Formalización exigida</p>
                <p className="text-sm font-semibold text-mercury-900">
                  {ETIQUETAS_FORMALIZACION[formulario.licitacion.formalizacion]}
                </p>
              </div>
            </div>

            {formulario.licitacion.productos.length > 0 && (
              <div className="space-y-2 rounded-xl border border-mercury-200 p-4">
                <h4 className="text-sm font-semibold text-mercury-900">
                  Productos solicitados ({formulario.licitacion.productos.length})
                </h4>
                <ul className="space-y-2 text-xs text-mercury-700">
                  {formulario.licitacion.productos.map((prod, idx) => (
                    <li key={idx} className="rounded-lg bg-mercury-50 p-2.5">
                      <strong>{prod.descripcion}</strong> — {prod.cantidad} {prod.unidadMedida} ·
                      Materialidad: {prod.materialidad} · Garantía: {prod.mesesGarantia} meses ·{' '}
                      {prod.requiereInstalacion ? 'Con instalación' : 'Sin instalación'}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {formulario.licitacion.servicios.length > 0 && (
              <div className="space-y-2 rounded-xl border border-mercury-200 p-4">
                <h4 className="text-sm font-semibold text-mercury-900">
                  Servicios solicitados ({formulario.licitacion.servicios.length})
                </h4>
                <ul className="space-y-2 text-xs text-mercury-700">
                  {formulario.licitacion.servicios.map((serv, idx) => (
                    <li key={idx} className="rounded-lg bg-mercury-50 p-2.5">
                      <strong>{serv.nombreServicio}</strong> — Metodología:{' '}
                      {serv.metodologiaExigida} · Hitos: {serv.hitosPrincipales} · Normativas:{' '}
                      {serv.normativasAplicables}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {formulario.licitacion.bibliografia.length > 0 && (
              <div className="space-y-2 rounded-xl border border-mercury-200 p-4">
                <h4 className="text-sm font-semibold text-mercury-900">
                  Bibliografía solicitada ({formulario.licitacion.bibliografia.length})
                </h4>
                <ul className="space-y-2 text-xs text-mercury-700">
                  {formulario.licitacion.bibliografia.map((libro, idx) => (
                    <li key={idx} className="rounded-lg bg-mercury-50 p-2.5">
                      <strong>{libro.titulo}</strong> ({libro.autor}, {libro.editorial},{' '}
                      {libro.edicionAnio}) · ISBN/ISSN: {libro.isbnIssn} ·{' '}
                      {libro.cantidadEjemplares} ejemplares · Visado por Biblioteca
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 rounded-xl border border-mercury-200 p-4">
                <h4 className="text-sm font-semibold text-mercury-900">
                  Comisión Evaluadora ({formulario.licitacion.comisionEvaluadora.length})
                </h4>
                <ul className="space-y-1.5 text-xs text-mercury-700">
                  {formulario.licitacion.comisionEvaluadora.map((integrante, idx) => (
                    <li key={idx}>
                      <strong>{integrante.nombreCompleto}</strong> ({integrante.run}) —{' '}
                      {integrante.cargo}, {integrante.unidad}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 rounded-xl border border-mercury-200 p-4">
                <h4 className="text-sm font-semibold text-mercury-900">
                  Criterios de Evaluación (100%)
                </h4>
                <ul className="space-y-1 text-xs text-mercury-700">
                  <li>
                    Administrativo:{' '}
                    <strong>
                      {formulario.licitacion.criteriosEvaluacion.ponderacionAdministrativa}%
                    </strong>
                  </li>
                  <li>
                    Económico (Precio):{' '}
                    <strong>
                      {formulario.licitacion.criteriosEvaluacion.ponderacionEconomica}%
                    </strong>
                  </li>
                  <li>
                    Técnico — Plazo de entrega:{' '}
                    <strong>
                      {formulario.licitacion.criteriosEvaluacion.ponderacionPlazoEntrega}%
                    </strong>
                  </li>
                  <li>
                    Técnico — Experiencia:{' '}
                    <strong>
                      {formulario.licitacion.criteriosEvaluacion.ponderacionExperiencia}%
                    </strong>
                  </li>
                  <li>
                    Técnico — Garantía:{' '}
                    <strong>
                      {formulario.licitacion.criteriosEvaluacion.ponderacionGarantia}%
                    </strong>{' '}
                    (mín. {formulario.licitacion.criteriosEvaluacion.mesesGarantiaMinima} meses)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 rounded-xl border border-mercury-200 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-mercury-500">Proveedor seleccionado</p>
                <p className="text-sm font-semibold text-mercury-900">
                  {formulario.tratoDirecto.proveedorNombre}
                </p>
                <p className="text-xs text-mercury-600">
                  RUT: {formulario.tratoDirecto.proveedorRut}
                </p>
              </div>
              <div>
                <p className="text-xs text-mercury-500">Causal legal (Art. 71 Ley 19.886)</p>
                <p className="text-sm font-semibold text-mercury-900">
                  {ETIQUETAS_CAUSAL_TRATO_DIRECTO[formulario.tratoDirecto.causal]}
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-mercury-200 p-4 text-xs text-mercury-700">
              <div>
                <p className="font-semibold text-mercury-900">Objetivo e importancia:</p>
                <p className="mt-0.5">{formulario.tratoDirecto.objetivoImportancia}</p>
              </div>
              <div>
                <p className="font-semibold text-mercury-900">Justificación del proveedor único:</p>
                <p className="mt-0.5">{formulario.tratoDirecto.justificacionProveedorUnico}</p>
              </div>
              {formulario.tratoDirecto.informeCostos7b && (
                <div className="rounded-lg border border-saffron-300 bg-saffron-50 p-3">
                  <p className="font-semibold text-saffron-900">Informe de costos (Causal 7b):</p>
                  <p className="mt-0.5 text-saffron-800">
                    {formulario.tratoDirecto.informeCostos7b}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-4 border-t border-mercury-200 pt-3">
                <span>
                  Cotización: <strong>{formulario.tratoDirecto.nombreArchivoCotizacion}</strong>
                </span>
                <span>
                  Declaración Jurada:{' '}
                  <strong>{formulario.tratoDirecto.nombreArchivoDeclaracionJurada}</strong>
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-mercury-200 bg-mercury-50 p-4 text-xs text-mercury-700">
          <p className="font-semibold text-mercury-900">Disposiciones Contractuales:</p>
          <p className="mt-1">
            Multa diaria: <strong>{formulario.disposiciones.porcentajeMultaDiaria}%</strong> sobre
            valor neto atrasado · Tope:{' '}
            <strong>{formulario.disposiciones.topeDiasMulta} días</strong> (máx.{' '}
            {formulario.disposiciones.topePorcentajeContrato}% del contrato) · Pago a{' '}
            <strong>{formulario.disposiciones.plazoPagoDias} días</strong> contra recepción conforme
            visada por Jefe de CR · Incluye término anticipado Art. 130 Ley 19.886.
          </p>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex flex-wrap items-center gap-2">
          {formulario.estado !== 'aprobado' && (
            <Button
              variant="primary"
              size="sm"
              loading={mutacionEstado.isPending}
              onClick={() => actualizarEstado('aprobado')}
            >
              Aprobar Formulario
            </Button>
          )}
          {formulario.estado !== 'observado' && (
            <Button
              variant="secondary"
              size="sm"
              disabled={mutacionEstado.isPending}
              onClick={() => actualizarEstado('observado')}
            >
              Marcar Observado
            </Button>
          )}
        </div>
        <Button variant="secondary" onClick={() => resolve()}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
