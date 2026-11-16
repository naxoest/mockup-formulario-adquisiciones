import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Form, Field } from '@/components/ui/Form'
import { Switch } from './Switch'

describe('Switch', () => {
  it('expone role=switch y es controlable', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [checked, setChecked] = useState(false)
      return (
        <Switch
          label="Notificaciones"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
      )
    }
    render(<Controlled />)
    const switchEl = screen.getByRole('switch', { name: 'Notificaciones' })
    expect(switchEl).not.toBeChecked()
    await user.click(switchEl)
    expect(switchEl).toBeChecked()
  })

  it('renderiza description', () => {
    render(<Switch label="Modo oscuro" description="Activa el tema oscuro" />)
    expect(screen.getByText('Activa el tema oscuro')).toBeInTheDocument()
  })

  it('dentro de Field consume el contexto', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    function TestForm() {
      const form = useForm({ defaultValues: { darkMode: false } })
      return (
        <Form form={form} onSubmit={onSubmit}>
          <Field name="darkMode">
            <Switch label="Modo oscuro" />
          </Field>
          <button type="submit">Enviar</button>
        </Form>
      )
    }
    render(<TestForm />)
    const switchEl = screen.getByRole('switch', { name: 'Modo oscuro' })
    await user.click(switchEl)
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toEqual({ darkMode: true })
  })
})
