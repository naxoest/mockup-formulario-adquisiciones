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
  ETIQUETAS_CONVENIO_MARCO_TD,
  ETIQUETAS_DIRECCION_DESPACHO,
  ETIQUETAS_DOCUMENTOS_ADICIONALES_TD,
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

  const campusLabel =
    formulario.modalidad === 'licitacion_publica'
      ? ETIQUETAS_CAMPUS_SEDE[formulario.licitacion.antecedentes.campusSede]
      : ETIQUETAS_CAMPUS_SEDE[formulario.tratoDirecto.campusSede]

  const fechaLabel =
    formulario.modalidad === 'licitacion_publica'
      ? formulario.licitacion.antecedentes.fechaFormulario
      : formulario.tratoDirecto.fechaFormulario

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
              <Badge variant="info">
                {campusLabel} · {fechaLabel}
              </Badge>
            </div>
            <h3 className="text-base font-semibold text-mercury-900">{formulario.titulo}</h3>
            <p className="text-xs text-mercury-600">
              Folio de Solicitud: <strong className="font-mono">{formulario.codigoEdelfos}</strong>
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-mercury-500">Monto Total</p>
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
                        {integrante.cargo} [{integrante.calidadContractual}]
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
          <div className="space-y-5">
            <div className="space-y-2 rounded-xl border border-mercury-200 p-4 text-xs text-mercury-700">
              <h4 className="text-sm font-bold text-primary-800">
                1. La unidad que suscribe requiere:
              </h4>
              <ul className="space-y-1.5">
                {formulario.tratoDirecto.itemsRequeridos.map((item, idx) => (
                  <li key={idx} className="rounded-lg bg-mercury-50 p-2.5">
                    <strong>CANT. {item.cantidad}:</strong> {item.descripcionDetallada}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 rounded-xl border border-mercury-200 p-4 text-xs text-mercury-700">
              <div>
                <p className="font-bold text-primary-800">2. Catálogo de Convenio Marco vigente:</p>
                <p className="mt-0.5">
                  {ETIQUETAS_CONVENIO_MARCO_TD[formulario.tratoDirecto.situacionConvenioMarco]}
                </p>
              </div>

              <div>
                <p className="font-bold text-primary-800">
                  3. Causal Artículo 71 Reglamento Ley de Compras N° 19.886:
                </p>
                <p className="mt-0.5 font-semibold text-mercury-900">
                  {ETIQUETAS_CAUSAL_TRATO_DIRECTO[formulario.tratoDirecto.causal]}
                </p>
              </div>

              <div className="space-y-2 border-t border-mercury-200 pt-3">
                <p className="font-bold text-primary-800">4. Fundamentación de la solicitud:</p>
                <div>
                  <strong>a) Objetivo e importancia de la compra:</strong>
                  <p className="mt-0.5">{formulario.tratoDirecto.objetivoImportancia}</p>
                </div>
                <div>
                  <strong>b) Motivos que argumentan elección del proveedor:</strong>
                  <p className="mt-0.5">{formulario.tratoDirecto.motivosEleccionProveedor}</p>
                </div>
                <div>
                  <strong>c) Justificación de la causal de contratación directa escogida:</strong>
                  <p className="mt-0.5">{formulario.tratoDirecto.justificacionCausalEscogida}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-mercury-200 p-4 text-xs text-mercury-700">
              <h4 className="text-sm font-bold text-primary-800">
                5. Cuadro de Cotización y Condiciones de la Compra
              </h4>

              <div className="grid gap-2 rounded-lg bg-mercury-50 p-3 sm:grid-cols-2">
                <div>
                  <span className="text-mercury-500">(*) RAZÓN SOCIAL PROVEEDOR:</span>{' '}
                  <strong>{formulario.tratoDirecto.proveedorNombre}</strong>
                </div>
                <div>
                  <span className="text-mercury-500">RUT PROVEEDOR:</span>{' '}
                  <strong>{formulario.tratoDirecto.proveedorRut}</strong>
                </div>
              </div>

              <div className="space-y-1.5">
                {formulario.tratoDirecto.lineasCotizacion.map((linea, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-mercury-200 px-3 py-2"
                  >
                    <span>
                      <strong>CANT. {linea.cantidad}</strong> · {linea.detalle} (Unitario neto:{' '}
                      {formatCLP(linea.precioUnitarioNeto)})
                    </span>
                    <strong className="tabular-nums">{formatCLP(linea.precioTotalNeto)}</strong>
                  </div>
                ))}
              </div>

              <div className="space-y-1 border-t border-mercury-200 pt-2 text-right tabular-nums">
                <p>
                  NETO: <strong>{formatCLP(formulario.tratoDirecto.montoNetoClp)}</strong>
                </p>
                <p>
                  IVA: <strong>{formatCLP(formulario.tratoDirecto.montoIvaClp)}</strong>
                </p>
                <p className="text-sm font-bold text-primary-800">
                  TOTAL: {formatCLP(formulario.tratoDirecto.montoTotalClp)}
                </p>
              </div>

              <div className="grid gap-2 border-t border-mercury-200 pt-3 sm:grid-cols-2">
                <div>
                  Plazo de entrega:{' '}
                  <strong>
                    {formulario.tratoDirecto.condicionesCompra.plazoEntregaDiasHabiles} días hábiles
                  </strong>
                </div>
                {formulario.tratoDirecto.condicionesCompra.esServicio && (
                  <div>
                    Vigencia del servicio:{' '}
                    <strong>
                      {formulario.tratoDirecto.condicionesCompra.fechaInicioServicio} —{' '}
                      {formulario.tratoDirecto.condicionesCompra.fechaTerminoServicio}
                    </strong>
                  </div>
                )}
                <div>
                  Garantía:{' '}
                  <strong>
                    {formulario.tratoDirecto.condicionesCompra.requiereGarantia
                      ? `${formulario.tratoDirecto.condicionesCompra.mesesGarantia} meses`
                      : '☒ No requiere garantía'}
                  </strong>
                </div>
                <div>
                  Dirección de despacho:{' '}
                  <strong>
                    {formulario.tratoDirecto.condicionesCompra.aplicaDireccionDespacho
                      ? ETIQUETAS_DIRECCION_DESPACHO[
                          formulario.tratoDirecto.condicionesCompra.direccionDespachoCodigo
                        ]
                      : '☒ No aplica'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="grid gap-4 rounded-xl border border-mercury-200 p-4 text-xs text-mercury-700 sm:grid-cols-2">
              <div>
                <p className="font-bold text-primary-800">
                  6. Coordinador de la Contratación y 10. Imputación CR
                </p>
                <p className="mt-1">
                  Coordinador: <strong>{formulario.coordinador.nombreCompleto}</strong> (RUT:{' '}
                  {formulario.coordinador.run}) — {formulario.coordinador.cargo}
                </p>
                <p className="mt-1">
                  Imputada al CR: <strong>{formulario.coordinador.crCodigo}</strong> —{' '}
                  {formulario.coordinador.crNombre} (Jefe CR:{' '}
                  <strong>{formulario.tratoDirecto.jefeCrNombre}</strong>)
                </p>
              </div>

              <div>
                <p className="font-bold text-primary-800">11. Documentos Adjuntos Acreditados</p>
                <ul className="mt-1 space-y-1">
                  <li>
                    ☒ Cotización: <strong>{formulario.tratoDirecto.nombreArchivoCotizacion}</strong>
                  </li>
                  <li>
                    ☒ Declaración Jurada:{' '}
                    <strong>{formulario.tratoDirecto.nombreArchivoDeclaracionJurada}</strong>
                  </li>
                  {formulario.tratoDirecto.documentosAdicionales.map((doc) => (
                    <li key={doc}>☒ {ETIQUETAS_DOCUMENTOS_ADICIONALES_TD[doc]}</li>
                  ))}
                </ul>
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
                <p>{formulario.tratoDirecto.jefeCrNombre}</p>
                <p className="text-mercury-500">Cargo: {formulario.tratoDirecto.jefeCrCargo}</p>
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
