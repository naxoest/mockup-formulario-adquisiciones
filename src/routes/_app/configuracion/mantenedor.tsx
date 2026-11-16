import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FolderKanban, GraduationCap, Settings } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageLayout } from '@/components/ui/PageLayout'
import { Tabs, type TabItem } from '@/components/ui/Tabs'
import { exigirPermiso } from '@/features/auth/permisos'
import { SeccionProyectos } from '@/features/mantenedor/components/SeccionProyectos'
import { SeccionUnidades } from '@/features/mantenedor/components/SeccionUnidades'
import {
  SECCION_INICIAL,
  busquedaMantenedorSchema,
  type SeccionMantenedor,
} from '@/features/mantenedor/schemas/busquedaMantenedor.schema'

const secciones: TabItem<SeccionMantenedor>[] = [
  {
    key: 'carreras-y-unidades',
    label: 'Carreras y unidades',
    icon: <GraduationCap aria-hidden="true" className="size-4" />,
    content: <SeccionUnidades />,
  },
  {
    key: 'proyectos',
    label: 'Proyectos',
    icon: <FolderKanban aria-hidden="true" className="size-4" />,
    content: <SeccionProyectos />,
  },
]

export const Route = createFileRoute('/_app/configuracion/mantenedor')({
  validateSearch: busquedaMantenedorSchema,
  beforeLoad: ({ context }) => {
    exigirPermiso(context.sesion.roles, 'mantenedor:ver')
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { seccion = SECCION_INICIAL } = Route.useSearch()
  const navigate = useNavigate()

  const cambiarSeccion = (siguiente: SeccionMantenedor) => {
    void navigate({
      to: '/configuracion/mantenedor',
      search: { seccion: siguiente },
      replace: true,
    })
  }

  return (
    <PageLayout maxWidth="none">
      <PageHeader
        title="Mantenedor"
        description="Administre los datos de referencia del sistema."
        icon={<Settings className="size-5" />}
      />
      <Tabs
        items={secciones}
        value={seccion}
        onChange={cambiarSeccion}
        ariaLabel="Secciones del mantenedor"
      />
    </PageLayout>
  )
}
