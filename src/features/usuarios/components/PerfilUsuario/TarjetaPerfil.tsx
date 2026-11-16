import { Camera, Image as ImageIcon, Mail } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import type { PortadaResuelta } from '@/features/usuarios/types/imagen.types'

const TAMANOS_PORTADA = '(min-width: 1280px) 1216px, 100vw'

const CLASES_BOTON_SOBRE_IMAGEN =
  'flex size-9 items-center justify-center rounded-full border border-mercury-200 bg-white text-mercury-700 shadow-sm transition-colors hover:bg-mercury-50 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'

interface TarjetaPerfilProps {
  nombre: string
  iniciales: string
  semilla: string | number
  foto?: string
  portada?: PortadaResuelta
  roles: string[]
  correo: string | null
  onEditarFoto?: () => void
  onEditarPortada?: () => void
}

export function TarjetaPerfil({
  nombre,
  iniciales,
  semilla,
  foto,
  portada,
  roles,
  correo,
  onEditarFoto,
  onEditarPortada,
}: TarjetaPerfilProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/1] bg-linear-to-r from-primary-800 to-primary-600">
        {portada !== undefined && (
          <img
            src={portada.src}
            srcSet={portada.srcSet}
            sizes={TAMANOS_PORTADA}
            alt=""
            fetchPriority="high"
            className={cn('size-full object-cover', portada.encuadre)}
          />
        )}
        {onEditarPortada !== undefined && (
          <button
            type="button"
            onClick={onEditarPortada}
            aria-label="Cambiar la portada"
            title="Cambiar la portada"
            className={cn('absolute top-3 right-3', CLASES_BOTON_SOBRE_IMAGEN)}
          >
            <ImageIcon size={18} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="px-6 pb-6">
        <div className="relative -mt-12 inline-flex">
          <Avatar
            initials={iniciales}
            seed={semilla}
            src={foto}
            size="2xl"
            className="ring-4 ring-white"
          />
          {onEditarFoto !== undefined && (
            <button
              type="button"
              onClick={onEditarFoto}
              aria-label="Cambiar la foto de perfil"
              title="Cambiar la foto de perfil"
              className={cn('absolute right-0 bottom-0', CLASES_BOTON_SOBRE_IMAGEN)}
            >
              <Camera size={18} aria-hidden="true" />
            </button>
          )}
        </div>
        <h1 className="mt-3 text-2xl font-bold text-mercury-900">{nombre}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {roles.length > 0 ? (
            roles.map((rol) => (
              <Badge key={rol} variant="info" size="sm">
                {rol}
              </Badge>
            ))
          ) : (
            <Badge variant="warning" size="sm">
              Sin roles
            </Badge>
          )}
        </div>
        {correo !== null && (
          <a
            href={`mailto:${correo}`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-sm text-sm text-mercury-600 underline-offset-4 hover:text-primary-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <Mail size={16} aria-hidden="true" />
            {correo}
          </a>
        )}
      </div>
    </Card>
  )
}

export function TarjetaPerfilCargando() {
  return (
    <Card className="overflow-hidden">
      <div role="status" aria-live="polite">
        <span className="sr-only">Cargando el perfil</span>
        <div aria-hidden="true">
          <div className="aspect-[4/1] bg-mercury-100" />
          <div className="px-6 pb-6">
            <div className="relative -mt-12 inline-flex rounded-full ring-4 ring-white">
              <Skeleton width={96} height={96} rounded="full" />
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <Skeleton width="40%" height={28} />
              <Skeleton width="25%" height={20} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
