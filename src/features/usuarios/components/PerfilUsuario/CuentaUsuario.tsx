import { useId } from 'react'
import { ImageOff, Pencil, UserCheck, UserX } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CeldaEstado } from '@/features/usuarios/components/UsuariosTable/CeldaEstado'
import { formatearFechaDeRegistro } from '@/features/usuarios/utils/usuario'
import type { Usuario } from '@/features/usuarios/types/usuario.types'
import { Dato } from './Dato'

interface CuentaUsuarioProps {
  usuario: Usuario
  onEditar: () => void
  onCambiarEstado: () => void
  onQuitarFoto?: () => void
}

export function CuentaUsuario({
  usuario,
  onEditar,
  onCambiarEstado,
  onQuitarFoto,
}: CuentaUsuarioProps) {
  const idTitulo = useId()

  return (
    <Card as="section" aria-labelledby={idTitulo}>
      <Card.Header className="flex-wrap">
        <h2 id={idTitulo} className="text-base font-semibold text-mercury-900">
          Cuenta
        </h2>
        <Card.Actions className="ml-auto max-w-full flex-wrap justify-end">
          <Button variant="secondary" size="sm" onClick={onEditar}>
            <Pencil size={16} aria-hidden="true" />
            Editar
          </Button>
          {onQuitarFoto !== undefined && (
            <Button variant="secondary" size="sm" onClick={onQuitarFoto}>
              <ImageOff size={16} aria-hidden="true" />
              Quitar foto
            </Button>
          )}
          <Button
            variant={usuario.estaActivo ? 'danger' : 'secondary'}
            size="sm"
            onClick={onCambiarEstado}
          >
            {usuario.estaActivo ? (
              <UserX size={16} aria-hidden="true" />
            ) : (
              <UserCheck size={16} aria-hidden="true" />
            )}
            {usuario.estaActivo ? 'Desactivar' : 'Activar'}
          </Button>
        </Card.Actions>
      </Card.Header>
      <Card.Body className="pt-0">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Dato etiqueta="Estado">
            <CeldaEstado estaActivo={usuario.estaActivo} />
          </Dato>
          <Dato etiqueta="Fecha de creación">{formatearFechaDeRegistro(usuario.creadoEn)}</Dato>
          <Dato etiqueta="Última actualización">
            {formatearFechaDeRegistro(usuario.actualizadoEn)}
          </Dato>
        </dl>
      </Card.Body>
    </Card>
  )
}
