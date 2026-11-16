import { etiquetaRol } from '@/features/auth/roles'
import { nombreDeUsuario } from '@/features/usuarios/utils/usuario'
import { formatFullName } from '@/utils/personName'
import { formatRun } from '@/utils/run'
import { CeldaEstado } from './CeldaEstado'
import { CeldaRoles } from './CeldaRoles'
import { CeldaUsuario } from './CeldaUsuario'
import type { ColumnDef } from '@/components/ui/DataTable'
import type { Usuario } from '@/features/usuarios/types/usuario.types'

export const columnasUsuarios: ColumnDef<Usuario>[] = [
  {
    field: 'apellidoPaterno',
    header: 'Usuario',
    sortable: true,
    width: 'w-[36%] min-w-72',
    renderCell: (usuario) => <CeldaUsuario usuario={usuario} />,
    getSearchText: (usuario) =>
      `${formatFullName(nombreDeUsuario(usuario))} ${usuario.emailInstitucional ?? ''} ${usuario.emailEstudiantil ?? ''}`,
  },
  {
    field: 'run',
    header: 'RUN',
    sortable: true,
    width: 'w-[16%] min-w-36',
    renderCell: (usuario) => (
      <span className="tabular-nums">{formatRun(usuario.run, usuario.digitoVerificador)}</span>
    ),
    getSearchText: (usuario) =>
      `${usuario.run}${usuario.digitoVerificador} ${formatRun(usuario.run, usuario.digitoVerificador)}`,
  },
  {
    field: 'roles',
    header: 'Roles',
    width: 'w-[26%] min-w-48',
    renderCell: (usuario) => <CeldaRoles roles={usuario.roles} />,
    getSearchText: (usuario) => usuario.roles.map((rol) => etiquetaRol(rol.nombre)).join(' '),
  },
  {
    field: 'estaActivo',
    header: 'Estado',
    sortable: true,
    type: 'boolean',
    width: 'w-[12%] min-w-28',
    renderCell: (usuario) => <CeldaEstado estaActivo={usuario.estaActivo} />,
  },
]
