import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal, type ModalComponentProps } from '@/components/ui/Modal'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { usePortadaPerfil } from '@/features/usuarios/hooks/usePortadaPerfil'
import { ApiError } from '@/lib/apiClient'
import { cn } from '@/utils/cn'
import type { PortadaResuelta } from '@/features/usuarios/types/imagen.types'

interface ModalPortadaPerfilProps extends ModalComponentProps<boolean> {
  portadas: readonly PortadaResuelta[]
  actual: string | null
}

interface OpcionPortadaProps {
  nombre: string
  portada?: PortadaResuelta
}

const SIN_PORTADA = ''

function OpcionPortada({ nombre, portada }: OpcionPortadaProps) {
  return (
    <span className="flex w-56 flex-col gap-1.5">
      <span className="block aspect-[4/1] overflow-hidden rounded-md bg-linear-to-r from-primary-800 to-primary-600">
        {portada !== undefined && (
          <img
            src={portada.miniatura}
            alt=""
            loading="lazy"
            className={cn('size-full object-cover', portada.encuadre)}
          />
        )}
      </span>
      <span>{nombre}</span>
    </span>
  )
}

export function ModalPortadaPerfil({
  portadas,
  actual,
  open,
  resolve,
  onExited,
}: ModalPortadaPerfilProps) {
  const { elegir, quitar } = usePortadaPerfil()
  const inicial =
    actual !== null && portadas.some((portada) => portada.clave === actual) ? actual : SIN_PORTADA
  const [seleccion, setSeleccion] = useState(inicial)
  const [error, setError] = useState<string | null>(null)

  const guardando = elegir.isPending || quitar.isPending

  const cerrar = () => {
    if (guardando) return
    resolve(false)
  }

  const guardar = async () => {
    setError(null)

    try {
      if (seleccion === SIN_PORTADA) {
        await quitar.mutateAsync()
      } else {
        await elegir.mutateAsync(seleccion)
      }
      resolve(true)
    } catch (falla) {
      setError(
        falla instanceof ApiError
          ? falla.message
          : 'No se pudo guardar la portada. Intente nuevamente.',
      )
    }
  }

  const opciones = [
    { value: SIN_PORTADA, label: <OpcionPortada nombre="Sin portada" /> },
    ...portadas.map((portada) => ({
      value: portada.clave,
      label: <OpcionPortada nombre={portada.nombre} portada={portada} />,
    })),
  ]

  return (
    <Modal
      open={open}
      onClose={cerrar}
      onExited={onExited}
      size="lg"
      closeOnBackdrop={!guardando}
      closeOnEscape={!guardando}
      showCloseButton={!guardando}
    >
      <Modal.Header>Portada</Modal.Header>
      <Modal.Body className="space-y-4">
        <RadioGroup
          legend="Elija una portada"
          orientation="horizontal"
          options={opciones}
          value={seleccion}
          onChange={setSeleccion}
          disabled={guardando}
        />
        {error !== null && (
          <p
            role="alert"
            className="rounded-md border border-scarlet-200 bg-scarlet-50 px-3 py-2 text-sm text-scarlet-700"
          >
            {error}
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={cerrar} disabled={guardando}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={() => void guardar()}
          loading={guardando}
          disabled={seleccion === inicial}
        >
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
