import type { SelectOption } from '@/types/select'
import { Combobox } from '@/components/ui/Combobox'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Field } from '@/components/ui/Form'
import { useCascadaSolicitante } from '@/features/transacciones/hooks/useCascadaSolicitante'
import type { TransaccionFormState } from '../../types/transaccion.types'
import { PrecompromisosSolicitud } from './PrecompromisosSolicitud'

export function SolicitanteFields({
  index,
  tiposSolicitantes,
  isTiposLoading,
  tiposSolicitud,
  cargandoTiposSolicitud,
  financiamientos,
  cargandoFinanciamientos,
}: {
  index: number
  tiposSolicitantes: SelectOption[]
  isTiposLoading: boolean
  tiposSolicitud: SelectOption[]
  cargandoTiposSolicitud: boolean
  financiamientos: SelectOption[]
  cargandoFinanciamientos: boolean
}) {
  const {
    tipoSolicitud,
    tipoSolicitante,
    campus,
    nombreSolicitante,
    busquedaSolicitante,
    setBusquedaSolicitante,
    opcionesCampus,
    cargandoCampus,
    opcionesSolicitantes,
    cargandoSolicitantes,
    unidadesDelTipo,
  } = useCascadaSolicitante(index)

  const etiquetaTipoSolicitud =
    tiposSolicitud.find((opcion) => opcion.value === tipoSolicitud)?.label ?? tipoSolicitud

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field<TransaccionFormState>
        name={`solicitantes.${index}.tipoSolicitud`}
        label="Tipo de solicitud de compra solicitada"
        required
      >
        <Select disabled={cargandoTiposSolicitud}>
          <option value="">
            {cargandoTiposSolicitud ? 'Cargando...' : 'Seleccione un tipo de solicitud'}
          </option>
          {tiposSolicitud.map((opcion) => (
            <option key={opcion.value} value={opcion.value}>
              {opcion.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field<TransaccionFormState>
        name={`solicitantes.${index}.tipo`}
        label="Tipo de solicitante"
        required
      >
        <Combobox
          options={tiposSolicitantes}
          loading={isTiposLoading}
          placeholder="Seleccione un tipo"
          selectedOption={
            tipoSolicitante
              ? (tiposSolicitantes.find((opt) => opt.value === tipoSolicitante) ?? {
                  value: tipoSolicitante,
                  label: tipoSolicitante.charAt(0).toUpperCase() + tipoSolicitante.slice(1),
                })
              : null
          }
        />
      </Field>
      <Field<TransaccionFormState>
        name={`solicitantes.${index}.campus`}
        label="Campus"
        description="Permite filtrar la búsqueda. No se guarda en la solicitud."
        optional
      >
        <Combobox
          options={opcionesCampus}
          loading={cargandoCampus}
          disabled={!tipoSolicitante}
          placeholder={
            tipoSolicitante ? 'Todos los campus' : 'Elija primero un tipo de solicitante'
          }
          selectedOption={
            campus
              ? (opcionesCampus.find((opt) => opt.value === campus) ?? {
                  value: campus,
                  label: campus,
                })
              : null
          }
        />
      </Field>
      <Field<TransaccionFormState>
        name={`solicitantes.${index}.nombre`}
        label="Nombre"
        description="Entre paréntesis se indican las sedes de cada opción."
        required
      >
        <Combobox
          options={opcionesSolicitantes}
          searchValue={busquedaSolicitante}
          onSearchChange={setBusquedaSolicitante}
          loading={cargandoSolicitantes}
          disabled={!tipoSolicitante}
          placeholder={
            tipoSolicitante ? 'Busque un solicitante' : 'Elija primero un tipo de solicitante'
          }
          selectedOption={
            nombreSolicitante
              ? (unidadesDelTipo.find((opt) => opt.value === nombreSolicitante) ?? {
                  value: nombreSolicitante,
                  label: nombreSolicitante,
                })
              : null
          }
        />
      </Field>
      {tipoSolicitud && (
        <Field<TransaccionFormState>
          name={`solicitantes.${index}.codigoSaserviSabienes`}
          label={`Código de ${etiquetaTipoSolicitud}`}
          description="Ingrese solo números."
          optional
          className="sm:col-span-2"
        >
          <Input inputMode="numeric" />
        </Field>
      )}
      <Field<TransaccionFormState>
        name={`solicitantes.${index}.financiamiento`}
        label="Financiamiento"
        description="Fondo institucional con cargo al cual se ejecuta la compra de esta solicitud."
        optional
        className="sm:col-span-2"
      >
        <Combobox
          options={financiamientos}
          loading={cargandoFinanciamientos}
          placeholder="Seleccione un financiamiento"
        />
      </Field>
      <Field<TransaccionFormState>
        name={`solicitantes.${index}.precompromisos`}
        label="Cotización por año presupuestario"
        description="Ingrese el valor de cotización de esta solicitud separado por año presupuestario. Cada año puede registrarse una sola vez."
        className="border-t border-mercury-200 pt-4 sm:col-span-2"
      >
        <PrecompromisosSolicitud index={index} />
      </Field>
    </div>
  )
}
