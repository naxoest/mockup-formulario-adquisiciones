import { describe, expect, it } from 'vitest'
import {
  licitacionPublicaFormSchema,
  tratoDirectoFormSchema,
} from './formulariosAdquisicion.schema'

describe('formulariosAdquisicion.schema', () => {
  const baseTratoDirectoValido = {
    titulo: 'Renovacion Suscripcion Digital Diario El Mercurio',
    codigoEdelfos: 'SASERVI N° 80448',
    tipoSolicitud: 'SASERVI' as const,
    montoEstimadoClp: 212042,
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
      topeDiasMulta: 20,
      topePorcentajeContrato: '10' as const,
      plazoPagoDias: 30,
      aceptaTerminoAnticipadoArt130: true,
    },
    campusSede: 'osorno' as const,
    fechaFormulario: new Date('2025-08-05T12:00:00Z'),
    itemsRequeridos: [
      {
        cantidad: 1,
        descripcionDetallada:
          'Renovacion Suscripcion Digital Diario El Mercurio por 1 ano para biblioteca central',
      },
    ],
    situacionConvenioMarco: 'no_disponible' as const,
    causal: 'costo_desproporcionado_7b' as const,
    objetivoImportancia:
      'La adquisicion del diario El Mercurio representa una inversion estrategica en el acceso a informacion nacional e internacional.',
    motivosEleccionProveedor:
      'El diario El Mercurio es uno de los periodicos mas antiguos y reconocidos en Chile con cobertura relevante.',
    justificacionCausalEscogida:
      'Articulo 71 numeral 7 letra b costo desproporcionado respecto de proceso competitivo de 81,66 UTM.',
    proveedorNombre: 'EMPRESA EL MERCURIO S A P',
    proveedorRut: '90.193.000-7',
    lineasCotizacion: [
      {
        cantidad: 1,
        detalle: 'Renovacion Suscripcion Digital Diario El Mercurio por 1 ano',
        precioUnitarioNeto: 178187,
      },
    ],
    afectoIva: true,
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
    archivoCotizacion: [
      {
        kind: 'stored' as const,
        id: 'cot-1',
        name: 'cotizacion.pdf',
        size: 1024,
        type: 'application/pdf',
        url: 'https://ejemplo.cl/cot.pdf',
      },
    ],
    archivoDeclaracionJurada: [
      {
        kind: 'stored' as const,
        id: 'dj-1',
        name: 'declaracion.pdf',
        size: 1024,
        type: 'application/pdf',
        url: 'https://ejemplo.cl/dj.pdf',
      },
    ],
    documentosAdicionales: ['informe_tecnico' as const],
    otroDocumentoAdicionalDetalle: '',
  }

  describe('tratoDirectoFormSchema', () => {
    it('valida exitosamente una solicitud valida con causal 7b bajo 100 UTM', () => {
      const resultado = tratoDirectoFormSchema.safeParse(baseTratoDirectoValido)
      expect(resultado.success).toBe(true)
    })

    it.each([
      '1_proveedor_unico',
      '2_sin_interesados',
      '3_emergencia_urgencia',
      '4_confidencial_seguridad_nacional',
      '5_confianza_seguridad',
      '6_menor_30_utm_impacto_social',
      '7a_compatibilidad_modelos_sistemas',
      'costo_desproporcionado_7b',
      '7b_costo_desproporcionado',
      '7c_alta_especializacion',
      '7d_seguridad_autoridades',
      '7e_riesgo_conocimiento_publico',
    ] as const)('acepta la causal oficial del Articulo 71: %s', (causal) => {
      const datos = {
        ...baseTratoDirectoValido,
        causal,
      }
      const resultado = tratoDirectoFormSchema.safeParse(datos)
      expect(resultado.success).toBe(true)
    })

    it('rechaza causal 7b si el monto cotizado supera 100 UTM', () => {
      const datos = {
        ...baseTratoDirectoValido,
        causal: 'costo_desproporcionado_7b' as const,
        lineasCotizacion: [
          {
            cantidad: 1,
            detalle: 'Servicio de gran envergadura',
            precioUnitarioNeto: 10000000,
          },
        ],
      }
      const resultado = tratoDirectoFormSchema.safeParse(datos)
      expect(resultado.success).toBe(false)
      const issues = resultado.error?.issues ?? []
      const errorCausal = issues.find((issue) => issue.path[0] === 'causal')
      expect(errorCausal?.message).toContain('máximo de 100 UTM')
    })

    it('rechaza si no se acepta la declaracion de estandar simple o no fragmentacion', () => {
      const datos = {
        ...baseTratoDirectoValido,
        compromisoEstandarSimpleOc: false,
        compromisoNoFragmentacion: false,
      }
      const resultado = tratoDirectoFormSchema.safeParse(datos)
      expect(resultado.success).toBe(false)
    })
  })

  describe('licitacionPublicaFormSchema', () => {
    const baseLicitacionValida = {
      titulo: 'Servicio integral de vigilancia y seguridad de campus Osorno',
      codigoEdelfos: 'SASERVI N° 80112',
      tipoSolicitud: 'SASERVI' as const,
      montoEstimadoClp: 35000000,
      coordinador: {
        nombreCompleto: 'Marta Riquelme Soto',
        run: '15.441.223-9',
        correo: 'marta.riquelme@ulagos.cl',
        cargo: 'Jefa de Servicios Generales',
        crCodigo: 101,
        crNombre: 'Direccion de Operaciones',
      },
      disposiciones: {
        porcentajeMultaDiaria: 0.5,
        topeDiasMulta: 20,
        topePorcentajeContrato: '20' as const,
        plazoPagoDias: 30,
        aceptaTerminoAnticipadoArt130: true,
      },
      categoriaRequerimiento: 'servicios' as const,
      productos: [],
      especificacionesTecnicasServicio:
        'Servicio de vigilancia y rondas 24/7 en dependencias del campus Osorno bajo norma vigente.',
      planillaValidacionBiblioteca: [],
      bibliografia: [],
      formalizacion: 'solo_oc' as const,
      modalidadDuracionContrato: 'meses_fijos' as const,
      duracionContratoMeses: 12,
      direccionDespachoCodigo: 'osorno_fuchslocher' as const,
      direccionDespachoOtra: '',
      otrosIncumplimientos: [],
      modalidadFormaPago: 'recepcion_conforme_total' as const,
      tipoEntregaParcializada: 'mes_vencido' as const,
      detalleEntregaParcializada: '',
      antecedentes: {
        campusSede: 'osorno' as const,
        fechaFormulario: new Date('2025-08-05T12:00:00Z'),
        formalizaSoloConFormularioLeasingObra: false,
        jefeCrNombre: 'Marta Riquelme Soto',
        jefeCrCargo: 'Jefa de Servicios Generales',
        coordinadorEsMismoJefeCr: true,
        tipoPresupuesto: 'disponible' as const,
        hacerVisiblePresupuestoEstimado: true,
        requiereGarantiaSeriedad: false,
        montoGarantiaSeriedadClp: null,
        visitaTerreno: 'no_requiere' as const,
        visitaDiasCorridosPublicacion: null,
        visitaHora: '',
        visitaGuiaNombreCargo: '',
        visitaFormato: 'presencial' as const,
        visitaDetalleLugarOEnlace: '',
        otrasConsideraciones: '',
      },
      tipoEvaluacion: 'completa' as const,
      comisionEvaluadora: [
        {
          nombreCompleto: 'Marta Riquelme Soto',
          run: '15.441.223-9',
          cargo: 'Jefa Servicios Generales',
          calidadContractual: 'Planta',
          correo: 'marta.riquelme@ulagos.cl',
        },
      ],
      criteriosEvaluacion: {
        aplicaRequisitosFormales: true,
        ponderacionRequisitosFormales: 5,
        aplicaPactoIntegridad: true,
        ponderacionPactoIntegridad: 5,
        ponderacionPrecio: 50,
        mecanismoPrecio: 'formula_proporcional' as const,
        aplicaPlazoEntrega: true,
        ponderacionPlazoEntrega: 20,
        tipoDiasPlazoEntrega: 'habiles' as const,
        plazoMaximoEntregaDias: 15,
        mecanismoPlazoEntrega: 'formula_menor_plazo' as const,
        aplicaExperiencia: true,
        ponderacionExperiencia: 20,
        especificacionRubroExperiencia: 'Servicios de seguridad privada',
        modoMedicionExperiencia: 'anios_experiencia' as const,
        rangoMaximoExperiencia: '5 anos',
        rangoMedioExperiencia: '3 anos',
        rangoMinimoExperiencia: '1 ano',
        documentosRespaldoExperiencia: 'Certificados de recepcion conforme',
        aplicaPlazoGarantia: false,
        ponderacionPlazoGarantia: null,
        mecanismoPlazoGarantia: 'rangos_meses' as const,
        otrosCriterios: [],
      },
    }

    it('valida exitosamente cuando las ponderaciones suman exactamente 100', () => {
      const resultado = licitacionPublicaFormSchema.safeParse(baseLicitacionValida)
      expect(resultado.success).toBe(true)
    })

    it('falla cuando la suma de ponderaciones no da 100', () => {
      const datos = {
        ...baseLicitacionValida,
        criteriosEvaluacion: {
          ...baseLicitacionValida.criteriosEvaluacion,
          ponderacionPrecio: 30,
        },
      }
      const resultado = licitacionPublicaFormSchema.safeParse(datos)
      expect(resultado.success).toBe(false)
      const issues = resultado.error?.issues ?? []
      const errorPonderacion = issues.find(
        (issue) => issue.path[0] === 'criteriosEvaluacion' && issue.path[1] === 'ponderacionPrecio',
      )
      expect(errorPonderacion?.message).toContain('coincidir con un 100%')
    })
  })
})
