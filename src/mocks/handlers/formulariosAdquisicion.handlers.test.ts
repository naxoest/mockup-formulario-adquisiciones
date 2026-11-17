import { describe, expect, it } from 'vitest'
import { API_BASE_URL } from '@/config/env'
import type { FormularioAdquisicion } from '@/features/formularios/types/formularioAdquisicion.types'

const URL_BASE = `${API_BASE_URL}/api/formularios-adquisicion`

describe('formulariosAdquisicion handlers', () => {
  it('GET retorna la lista de formularios ordenados descendentemente', async () => {
    const respuesta = await fetch(URL_BASE)
    expect(respuesta.status).toBe(200)

    const datos = (await respuesta.json()) as FormularioAdquisicion[]
    expect(Array.isArray(datos)).toBe(true)
    expect(datos.length).toBeGreaterThan(0)
    expect(datos[0].id).toBeDefined()
  })

  it('POST crea un nuevo formulario de trato directo con estado en_revision', async () => {
    const nuevoPayload = {
      modalidad: 'trato_directo' as const,
      titulo: 'Suscripcion a base de datos cientifica',
      codigoEdelfos: 'SASERVI N° 80999',
      tipoSolicitud: 'SASERVI' as const,
      montoEstimadoClp: 500000,
      montoEstimadoUtm: 7.43,
      coordinador: {
        nombreCompleto: 'Sergio Arce Molina',
        run: '8.350.752-7',
        correo: 'sergio.arce@ulagos.cl',
        cargo: 'Director Direccion de Bibliotecas',
        crCodigo: 60,
        crNombre: 'Direccion de Bibliotecas',
      },
      disposiciones: {
        porcentajeMultaDiaria: 0.5,
        topeMultaDias: 20,
        plazoPagoDias: 30,
        aceptaTerminoAnticipadoArt130: true,
      },
      tratoDirecto: {
        campusSede: 'osorno' as const,
        fechaFormulario: '2025-08-05',
        itemsRequeridos: [
          {
            cantidad: 1,
            descripcionDetallada: 'Acceso corporativo anual a biblioteca digital especializada',
          },
        ],
        situacionConvenioMarco: 'no_disponible' as const,
        causal: '7c_alta_especializacion' as const,
        objetivoImportancia: 'Inversion estrategica para investigacion y posgrado.',
        motivosEleccionProveedor: 'Unico proveedor con catalogo indexado en el area.',
        justificacionCausalEscogida:
          'Articulo 71 numeral 7 letra c servicio de alta especializacion para investigacion.',
        proveedorNombre: 'EDITORIAL ACADEMICA S A',
        proveedorRut: '76.123.456-7',
        lineasCotizacion: [
          {
            cantidad: 1,
            detalle: 'Acceso corporativo anual',
            precioUnitarioNeto: 420168,
            precioTotalNeto: 420168,
          },
        ],
        afectoIva: true,
        montoNetoClp: 420168,
        montoIvaClp: 79832,
        montoTotalClp: 500000,
        condicionesCompra: {
          plazoEntregaDiasHabiles: 5,
          esServicio: true,
          fechaInicioServicio: 'Agosto 2025',
          fechaTerminoServicio: 'Agosto 2026',
          requiereGarantia: false,
          mesesGarantia: null,
          aplicaDireccionDespacho: false,
          direccionDespachoCodigo: 'osorno_fuchslocher' as const,
          direccionDespachoOtra: '',
        },
        otrosIncumplimientos: [],
        compromisoEstandarSimpleOc: true,
        compromisoNoFragmentacion: true,
        jefeCrNombre: 'Sergio Arce Molina',
        jefeCrCargo: 'Director Direccion de Bibliotecas',
        coordinadorEsMismoJefeCr: true,
        nombreArchivoCotizacion: 'cotizacion_academica.pdf',
        nombreArchivoDeclaracionJurada: 'declaracion_jurada.pdf',
        documentosAdicionales: ['informe_tecnico' as const],
        otroDocumentoAdicionalDetalle: '',
      },
    }

    const respuesta = await fetch(URL_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoPayload),
    })

    expect(respuesta.status).toBe(201)
    const creado = (await respuesta.json()) as FormularioAdquisicion
    expect(creado.id).toMatch(/^form-td-/)
    expect(creado.folio).toMatch(/^TD-2026-/)
    expect(creado.estado).toBe('en_revision')
    expect(creado.tratoDirecto?.causal).toBe('7c_alta_especializacion')
  })

  it('PATCH actualiza el estado de un formulario existente', async () => {
    const respuesta = await fetch(`${URL_BASE}/form-td-001/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'rechazado' }),
    })

    expect(respuesta.status).toBe(200)
    const actualizado = (await respuesta.json()) as FormularioAdquisicion
    expect(actualizado.id).toBe('form-td-001')
    expect(actualizado.estado).toBe('rechazado')
  })

  it('PATCH retorna 404 para un formulario inexistente', async () => {
    const respuesta = await fetch(`${URL_BASE}/form-inexistente/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'aprobado' }),
    })

    expect(respuesta.status).toBe(404)
    const error = (await respuesta.json()) as { error: string }
    expect(error.error).toBe('Formulario no encontrado')
  })
})
