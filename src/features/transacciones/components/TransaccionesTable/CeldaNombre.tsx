import { NombreTransaccion } from '@/features/transacciones/components/NombreTransaccion'

export function CeldaNombre({
  id,
  nombre,
  enlace,
}: {
  id: number
  nombre: string
  enlace: string | null
}) {
  return (
    <span className="flex flex-col gap-0.5">
      <span className="font-medium text-mercury-800">
        <NombreTransaccion nombre={nombre} enlace={enlace} />
      </span>
      <span className="text-xs tabular-nums text-mercury-500">#{id}</span>
    </span>
  )
}
