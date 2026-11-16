import type { PerfilUnidad } from '@/features/analisis/types/perfilUnidad.types'
import type { FiltrosReporte, ReporteAdquisiciones } from '@/features/analisis/types/reporte.types'

export async function generarReportePdf(
  reporte: ReporteAdquisiciones,
  filtros: FiltrosReporte,
): Promise<Blob> {
  const [{ pdf }, { ReporteAdquisicionesPdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./ReporteAdquisicionesPdf'),
  ])

  return pdf(<ReporteAdquisicionesPdf reporte={reporte} filtros={filtros} />).toBlob()
}

export async function generarReportePerfilUnidadPdf(perfil: PerfilUnidad): Promise<Blob> {
  const [{ pdf }, { ReportePerfilUnidadPdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./ReportePerfilUnidadPdf'),
  ])

  return pdf(<ReportePerfilUnidadPdf perfil={perfil} />).toBlob()
}
