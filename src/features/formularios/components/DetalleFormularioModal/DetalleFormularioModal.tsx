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
  ETIQUETAS_CAMPUS_SEDE,
  ETIQUETAS_CATEGORIA_LICITACION,
  ETIQUETAS_CAUSAL_TRATO_DIRECTO,
  ETIQUETAS_DIRECCION_DESPACHO,
  ETIQUETAS_ESTADO_FORMULARIO,
  ETIQUETAS_FORMALIZACION,
  ETIQUETAS_FORMA_PAGO,
  ETIQUETAS_MODALIDAD_FORMULARIO,
  ETIQUETAS_TIPO_EVALUACION,
  ETIQUETAS_TIPO_PRESUPUESTO,
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
        Ficha Oficial {formulario.folio} — {ETIQUETAS_MODALIDAD_FORMULARIO[formulario.modalidad]}
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
              {formulario.modalidad === 'licitacion_publica' && (
                <Badge variant="info">
                  {ETIQUETAS_CAMPUS_SEDE[formulario.licitacion.antecedentes.campusSede]} ·{' '}
                  {formulario.licitacion.antecedentes.fechaFormulario}
                </Badge>
              )}
            </div>
            <h3 className="text-base font-semibold text-mercury-900">{formulario.titulo}</h3>
            <p className="text-xs text-mercury-600">
              Solicitud E-delfos: <strong className="font-mono">{formulario.codigoEdelfos}</strong>
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-mercury-500">Presupuesto</p>
            <p className="text-lg font-bold tabular-nums text-mercury-900">
              {formatCLP(formulario.montoEstimadoClp)}
            </p>
            <p className="text-xs font-semibold tabular-nums text-primary-700">
              {formulario.montoEstimadoUtm.toLocaleString('es-CL')} UTM
            </p>
          </div>
        </div>

        {formulario.modalidad === 'licitacion_publica' ? (
          <div className="space-y-5">
            <div className="space-y-3 rounded-xl border border-mercury-200 p-4">
              <h4 className="text-sm font-bold uppercase tracking-wide text-primary-800">
                I. Descripción del Producto o Servicio Requerido
              </h4>

              <div className="grid gap-3 text-xs text-mercury-700 sm:grid-cols-2">
                <div>
                  <span className="text-mercury-500">Opción seleccionada:</span>{' '}
                  <strong>
                    {ETIQUETAS_CATEGORIA_LICITACION[formulario.licitacion.categoriaRequerimiento]}
                  </strong>
                </div>
                <div>
                  <span className="text-mercury-500">Formalización:</span>{' '}
                  <strong>{ETIQUETAS_FORMALIZACION[formulario.licitacion.formalizacion]}</strong>
                </div>
                <div>
                  <span className="text-mercury-500">Dirección de despacho:</span>{' '}
                  <strong>
                    {formulario.licitacion.direccionDespachoCodigo === 'otra'
                      ? formulario.licitacion.direccionDespachoOtra
                      : ETIQUETAS_DIRECCION_DESPACHO[formulario.licitacion.direccionDespachoCodigo]}
                  </strong>
                </div>
                <div>
                  <span className="text-mercury-500">Forma de pago:</span>{' '}
                  <strong>{ETIQUETAS_FORMA_PAGO[formulario.licitacion.modalidadFormaPago]}</strong>
                </div>
              </div>

              {formulario.licitacion.productos.length > 0 && (
                <ul className="space-y-2 pt-2 text-xs text-mercury-700">
                  {formulario.licitacion.productos.map((prod, idx) => (
                    <li key={idx} className="rounded-lg bg-mercury-50 p-3">
                      <strong>
                        Ítem #{idx + 1} (Cantidad: {prod.cantidad}):
                      </strong>{' '}
                      {prod.especificacionesTecnicas} ·{' '}
                      {prod.requiereGarantia
                        ? `Garantía: ${prod.mesesGarantia} meses`
                        : 'No requiere garantía'}
                      {prod.nombreImagenReferencia
                        ? ` · Imagen ref.: ${prod.nombreImagenReferencia}`
                        : ''}
                    </li>
                  ))}
                </ul>
              )}

              {formulario.licitacion.especificacionesTecnicasServicio && (
                <div className="rounded-lg bg-mercury-50 p-3 text-xs text-mercury-700">
                  <strong>Especificaciones del servicio:</strong>{' '}
                  {formulario.licitacion.especificacionesTecnicasServicio}
                </div>
              )}

              {formulario.licitacion.bibliografia.length > 0 && (
                <div className="space-y-2 pt-2 text-xs text-mercury-700">
                  {formulario.licitacion.nombrePlanillaValidacionBiblioteca && (
                    <p>
                      Planilla validación Biblioteca:{' '}
                      <strong>{formulario.licitacion.nombrePlanillaValidacionBiblioteca}</strong>
                    </p>
                  )}
                  <ul className="space-y-2">
                    {formulario.licitacion.bibliografia.map((libro, idx) => (
                      <li key={idx} className="rounded-lg bg-mercury-50 p-2.5">
                        <strong>{libro.titulo}</strong> — {libro.autor} ({libro.editorial},{' '}
                        {libro.numeroEdicion}, Idioma: {libro.idioma}) · ISBN/ISSN: {libro.isbnIssn}{' '}
                        · Cantidad: {libro.cantidad}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-xl border border-mercury-200 p-4">
              <h4 className="text-sm font-bold uppercase tracking-wide text-primary-800">
                II. Antecedentes Generales
              </h4>
              <div className="grid gap-3 text-xs text-mercury-700 sm:grid-cols-2">
                <div>
                  <span className="text-mercury-500">CR de Financiamiento:</span>{' '}
                  <strong>
                    #{formulario.coordinador.crCodigo} — {formulario.coordinador.crNombre}
                  </strong>
                </div>
                <div>
                  <span className="text-mercury-500">Jefe de CR:</span>{' '}
                  <strong>
                    {formulario.licitacion.antecedentes.jefeCrNombre} (
                    {formulario.licitacion.antecedentes.jefeCrCargo})
                  </strong>
                </div>
                <div>
                  <span className="text-mercury-500">Supervisor y Coordinador:</span>{' '}
                  <strong>
                    {formulario.coordinador.nombreCompleto} ({formulario.coordinador.run}) —{' '}
                    {formulario.coordinador.cargo}
                  </strong>
                </div>
                <div>
                  <span className="text-mercury-500">Tipo de Presupuesto:</span>{' '}
                  <strong>
                    {ETIQUETAS_TIPO_PRESUPUESTO[formulario.licitacion.antecedentes.tipoPresupuesto]}
                  </strong>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-mercury-200 p-4">
              <h4 className="text-sm font-bold uppercase tracking-wide text-primary-800">
                III. Evaluación y Adjudicación de las Ofertas
              </h4>
              <p className="text-xs text-mercury-700">
                Tipo de Evaluación:{' '}
                <strong>{ETIQUETAS_TIPO_EVALUACION[formulario.licitacion.tipoEvaluacion]}</strong>
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-mercury-50 p-3 text-xs text-mercury-700">
                  <p className="font-semibold text-mercury-900">
                    Comisión Evaluadora ({formulario.licitacion.comisionEvaluadora.length})
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {formulario.licitacion.comisionEvaluadora.map((integrante, idx) => (
                      <li key={idx}>
                        <strong>{integrante.nombreCompleto}</strong> ({integrante.run}) ·{' '}
                        {integrante.cargo} [{integrante.calidadContractual}] · {integrante.correo}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg bg-mercury-50 p-3 text-xs text-mercury-700">
                  <p className="font-semibold text-mercury-900">
                    Ponderación de Criterios (Total 100%)
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {formulario.licitacion.criteriosEvaluacion.aplicaRequisitosFormales && (
                      <li>
                        Requisitos Formales:{' '}
                        <strong>
                          {formulario.licitacion.criteriosEvaluacion.ponderacionRequisitosFormales}%
                        </strong>
                      </li>
                    )}
                    {formulario.licitacion.criteriosEvaluacion.aplicaPactoIntegridad && (
                      <li>
                        Pacto de Integridad:{' '}
                        <strong>
                          {formulario.licitacion.criteriosEvaluacion.ponderacionPactoIntegridad}%
                        </strong>
                      </li>
                    )}
                    <li>
                      Económico — Precio:{' '}
                      <strong>
                        {formulario.licitacion.criteriosEvaluacion.ponderacionPrecio}%
                      </strong>
                    </li>
                    {formulario.licitacion.criteriosEvaluacion.aplicaPlazoEntrega && (
                      <li>
                        Técnico — Plazo de Entrega:{' '}
                        <strong>
                          {formulario.licitacion.criteriosEvaluacion.ponderacionPlazoEntrega}%
                        </strong>
                      </li>
                    )}
                    {formulario.licitacion.criteriosEvaluacion.aplicaExperiencia && (
                      <li>
                        Técnico — Experiencia:{' '}
                        <strong>
                          {formulario.licitacion.criteriosEvaluacion.ponderacionExperiencia}%
                        </strong>
                      </li>
                    )}
                    {formulario.licitacion.criteriosEvaluacion.aplicaPlazoGarantia && (
                      <li>
                        Técnico — Plazo de Garantía:{' '}
                        <strong>
                          {formulario.licitacion.criteriosEvaluacion.ponderacionPlazoGarantia}%
                        </strong>
                      </li>
                    )}
                    {formulario.licitacion.criteriosEvaluacion.otrosCriterios.map((crit, idx) => (
                      <li key={idx}>
                        {crit.nombre}: <strong>{crit.ponderacion}%</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid gap-4 rounded-xl border border-mercury-200 bg-mercury-50 p-4 text-xs text-mercury-700 sm:grid-cols-2">
              <div className="border-t-2 border-mercury-400 pt-2">
                <p className="font-bold text-mercury-900">
                  FIRMA COORDINADOR O RESPONSABLE DE LA CONTRATACIÓN
                </p>
                <p>{formulario.coordinador.nombreCompleto}</p>
                <p className="text-mercury-500">Cargo: {formulario.coordinador.cargo}</p>
              </div>
              <div className="border-t-2 border-mercury-400 pt-2">
                <p className="font-bold text-mercury-900">FIRMA JEFE CENTRO DE RESPONSABILIDAD</p>
                <p>{formulario.licitacion.antecedentes.jefeCrNombre}</p>
                <p className="text-mercury-500">
                  Cargo: {formulario.licitacion.antecedentes.jefeCrCargo}
                </p>
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
            </div>
          </div>
        )}
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
