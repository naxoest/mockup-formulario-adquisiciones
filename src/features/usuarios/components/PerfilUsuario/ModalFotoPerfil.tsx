import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { Trash2, Upload } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Modal, useConfirm, type ModalComponentProps } from '@/components/ui/Modal'
import { useFotoPerfil } from '@/features/usuarios/hooks/useFotoPerfil'
import {
  cargarImagen,
  mensajeErrorFoto,
  recortarFoto,
  TIPOS_IMAGEN_ADMITIDOS,
  validarArchivoImagen,
  validarDimensionesFoto,
} from '@/features/usuarios/utils/imagen'

interface ModalFotoPerfilProps extends ModalComponentProps<boolean> {
  foto?: string
  iniciales: string
  semilla: string | number
}

type Paso = { tipo: 'seleccion' } | { tipo: 'recorte'; url: string; imagen: HTMLImageElement }

const ACEPTADOS = TIPOS_IMAGEN_ADMITIDOS.join(',')
const POSICION_INICIAL: Point = { x: 0, y: 0 }
const ZOOM_MINIMO = 1
const ZOOM_MAXIMO = 3

export function ModalFotoPerfil({
  foto,
  iniciales,
  semilla,
  open,
  resolve,
  onExited,
}: ModalFotoPerfilProps) {
  const confirmar = useConfirm()
  const { subir, quitar } = useFotoPerfil()
  const entradaRef = useRef<HTMLInputElement>(null)
  const idZoom = useId()
  const idInstrucciones = useId()
  const [paso, setPaso] = useState<Paso>({ tipo: 'seleccion' })
  const [error, setError] = useState<string | null>(null)
  const [leyendo, setLeyendo] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [posicion, setPosicion] = useState<Point>(POSICION_INICIAL)
  const [zoom, setZoom] = useState(ZOOM_MINIMO)
  const [area, setArea] = useState<Area | null>(null)

  useEffect(() => {
    if (paso.tipo !== 'recorte') return

    const { url } = paso

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [paso])

  const ocupado = leyendo || guardando || quitar.isPending

  const cerrar = () => {
    if (ocupado) return
    resolve(false)
  }

  const elegirArchivo = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0]
    evento.target.value = ''

    if (archivo === undefined) return

    const rechazo = validarArchivoImagen(archivo)

    if (rechazo !== null) {
      setError(rechazo)
      return
    }

    const url = URL.createObjectURL(archivo)
    setLeyendo(true)

    try {
      const imagen = await cargarImagen(url)
      const rechazoDimensiones = validarDimensionesFoto(imagen.naturalWidth, imagen.naturalHeight)

      if (rechazoDimensiones !== null) {
        URL.revokeObjectURL(url)
        setError(rechazoDimensiones)
        return
      }

      setError(null)
      setPosicion(POSICION_INICIAL)
      setZoom(ZOOM_MINIMO)
      setArea(null)
      setPaso({ tipo: 'recorte', url, imagen })
    } catch {
      URL.revokeObjectURL(url)
      setError('No se pudo leer la imagen. Pruebe con otro archivo.')
    } finally {
      setLeyendo(false)
    }
  }

  const volver = () => {
    setError(null)
    setPaso({ tipo: 'seleccion' })
  }

  const guardar = async () => {
    if (paso.tipo !== 'recorte' || area === null) return

    setError(null)
    setGuardando(true)

    try {
      const imagen = await recortarFoto(paso.imagen, area)
      await subir.mutateAsync(imagen)
      resolve(true)
    } catch (falla) {
      setError(mensajeErrorFoto(falla, 'No se pudo guardar la foto. Intente nuevamente.'))
    } finally {
      setGuardando(false)
    }
  }

  const quitarFoto = async () => {
    const confirmado = await confirmar({
      title: 'Quitar la foto de perfil',
      message: 'Su foto dejará de mostrarse y en su lugar aparecerán sus iniciales.',
      variant: 'warning',
      confirmText: 'Quitar foto',
      cancelText: 'Cancelar',
    })

    if (!confirmado) return

    setError(null)

    try {
      await quitar.mutateAsync()
      resolve(true)
    } catch (falla) {
      setError(mensajeErrorFoto(falla, 'No se pudo quitar la foto. Intente nuevamente.'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={cerrar}
      onExited={onExited}
      size="md"
      closeOnBackdrop={!ocupado}
      closeOnEscape={!ocupado}
      showCloseButton={!ocupado}
    >
      <Modal.Header>
        {paso.tipo === 'seleccion' ? 'Foto de perfil' : 'Ajustar la foto'}
      </Modal.Header>
      <Modal.Body className="space-y-4">
        {paso.tipo === 'seleccion' ? (
          <>
            <div className="flex justify-center py-2">
              <Avatar initials={iniciales} seed={semilla} src={foto} size="2xl" />
            </div>
            <p className="text-sm text-mercury-600">
              Use una imagen JPEG, PNG o WebP de al menos 400 × 400 píxeles y de hasta 10 MB.
            </p>
          </>
        ) : (
          <>
            <div className="relative h-72 overflow-hidden rounded-md bg-mercury-900">
              <Cropper
                image={paso.url}
                crop={posicion}
                zoom={zoom}
                minZoom={ZOOM_MINIMO}
                maxZoom={ZOOM_MAXIMO}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setPosicion}
                onZoomChange={setZoom}
                onCropComplete={(_, pixeles) => setArea(pixeles)}
                cropperProps={{
                  role: 'group',
                  'aria-label': 'Área de recorte',
                  'aria-describedby': idInstrucciones,
                }}
                disableAutomaticStylesInjection
              />
            </div>
            <p id={idInstrucciones} className="text-sm text-mercury-600">
              Arrastre la imagen o use las flechas del teclado para encuadrarla, y ajuste el
              acercamiento.
            </p>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={idZoom} className="text-sm font-medium text-mercury-700">
                Acercamiento
              </label>
              <input
                id={idZoom}
                type="range"
                min={ZOOM_MINIMO}
                max={ZOOM_MAXIMO}
                step={0.01}
                value={zoom}
                onChange={(evento) => setZoom(Number(evento.target.value))}
                className="w-full accent-primary-700"
              />
            </div>
          </>
        )}
        {error !== null && (
          <p
            role="alert"
            className="rounded-md border border-scarlet-200 bg-scarlet-50 px-3 py-2 text-sm text-scarlet-700"
          >
            {error}
          </p>
        )}
        <input
          ref={entradaRef}
          type="file"
          accept={ACEPTADOS}
          hidden
          onChange={(evento) => void elegirArchivo(evento)}
        />
      </Modal.Body>
      <Modal.Footer>
        {paso.tipo === 'seleccion' ? (
          <>
            {foto !== undefined && (
              <Button
                variant="danger"
                className="mr-auto"
                onClick={() => void quitarFoto()}
                loading={quitar.isPending}
                disabled={leyendo}
              >
                <Trash2 size={16} aria-hidden="true" />
                Quitar foto
              </Button>
            )}
            <Button variant="secondary" onClick={cerrar} disabled={ocupado}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => entradaRef.current?.click()}
              loading={leyendo}
              disabled={quitar.isPending}
            >
              <Upload size={16} aria-hidden="true" />
              Seleccionar imagen
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" className="mr-auto" onClick={volver} disabled={guardando}>
              Volver
            </Button>
            <Button variant="secondary" onClick={cerrar} disabled={guardando}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => void guardar()}
              loading={guardando}
              disabled={area === null}
            >
              Guardar foto
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  )
}
