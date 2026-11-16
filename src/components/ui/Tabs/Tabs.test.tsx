import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Tabs } from './Tabs'
import type { TabItem } from './Tabs.types'

const items: TabItem[] = [
  { key: 'first', label: 'Primera', content: 'Contenido primero' },
  { key: 'second', label: 'Segunda', content: 'Contenido segundo' },
  { key: 'third', label: 'Tercera', content: 'Contenido tercero' },
]

function ControlledTabs() {
  const [value, setValue] = useState('first')

  return <Tabs items={items} value={value} onChange={setValue} ariaLabel="Secciones" />
}

describe('Tabs', () => {
  it('asocia la pestaña activa con su panel', () => {
    render(<ControlledTabs />)

    expect(screen.getByRole('tablist', { name: 'Secciones' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Primera' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: 'Primera' })).toHaveTextContent('Contenido primero')
  })

  it('cambia de panel al hacer clic', async () => {
    const user = userEvent.setup()
    render(<ControlledTabs />)

    await user.click(screen.getByRole('tab', { name: 'Segunda' }))

    expect(screen.getByRole('tabpanel', { name: 'Segunda' })).toHaveTextContent('Contenido segundo')
    expect(screen.queryByText('Contenido primero')).not.toBeInTheDocument()
  })

  it('recorre las pestañas con el teclado', async () => {
    const user = userEvent.setup()
    render(<ControlledTabs />)

    await user.tab()
    expect(screen.getByRole('tab', { name: 'Primera' })).toHaveFocus()

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'Tercera' })).toHaveFocus()
    expect(screen.getByRole('tabpanel', { name: 'Tercera' })).toBeInTheDocument()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Primera' })).toHaveFocus()

    await user.keyboard('{End}')
    expect(screen.getByRole('tab', { name: 'Tercera' })).toHaveFocus()

    await user.keyboard('{Home}')
    expect(screen.getByRole('tab', { name: 'Primera' })).toHaveFocus()
  })
})
