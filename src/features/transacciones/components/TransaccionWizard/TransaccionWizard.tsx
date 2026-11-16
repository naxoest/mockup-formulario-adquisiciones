import { zodResolver } from '@/lib/zodResolver'
import { useQuery } from '@tanstack/react-query'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import type {
  SolicitudDisponible,
  Transaccion,
  TransaccionFormState,
} from '../../types/transaccion.types'
import { Stepper, useStepper } from '@/components/ui/Stepper'
import { transaccionSchema } from '../../schemas/transaccion.schema'
import { useGuardadoTransaccion } from '@/features/transacciones/hooks/useGuardadoTransaccion'
import {
  financiamientosQueryOptions,
  modalidadesQueryOptions,
  tiposSolicitanteQueryOptions,
  tiposSolicitudQueryOptions,
} from '../../api/listas'
import { unidadesSolicitantesQueryOptions } from '../../api/unidadesSolicitantes'
import { Field, Form } from '@/components/ui/Form'
import { Modal, useConfirm } from '@/components/ui/Modal'
import { toast } from 'sonner'
import { Combobox } from '@/components/ui/Combobox'
import { DatePicker } from '@/components/ui/DatePicker'
import { FieldArray } from '@/components/ui/FieldArray'
import { Input } from '@/components/ui/Input'

import { Button } from '@/components/ui/Button'
import { SolicitanteFields } from './SolicitanteFields'
import { SolicitanteSummary } from './SolicitanteSummary'
import { OrdenDeCompraSummary } from './OrdenDeCompraSummary'
import { SolicitantesOrdenDeCompra } from './SolicitantesOrdenDeCompra'
import { LineasOrdenDeCompraBloqueadas } from './LineasOrdenDeCompraBloqueadas'
import { PanelConciliacion } from './PanelConciliacion'
import type { TransaccionWizardProps } from './TransaccionWizard.types'
import { calcularMontoCotizacion, sumarPrecompromisos } from '../../utils/montos'
import { conciliarMontos } from '../../utils/conciliacion'
import { formatCLP } from '@/utils/currency'
import { formatShortDate } from '@/utils/date'
import {
  getFacturaDefaults,
  getOrdenDeCompraDefaults,
  getTransaccionDefaults,
  getUnidadSolicitanteDefaults,
} from './TransaccionWizard.utils'
import {
  montosDeOrden,
  montosFacturables,
  motivosParaNoQuitar,
  ordenesCanceladas,
  ordenesConFacturas,
  reconciliarFacturas,
  reconciliarIdentificadores,
  reconciliarOrdenesDeCompra,
} from './TransaccionWizard.sincronizacion'
import { DetalleFactura } from './DetalleFactura'
import { FacturaSummary } from './FacturaSummary'
import { ApiError } from '@/lib/apiClient'
import { PasoAdquisiciones } from '@/features/transacciones/components/ProcesoAdquisicion'
import {
  aRegistroPaso,
  esCampoDelPaso,
  hayPasoPendiente,
  valoresInicialesPaso,
} from '@/features/transacciones/components/ProcesoAdquisicion/ProcesoAdquisicion.utils'
import {
  crearRegistroPasoSchema,
  type RegistroPasoValues,
} from '@/features/transacciones/schemas/registroPaso.schema'

export function TransaccionWizard({
  modo,
  defaultValues,
  transaccionInicial = null,
  modalidadPrecargada,
  onComplete,
}: TransaccionWizardProps) {
  const stepper = useStepper({ totalSteps: 4 })
  const { servidor, guardando, guardar, confirmar, registrarPasoProceso, deshacerPasoProceso } =
    useGuardadoTransaccion(transaccionInicial)
  const confirmarDialogo = useConfirm()
  const PASO_SOLICITUD_Y_COTIZACION = 0
  const PASO_ADQUISICIONES = 1
  const form = useForm<TransaccionFormState>({
    resolver: zodResolver(transaccionSchema) as Resolver<TransaccionFormState>,
    defaultValues: defaultValues ?? getTransaccionDefaults(),
    mode: 'onTouched',
  })

  const solicitantesWatch = useWatch({
    control: form.control,
    name: 'solicitantes',
  })

  const montoCotizacionTotal = calcularMontoCotizacion(solicitantesWatch)

  const totalSolicitantes = solicitantesWatch?.length ?? 0

  const solicitantesSinCotizacion = (solicitantesWatch ?? []).filter(
    (solicitante) => sumarPrecompromisos(solicitante.precompromisos) === null,
  ).length

  const financiamientoQuery = useQuery(financiamientosQueryOptions)

  const tiposSolicitanteQuery = useQuery(tiposSolicitanteQueryOptions)

  const tipoQuery = useQuery(tiposSolicitudQueryOptions)

  const modalidadQuery = useQuery(modalidadesQueryOptions)

  const todasLasUnidadesQuery = useQuery(unidadesSolicitantesQueryOptions('', '', ''))

  const ordenesDeCompraWatch = useWatch({
    control: form.control,
    name: 'ordenesDeCompra',
  })

  const conciliacion = conciliarMontos(solicitantesWatch, ordenesDeCompraWatch)

  const facturables = montosFacturables(servidor)
  const montosDeOrdenServidor = montosDeOrden(servidor)

  const facturasWatch = useWatch({
    control: form.control,
    name: 'facturas',
  })

  const modalidadWatch = useWatch({ control: form.control, name: 'modalidad' })
  const ordenesBloqueadas = ordenesConFacturas(servidor)
  const ordenesCanceladasEnServidor = ordenesCanceladas(servidor)
  const motivosBloqueoSolicitantes = motivosParaNoQuitar(
    solicitantesWatch ?? [],
    ordenesDeCompraWatch ?? [],
    servidor,
  )
  const transaccionConfirmada = servidor !== null && servidor.confirmadaEn !== null

  const sinGuardadoDisponible = servidor === null && !modalidadWatch
  const formularioPaso = useForm<RegistroPasoValues>({
    resolver: zodResolver(crearRegistroPasoSchema(servidor?.proceso.siguientesPermitidos ?? [])),
    values: valoresInicialesPaso(servidor?.proceso ?? null),
  })

  const solicitudesDisponibles: SolicitudDisponible[] = (solicitantesWatch ?? []).map(
    (solicitud, posicion) => {
      const unidad = todasLasUnidadesQuery.data?.find((item) => item.value === solicitud.nombre)

      return {
        claveFormulario: solicitud.claveFormulario,
        ordinal: posicion + 1,
        tipo: solicitud.tipo,
        unidad: unidad?.nombre ?? solicitud.nombre,
        sedes: unidad?.etiquetaSedes ?? '',
        tipoSolicitud: solicitud.tipoSolicitud,
        etiquetaTipoSolicitud:
          tipoQuery.data?.find((item) => item.value === solicitud.tipoSolicitud)?.label ??
          solicitud.tipoSolicitud,
        cr: solicitud.cr,
        id: solicitud.id,
        precompromisos: solicitud.precompromisos,
      }
    },
  )

  const fieldsPorPaso: Array<Array<keyof TransaccionFormState>> = [
    ['nombre', 'linkCarpetaAntecedentes', 'solicitantes', 'fecha', 'modalidad'],
    [],
    ['ordenesDeCompra'],
    ['facturas'],
  ]

  const handleNext = async () => {
    const fields = fieldsPorPaso[stepper.active]
    const ok = fields.length > 0 ? await form.trigger(fields) : true

    if (!ok) return

    if (stepper.active === PASO_ADQUISICIONES && hayPasoPendiente(servidor)) {
      await registrarPasoPendiente()
      return
    }

    if (stepper.active === PASO_SOLICITUD_Y_COTIZACION) {
      try {
        await guardarYSincronizar()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'No se pudo guardar el avance')
        return
      }
    }

    stepper.next()
  }

  const registrarPasoPendiente = formularioPaso.handleSubmit(async (valores) => {
    let transaccion: Transaccion

    try {
      transaccion = await guardarYSincronizar()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar el avance')
      return
    }

    try {
      await registrarPasoProceso(transaccion.id, aRegistroPaso(valores))
      toast.success('Paso registrado')
    } catch (error) {
      if (error instanceof ApiError && esCampoDelPaso(error.field)) {
        formularioPaso.setError(error.field, { message: error.message })
        return
      }

      toast.error(error instanceof Error ? error.message : 'No se pudo registrar el paso')
    }
  })

  const guardarYSincronizar = async () => {
    const transaccion = await guardar(form.getValues())

    form.setValue('id', transaccion.id)
    form.setValue('facturas', reconciliarFacturas(form.getValues('facturas'), transaccion))
    form.setValue(
      'ordenesDeCompra',
      reconciliarOrdenesDeCompra(form.getValues('ordenesDeCompra'), transaccion),
    )
    form.setValue(
      'solicitantes',
      reconciliarIdentificadores(form.getValues('solicitantes'), transaccion),
    )

    return transaccion
  }

  const handleGuardarAvance = async () => {
    const fields = fieldsPorPaso[stepper.active]
    const ok = fields.length > 0 ? await form.trigger(fields) : true

    if (!ok) return

    if (
      stepper.active === PASO_ADQUISICIONES &&
      hayPasoPendiente(servidor) &&
      formularioPaso.getValues('fecha') !== null
    ) {
      await registrarPasoPendiente()
      return
    }

    try {
      await guardarYSincronizar()
      toast.success('Avance guardado')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar el avance')
    }
  }

  const handleStepperClick = (target: number) => {
    if (guardando) return

    if (target <= stepper.active || modo === 'editar') {
      stepper.goTo(target)
    }
  }

  const handleConfirmar = async () => {
    const ok = await form.trigger()

    if (!ok) {
      toast.error('Complete los datos obligatorios antes de confirmar')
      return
    }

    await confirmarDialogo({
      title: 'Confirmar la transacción',
      message:
        'La transacción dejará de ser un borrador y quedará visible en el listado. Sus solicitudes pasarán a estado enviada. Esta acción no se puede deshacer.',
      variant: 'info',
      confirmText: 'Confirmar transacción',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await guardarYSincronizar()
          const confirmada = await confirmar()
          toast.success('Transacción confirmada')
          onComplete(confirmada.id)
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : 'No se pudo confirmar la transacción',
          )
        }
      },
    })
  }

  const handleComplete = async () => {
    try {
      const transaccion = await guardarYSincronizar()
      onComplete(transaccion.id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar la transacción')
    }
  }

  return (
    <Form form={form} onSubmit={handleComplete} className="flex min-h-0 flex-1 flex-col">
      <Modal.Body>
        <Stepper
          active={stepper.active}
          onStepClick={handleStepperClick}
          allowNextStepsSelect={modo === 'editar'}
          contentClassName="space-y-6"
        >
          <Stepper.Step
            label="Solicitud y Cotización"
            description="Identificación, solicitantes y cotización"
          >
            <div>
              <h3 className="mb-1.5 text-base font-semibold text-mercury-900">
                Datos de la solicitud
              </h3>
              <p className="mb-3 text-xs text-mercury-500">
                Nombre, carpeta de antecedentes y fecha de registro de la transacción.
              </p>
              <div className="space-y-4">
                <Field
                  name="nombre"
                  label="Nombre de la transacción"
                  description="Nombre con el que se identifica la transacción en el sistema."
                  required
                >
                  <Input />
                </Field>
                <Field
                  name="linkCarpetaAntecedentes"
                  label="Carpeta de antecedentes"
                  description="Copie el enlace de la carpeta donde se guardan los antecedentes de la transacción y péguelo aquí. Debe comenzar con https:// o http://."
                  optional
                >
                  <Input inputMode="url" />
                </Field>

                <Field
                  name="fecha"
                  label="Fecha"
                  description="Fecha en que se registra la solicitud."
                  required
                >
                  <DatePicker minDate={new Date()} />
                </Field>
              </div>
            </div>
            <div>
              <h3 className="mb-1.5 text-base font-semibold text-mercury-900">
                Modalidad de compra
              </h3>
              <p className="mb-3 text-xs text-mercury-500">
                Mecanismo por el cual se ejecuta la compra y estado de su evaluación.
              </p>
              <div className="space-y-4">
                <Field
                  name="modalidad"
                  label="Modalidad"
                  description="Vía de compra aplicable a esta transacción."
                  required
                >
                  <Combobox
                    options={modalidadQuery.data ?? []}
                    loading={modalidadQuery.isLoading}
                    placeholder="Seleccione una modalidad"
                    selectedOption={modalidadPrecargada}
                  />
                </Field>
              </div>
            </div>
            <div>
              <h3 className="mb-1.5 text-base font-semibold text-mercury-900">
                Unidades o Carreras que realizaron una solicitud
              </h3>
              <FieldArray<TransaccionFormState>
                name="solicitantes"
                description="Agregue las carreras que realizaron una solicitud y señale el tipo de solicitud que realizó. Esta información se guardará como una solicitud y tendrá su propio identificador. Nota: el CR de cada unidad y carrera es un dato almacenado de forma interna y no hace falta ingresarlo."
                defaultItem={getUnidadSolicitanteDefaults}
                max={8}
                addLabel="Agregar solicitante"
                itemLabel={(i) => `Solicitante ${i + 1}`}
                emptyState="Aún no ha agregado ningún solicitante"
                canRemove={(i) => (motivosBloqueoSolicitantes[i] ?? null) === null}
                renderSummary={({ index, hasError }) => (
                  <SolicitanteSummary
                    index={index}
                    hasError={hasError}
                    mostrarCotizacion
                    motivoBloqueo={motivosBloqueoSolicitantes[index] ?? null}
                  />
                )}
                renderDetail={({ index }) => (
                  <SolicitanteFields
                    index={index}
                    tiposSolicitantes={tiposSolicitanteQuery.data ?? []}
                    isTiposLoading={tiposSolicitanteQuery.isLoading}
                    tiposSolicitud={tipoQuery.data ?? []}
                    cargandoTiposSolicitud={tipoQuery.isLoading}
                    financiamientos={financiamientoQuery.data ?? []}
                    cargandoFinanciamientos={financiamientoQuery.isLoading}
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-2 border-t border-mercury-200 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-medium text-mercury-700">Valor cotización</span>
                <span className="truncate text-xs text-mercury-500">
                  {totalSolicitantes === 1 ? '1 solicitante' : `${totalSolicitantes} solicitantes`}
                  {solicitantesSinCotizacion > 0 &&
                    ` · ${solicitantesSinCotizacion} sin cotización`}
                </span>
              </span>
              <span className="shrink-0 text-2xl font-semibold tabular-nums text-mercury-900">
                {formatCLP(montoCotizacionTotal)}
              </span>
            </div>
          </Stepper.Step>
          <Stepper.Step label="Adquisición" description="Proceso de adquisición">
            {servidor !== null ? (
              <PasoAdquisiciones
                transaccion={servidor}
                formularioPaso={formularioPaso}
                onDeshacerPaso={deshacerPasoProceso}
              />
            ) : (
              <p className="rounded-lg border border-dashed border-mercury-300 px-4 py-6 text-center text-sm text-mercury-500">
                Para registrar pasos del proceso de adquisición primero debe guardar el avance con
                la modalidad seleccionada.
              </p>
            )}
          </Stepper.Step>
          <Stepper.Step
            label="Orden de Compra"
            description="OC y montos (Completar cuando exista OC)"
          >
            <PanelConciliacion conciliacion={conciliacion} solicitudes={solicitudesDisponibles} />
            <div>
              <h3 className="mb-1.5 text-base font-semibold text-mercury-900">Órdenes de compra</h3>
              <FieldArray<TransaccionFormState>
                name="ordenesDeCompra"
                description={
                  transaccionConfirmada
                    ? 'Se registra las órdenes emitidas y reparte su monto entre los solicitantes que participan en cada una. Una vez confirmada la transacción, las órdenes registradas no pueden eliminarse: si una orden no corresponde, debe cancelarse.'
                    : 'Se registra las órdenes emitidas y reparte su monto entre los solicitantes que participan en cada una.'
                }
                defaultItem={getOrdenDeCompraDefaults}
                max={8}
                addLabel="Agregar orden de compra"
                itemLabel={(i) => `Orden de compra ${i + 1}`}
                emptyState="Aún no ha agregado ninguna orden de compra"
                canRemove={(i) => {
                  const id = ordenesDeCompraWatch?.[i]?.id ?? null

                  if (id === null) {
                    return true
                  }

                  if (transaccionConfirmada) {
                    return false
                  }

                  return !ordenesBloqueadas.has(id)
                }}
                renderSummary={({ index, hasError }) => (
                  <OrdenDeCompraSummary index={index} hasError={hasError} />
                )}
                renderDetail={({ index }) => {
                  const id = ordenesDeCompraWatch?.[index]?.id ?? null
                  const cancelada = id !== null && ordenesCanceladasEnServidor.has(id)
                  const conFacturas = id !== null && ordenesBloqueadas.has(id)

                  return (
                    <div className="space-y-4">
                      {cancelada ? (
                        <dl className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <dt className="text-sm font-medium text-mercury-700">
                              Código de orden de compra
                            </dt>
                            <dd className="mt-1 font-mono text-sm text-mercury-900">
                              {ordenesDeCompraWatch?.[index]?.codigo}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-mercury-700">
                              Fecha de emisión
                            </dt>
                            <dd className="mt-1 text-sm text-mercury-900">
                              {ordenesDeCompraWatch?.[index]?.fechaEmision
                                ? formatShortDate(ordenesDeCompraWatch[index].fechaEmision)
                                : '—'}
                            </dd>
                          </div>
                        </dl>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field<TransaccionFormState>
                            name={`ordenesDeCompra.${index}.codigo`}
                            label="Código de orden de compra"
                            description="Ingrese el código identificador de la orden de compra a ingresar."
                            required
                          >
                            <Input placeholder="Ej: OC 5432-10-AB12" />
                          </Field>
                          <Field<TransaccionFormState>
                            name={`ordenesDeCompra.${index}.fechaEmision`}
                            label="Fecha de emisión"
                            description="Fecha que consta en la orden de compra."
                            required
                          >
                            <DatePicker maxDate={new Date()} placeholder="Seleccione una fecha" />
                          </Field>
                        </div>
                      )}

                      {cancelada && (
                        <div className="rounded-lg border border-saffron-300 bg-saffron-50 px-4 py-3">
                          <p className="text-sm font-medium text-saffron-800">
                            Esta orden está cancelada
                          </p>
                          <p className="mt-1 text-xs text-saffron-700">
                            Una orden cancelada no se puede modificar ni eliminar.
                          </p>
                        </div>
                      )}

                      {!cancelada && conFacturas && (
                        <div className="rounded-lg border border-saffron-300 bg-saffron-50 px-4 py-3">
                          <p className="text-sm font-medium text-saffron-800">
                            Las líneas de esta orden no se pueden modificar
                          </p>
                          <p className="mt-1 text-xs text-saffron-700">
                            La orden tiene facturas registradas, aunque estén rechazadas, por lo que
                            no se puede cambiar el reparto de montos ni eliminarla. El código y la
                            fecha de emisión sí se pueden corregir.
                          </p>
                        </div>
                      )}

                      {cancelada || conFacturas ? (
                        <LineasOrdenDeCompraBloqueadas
                          index={index}
                          solicitudes={solicitudesDisponibles}
                        />
                      ) : (
                        <SolicitantesOrdenDeCompra
                          index={index}
                          solicitudes={solicitudesDisponibles}
                          conciliacion={conciliacion}
                        />
                      )}
                    </div>
                  )
                }}
              />
            </div>
          </Stepper.Step>
          <Stepper.Step label="Factura y Cierre" description="Facturación y observaciones">
            {facturables.length === 0 && (facturasWatch ?? []).length === 0 ? (
              <p className="rounded-lg border border-dashed border-mercury-300 px-4 py-6 text-center text-sm text-mercury-500">
                Para registrar una factura primero debe guardar una orden de compra con sus montos
                en el paso anterior.
              </p>
            ) : (
              <div>
                <h3 className="mb-1.5 text-base font-semibold text-mercury-900">Facturas</h3>
                <FieldArray<TransaccionFormState>
                  name="facturas"
                  description="Registre las facturas emitidas por el proveedor y reparta su monto entre los montos de orden que cubre. Si lo facturado supera el monto de una orden, se indica el exceso. Las líneas de una factura ya registrada no se pueden modificar."
                  defaultItem={getFacturaDefaults}
                  max={8}
                  addLabel="Agregar factura"
                  itemLabel={(i) => `Factura ${i + 1}`}
                  emptyState="Aún no ha agregado ninguna factura"
                  canRemove={(i) =>
                    (facturasWatch?.[i]?.id ?? null) === null || !transaccionConfirmada
                  }
                  renderSummary={({ index, hasError }) => (
                    <FacturaSummary index={index} hasError={hasError} />
                  )}
                  renderDetail={({ index }) => (
                    <DetalleFactura
                      index={index}
                      facturables={facturables}
                      montosDeOrden={montosDeOrdenServidor}
                      transaccionConfirmada={transaccionConfirmada}
                    />
                  )}
                />
              </div>
            )}
          </Stepper.Step>
        </Stepper>
      </Modal.Body>
      <Modal.Footer className="items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={stepper.previous}
          disabled={stepper.isFirst || guardando}
        >
          Anterior
        </Button>
        <span className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleGuardarAvance}
            loading={guardando}
            disabled={sinGuardadoDisponible}
            title={
              sinGuardadoDisponible
                ? 'Para guardar el avance primero debe indicar la modalidad'
                : undefined
            }
          >
            Guardar avance
          </Button>
          {stepper.isLast ? (
            servidor !== null && servidor.confirmadaEn === null ? (
              <Button
                key="btn-confirmar"
                type="button"
                onClick={handleConfirmar}
                loading={guardando}
              >
                Confirmar transacción
              </Button>
            ) : (
              <Button key="btn-submit" type="submit" loading={guardando}>
                Guardar transacción
              </Button>
            )
          ) : (
            <Button key="btn-next" type="button" onClick={handleNext} loading={guardando}>
              Siguiente
            </Button>
          )}
        </span>
      </Modal.Footer>
    </Form>
  )
}
