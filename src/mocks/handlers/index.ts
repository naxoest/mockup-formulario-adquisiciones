import { analistasHandlers } from '@/mocks/handlers/analistas.handlers'
import { authHandlers } from '@/mocks/handlers/auth.handlers'
import { facturasHandlers } from '@/mocks/handlers/facturas.handlers'
import { historialHandlers } from '@/mocks/handlers/historial.handlers'
import { imagenesHandlers } from '@/mocks/handlers/imagenes.handlers'
import { listasHandlers } from '@/mocks/handlers/listas.handlers'
import { mantenedorHandlers } from '@/mocks/handlers/mantenedor.handlers'
import { monitoreoHandlers } from '@/mocks/handlers/monitoreo.handlers'
import { ordenesDeCompraHandlers } from '@/mocks/handlers/ordenesDeCompra.handlers'
import { reportesHandlers } from '@/mocks/handlers/reportes.handlers'
import { requerimientosHandlers } from '@/mocks/handlers/requerimientos.handlers'
import { resumenPresupuestarioHandlers } from '@/mocks/handlers/resumenPresupuestario.handlers'
import { solicitudesHandlers } from '@/mocks/handlers/solicitudes.handlers'
import { transaccionesHandlers } from '@/mocks/handlers/transacciones.handlers'
import { unidadesSolicitantesHandlers } from '@/mocks/handlers/unidadesSolicitantes.handlers'
import { usuariosHandlers } from '@/mocks/handlers/usuarios.handlers'
import { formulariosAdquisicionHandlers } from '@/mocks/handlers/formulariosAdquisicion.handlers'

export const handlers = [
  ...analistasHandlers,
  ...authHandlers,
  ...facturasHandlers,
  ...historialHandlers,
  ...imagenesHandlers,
  ...listasHandlers,
  ...mantenedorHandlers,
  ...monitoreoHandlers,
  ...ordenesDeCompraHandlers,
  ...reportesHandlers,
  ...requerimientosHandlers,
  ...resumenPresupuestarioHandlers,
  ...solicitudesHandlers,
  ...transaccionesHandlers,
  ...unidadesSolicitantesHandlers,
  ...usuariosHandlers,
  ...formulariosAdquisicionHandlers,
]
