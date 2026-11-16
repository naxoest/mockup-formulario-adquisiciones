import { CircleQuestionMark } from 'lucide-react'
import { HomeLink } from '@/app/HomeLink'
import { ErrorState } from '@/components/ui/ErrorState'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mercury-50">
      <ErrorState
        icon={<CircleQuestionMark size={28} />}
        code="404"
        title="Página no encontrada"
        description="La dirección ingresada no existe o ya no está disponible."
        actions={<HomeLink />}
      />
    </div>
  )
}
