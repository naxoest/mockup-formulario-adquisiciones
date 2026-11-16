import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ContenidoHistorial } from '@/features/transacciones/components/TransaccionHistorial/ContenidoHistorial'
import { iniciarSesionSimuladaPorRun } from '@/mocks/handlers/sesion.estado'

describe('ContenidoHistorial', () => {
  it('informa que la transaccion no esta disponible ante un 404, sin ofrecer reintentar', async () => {
    iniciarSesionSimuladaPorRun(9876543)
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <ContenidoHistorial transaccionId={2} />
      </QueryClientProvider>,
    )

    expect(await screen.findByText('La transacción no está disponible')).toBeInTheDocument()
    expect(screen.queryByText('Reintentar')).not.toBeInTheDocument()
  })
})
