import { z } from 'zod'
import { API_BASE_URL } from '@/config/env'
import {
  paginaTransaccionesSchema,
  transaccionResponseSchema,
} from '@/features/transacciones/schemas/transaccionResponse.schema'
import type { TransaccionBorradorRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'
import {
  bloqueadoresResponseSchema,
  monitoreoResponseSchema,
  registroMonitoreoResponseSchema,
} from '@/features/transacciones/schemas/monitoreoResponse.schema'
import { eventosRequerimientoResponseSchema } from '@/features/requerimientos/schemas/eventoResponse.schema'
import {
  importacionResponseSchema,
  importacionesResponseSchema,
  revisionImportacionResponseSchema,
} from '@/features/requerimientos/schemas/importacionResponse.schema'
import {
  estadosRequerimientoResponseSchema,
  requerimientosResponseSchema,
} from '@/features/requerimientos/schemas/requerimientoResponse.schema'
import { rankingUnidadesResponseSchema } from '@/features/analisis/schemas/rankingUnidadesResponse.schema'
import { perfilUnidadResponseSchema } from '@/features/analisis/schemas/perfilUnidadResponse.schema'
import {
  paginaUsuariosResponseSchema,
  usuarioResponseSchema,
} from '@/features/usuarios/schemas/usuarioResponse.schema'
import { rolesResponseSchema } from '@/features/usuarios/schemas/rolResponse.schema'
import {
  paginaUnidadesSolicitantesResponseSchema,
  unidadSolicitanteResponseSchema,
} from '@/features/mantenedor/schemas/unidadSolicitanteResponse.schema'
import {
  paginaProyectosResponseSchema,
  proyectoResponseSchema,
} from '@/features/mantenedor/schemas/proyectoResponse.schema'
import { fotoPerfilResponseSchema } from '@/features/usuarios/schemas/fotoPerfilResponse.schema'
import { portadaPerfilResponseSchema } from '@/features/usuarios/schemas/portadaPerfilResponse.schema'
import { resumenPresupuestarioSchema } from '@/features/inicio/schemas/indicadores.schema'
import { authSessionSchema, heartbeatResponseSchema } from '@/features/auth/sesionSchema'

const errorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  field: z.string().optional(),
})

export function conCuerpo(method: string, datos: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  }
}

export async function pedirTransaccion(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = transaccionResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirPagina(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = paginaTransaccionesSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirError(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = errorSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirSinCuerpo(ruta: string, init?: RequestInit) {
  return fetch(`${API_BASE_URL}${ruta}`, init)
}

export async function crearBorrador(datos: Record<string, unknown>) {
  return pedirTransaccion('/api/transacciones', conCuerpo('POST', datos))
}

export function datosDeBorrador(
  cambios: Partial<TransaccionBorradorRequest> = {},
): TransaccionBorradorRequest {
  return {
    nombre: 'Transacción de prueba',
    modalidad: 'agil',
    fecha: '2026-03-10',
    solicitudes: [{ unidadId: 1, tipoSolicitud: 'SASERVI' }],
    ...cambios,
  }
}

export async function pedirMonitoreo(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = monitoreoResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirRegistroMonitoreo(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = registroMonitoreoResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirBloqueadores(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = bloqueadoresResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirRequerimientos(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = requerimientosResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirEstadosRequerimiento(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = estadosRequerimientoResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirEventosRequerimiento(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = eventosRequerimientoResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirImportacionesRequerimientos(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = importacionesResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirRevisionImportacion(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = revisionImportacionResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirImportacionRequerimiento(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = importacionResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirRankingUnidades(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = rankingUnidadesResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirPerfilUnidad(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = perfilUnidadResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirPaginaUsuarios(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = paginaUsuariosResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirUsuario(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = usuarioResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirUnidadesMantenedor(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = paginaUnidadesSolicitantesResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirUnidadMantenedor(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = unidadSolicitanteResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirProyectosMantenedor(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = paginaProyectosResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirProyectoMantenedor(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = proyectoResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirRoles(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = rolesResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirResumenPresupuestario(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = resumenPresupuestarioSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirSesion(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = authSessionSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirHeartbeat(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = heartbeatResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirFotoPerfil(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = fotoPerfilResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

export async function pedirPortadaPerfil(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, init)
  const cuerpo = portadaPerfilResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}
