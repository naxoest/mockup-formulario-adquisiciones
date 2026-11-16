import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DisclosureList } from './DisclosureList'
import type { DisclosureListItem } from './DisclosureList.types'

const items: DisclosureListItem[] = [{ id: 'a' }, { id: 'b' }]

const resumen = ({ index, hasError }: { index: number; hasError: boolean }) => (
  <span>
    Item {index + 1}
    {hasError ? ' (con errores)' : ''}
  </span>
)

const detalle = ({ index }: { index: number }) => <span>Detalle {index + 1}</span>

describe('DisclosureList', () => {
  it('muestra el estado vacio cuando no hay items', () => {
    render(
      <DisclosureList
        items={[]}
        emptyState="Sin elementos"
        renderSummary={resumen}
        renderDetail={detalle}
      />,
    )
    expect(screen.getByText('Sin elementos')).toBeInTheDocument()
  })

  it('renderiza un disparador por item y todos parten colapsados', () => {
    render(<DisclosureList items={items} renderSummary={resumen} renderDetail={detalle} />)
    expect(screen.getAllByRole('button', { expanded: false })).toHaveLength(2)
  })

  it('expande y colapsa en modo no controlado', async () => {
    const user = userEvent.setup()
    render(<DisclosureList items={items} renderSummary={resumen} renderDetail={detalle} />)
    const disparador = screen.getAllByRole('button')[0]
    const contenido = document.getElementById(disparador.getAttribute('aria-controls')!)!
    expect(contenido).toHaveAttribute('inert')
    await user.click(disparador)
    expect(disparador).toHaveAttribute('aria-expanded', 'true')
    expect(contenido).not.toHaveAttribute('inert')
    await user.click(disparador)
    expect(disparador).toHaveAttribute('aria-expanded', 'false')
    expect(contenido).toHaveAttribute('inert')
  })

  it('en modo controlado el estado lo decide el consumidor', async () => {
    const user = userEvent.setup()
    const alAlternar = vi.fn()
    render(
      <DisclosureList
        items={items}
        openIds={new Set(['b'])}
        onToggle={alAlternar}
        renderSummary={resumen}
        renderDetail={detalle}
      />,
    )
    const [primero, segundo] = screen.getAllByRole('button')
    expect(primero).toHaveAttribute('aria-expanded', 'false')
    expect(segundo).toHaveAttribute('aria-expanded', 'true')
    await user.click(primero)
    expect(alAlternar).toHaveBeenCalledWith('a')
    expect(primero).toHaveAttribute('aria-expanded', 'false')
  })

  it('notifica el alternado tambien en modo no controlado', async () => {
    const user = userEvent.setup()
    const alAlternar = vi.fn()
    render(
      <DisclosureList
        items={items}
        onToggle={alAlternar}
        renderSummary={resumen}
        renderDetail={detalle}
      />,
    )
    await user.click(screen.getAllByRole('button')[1])
    expect(alAlternar).toHaveBeenCalledWith('b')
  })

  it('no renderiza accion por item cuando no se entrega renderItemAction', () => {
    render(<DisclosureList items={items} renderSummary={resumen} renderDetail={detalle} />)
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('renderiza la accion por item cuando se entrega', () => {
    render(
      <DisclosureList
        items={items}
        renderSummary={resumen}
        renderDetail={detalle}
        renderItemAction={({ index }) => (
          <button type="button" aria-label={`Quitar ${index + 1}`} />
        )}
      />,
    )
    expect(screen.getByRole('button', { name: 'Quitar 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quitar 2' })).toBeInTheDocument()
  })

  it('propaga hasError al estado del item', () => {
    render(
      <DisclosureList
        items={[{ id: 'a', hasError: true }, { id: 'b' }]}
        renderSummary={resumen}
        renderDetail={detalle}
      />,
    )
    expect(screen.getByText('Item 1 (con errores)')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('anuncia el mensaje de nivel de lista', () => {
    render(
      <DisclosureList
        items={items}
        message="agrega al menos un elemento"
        renderSummary={resumen}
        renderDetail={detalle}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('agrega al menos un elemento')
  })

  it('vincula la descripcion al grupo', () => {
    render(
      <DisclosureList
        items={items}
        description="Texto de ayuda"
        renderSummary={resumen}
        renderDetail={detalle}
      />,
    )
    expect(screen.getByRole('group')).toHaveAccessibleDescription('Texto de ayuda')
  })
})
