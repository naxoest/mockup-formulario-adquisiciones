import { useRouter, type ErrorComponentProps } from '@tanstack/react-router'
import { AlertTriangle, Lock } from 'lucide-react'
import { HomeLink } from '@/app/HomeLink'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { AccesoDenegadoError } from '@/features/auth/errores'

export function RouteError({ error }: ErrorComponentProps) {
  const router = useRouter()

  if (error instanceof AccesoDenegadoError) {
    return (
      <ErrorState
        icon={<Lock size={28} />}
        code="403"
        title="Acceso denegado"
        description={error.message}
        actions={<HomeLink />}
      />
    )
  }

  return (
    <ErrorState
      icon={<AlertTriangle size={28} />}
      title="Ocurrió un error inesperado"
      description="No fue posible cargar esta sección. Intente nuevamente."
      actions={
        <Button variant="secondary" onClick={() => void router.invalidate()}>
          Reintentar
        </Button>
      }
    />
  )
}
