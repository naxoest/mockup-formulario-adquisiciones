import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useWatch, type UseFormReturn } from 'react-hook-form'
import type { ComboboxOption } from '@/components/ui/Combobox'
import {
  campusSolicitanteQueryOptions,
  tiposSolicitanteQueryOptions,
  unidadesSolicitantesQueryOptions,
} from '@/features/requerimientos/api/catalogoSolicitante'
import type { ImportacionFormValores } from '@/features/requerimientos/schemas/importacionForm.schema'

export function useCascadaSolicitanteImportacion(form: UseFormReturn<ImportacionFormValores>) {
  const { control, watch, setValue } = form
  const tipoSolicitante = useWatch({ control, name: 'tipoSolicitante' })
  const campus = useWatch({ control, name: 'campus' })

  const consultaTipos = useQuery(tiposSolicitanteQueryOptions)

  const consultaCampus = useQuery({
    ...campusSolicitanteQueryOptions(tipoSolicitante),
    enabled: tipoSolicitante !== '',
  })

  const consultaUnidades = useQuery({
    ...unidadesSolicitantesQueryOptions(tipoSolicitante, campus),
    enabled: tipoSolicitante !== '' && campus !== '',
  })

  useEffect(() => {
    const suscripcion = watch((_valores, { name, type }) => {
      if (type !== 'change') {
        return
      }

      if (name === 'tipoSolicitante') {
        setValue('campus', '', { shouldValidate: false })
        setValue('solicitante', '', { shouldValidate: false })
        return
      }

      if (name === 'campus') {
        setValue('solicitante', '', { shouldValidate: false })
      }
    })

    return () => suscripcion.unsubscribe()
  }, [watch, setValue])

  const opcionesSolicitante = useMemo<ComboboxOption[]>(
    () =>
      (consultaUnidades.data ?? []).map((unidad) => ({
        value: String(unidad.id),
        label: unidad.label,
        disabled: !unidad.activo,
        description: unidad.activo ? undefined : 'Inactiva',
      })),
    [consultaUnidades.data],
  )

  return {
    tipoSolicitante,
    campus,

    opcionesTipo: consultaTipos.data ?? [],
    cargandoTipos: consultaTipos.isFetching,
    opcionesCampus: consultaCampus.data ?? [],
    cargandoCampus: consultaCampus.isFetching,
    opcionesSolicitante,
    cargandoSolicitantes: consultaUnidades.isFetching,
  }
}
