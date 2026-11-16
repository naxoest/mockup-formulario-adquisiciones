import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useFormContext, useWatch } from 'react-hook-form'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import {
  campusQueryOptions,
  unidadesSolicitantesQueryOptions,
} from '@/features/transacciones/api/unidadesSolicitantes'
import type { TransaccionFormState } from '@/features/transacciones/types/transaccion.types'

export function useCascadaSolicitante(index: number) {
  const { setValue, getValues, watch } = useFormContext<TransaccionFormState>()

  const tipoSolicitud = useWatch<TransaccionFormState>({
    name: `solicitantes.${index}.tipoSolicitud`,
  }) as string | undefined

  const tipoSolicitante = useWatch<TransaccionFormState>({
    name: `solicitantes.${index}.tipo`,
  }) as string | undefined

  const campus = useWatch<TransaccionFormState>({
    name: `solicitantes.${index}.campus`,
  }) as string | undefined

  const nombreSolicitante = useWatch<TransaccionFormState>({
    name: `solicitantes.${index}.nombre`,
  }) as string | undefined

  const [busquedaSolicitante, setBusquedaSolicitante] = useState('')
  const busquedaSolicitanteDebounced = useDebouncedValue(busquedaSolicitante, 250)

  const campusQuery = useQuery({
    ...campusQueryOptions(tipoSolicitante ?? ''),
    enabled: !!tipoSolicitante,
  })

  const solicitantesQuery = useQuery({
    ...unidadesSolicitantesQueryOptions(
      tipoSolicitante ?? '',
      campus ?? '',
      busquedaSolicitanteDebounced,
    ),
    enabled: !!tipoSolicitante,
  })

  const unidadesDelTipoQuery = useQuery({
    ...unidadesSolicitantesQueryOptions(tipoSolicitante ?? '', '', ''),
    enabled: !!tipoSolicitante,
  })

  const unidadesDelTipo = unidadesDelTipoQuery.data

  useEffect(() => {
    const subscription = watch((_valores, { name, type }) => {
      if (type !== 'change') return

      if (name === `solicitantes.${index}.tipoSolicitud`) {
        setValue(`solicitantes.${index}.codigoSaserviSabienes`, '', { shouldValidate: true })
        return
      }

      if (name === `solicitantes.${index}.tipo`) {
        setValue(`solicitantes.${index}.campus`, '', { shouldValidate: false })
        setValue(`solicitantes.${index}.nombre`, '', { shouldValidate: false })
        setValue(`solicitantes.${index}.unidadId`, null, { shouldValidate: false })
        setBusquedaSolicitante('')
        return
      }

      if (name === `solicitantes.${index}.campus`) {
        const campusElegido = getValues(`solicitantes.${index}.campus`)
        const nombreActual = getValues(`solicitantes.${index}.nombre`)
        const unidad = unidadesDelTipo?.find((item) => item.value === nombreActual)
        const fueraDelCampus =
          unidad !== undefined &&
          campusElegido !== '' &&
          !unidad.sedes.some((sede) => sede.value === campusElegido)

        if (fueraDelCampus) {
          setValue(`solicitantes.${index}.nombre`, '', { shouldValidate: false })
          setValue(`solicitantes.${index}.unidadId`, null, { shouldValidate: false })
        }

        setBusquedaSolicitante('')
      }
    })

    return () => subscription.unsubscribe()
  }, [watch, setValue, getValues, index, unidadesDelTipo])

  useEffect(() => {
    const unidad = nombreSolicitante
      ? unidadesDelTipo?.find((item) => item.value === nombreSolicitante)
      : undefined
    const crResuelto = unidad?.cr ?? 0
    const unidadIdResuelto = unidad?.id ?? null

    if (getValues(`solicitantes.${index}.cr`) !== crResuelto) {
      setValue(`solicitantes.${index}.cr`, crResuelto, { shouldValidate: false })
    }

    if (getValues(`solicitantes.${index}.unidadId`) !== unidadIdResuelto) {
      setValue(`solicitantes.${index}.unidadId`, unidadIdResuelto, {
        shouldValidate: unidadIdResuelto !== null,
      })
    }
  }, [nombreSolicitante, unidadesDelTipo, getValues, setValue, index])

  return {
    tipoSolicitud,
    tipoSolicitante,
    campus,
    nombreSolicitante,
    busquedaSolicitante,
    setBusquedaSolicitante,
    opcionesCampus: campusQuery.data ?? [],
    cargandoCampus: campusQuery.isFetching,
    opcionesSolicitantes: solicitantesQuery.data ?? [],
    cargandoSolicitantes: solicitantesQuery.isFetching,
    unidadesDelTipo: unidadesDelTipo ?? [],
  }
}
