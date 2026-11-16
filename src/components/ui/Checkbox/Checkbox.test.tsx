import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Form, Field } from '@/components/ui/Form'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('en modo stand-alone es controlable con checked y onChange', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [checked, setChecked] = useState(false)
      return (
        <Checkbox label="Acepto" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
      )
    }
    render(<Controlled />)
    const checkbox = screen.getByLabelText('Acepto')
    expect(checkbox).not.toBeChecked()
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('soporta indeterminate via prop', () => {
    render(<Checkbox aria-label="Test" indeterminate />)
    const checkbox = screen.getByLabelText('Test') as HTMLInputElement
    expect(checkbox.indeterminate).toBe(true)
  })

  it('renderiza description', () => {
    render(<Checkbox label="Acepto" description="Términos y condiciones" />)
    expect(screen.getByText('Términos y condiciones')).toBeInTheDocument()
  })

  it('dentro de Field consume el contexto', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    function TestForm() {
      const form = useForm({ defaultValues: { terms: false } })
      return (
        <Form form={form} onSubmit={onSubmit}>
          <Field name="terms">
            <Checkbox label="Acepto los términos" />
          </Field>
          <button type="submit">Enviar</button>
        </Form>
      )
    }
    render(<TestForm />)
    const checkbox = screen.getByLabelText('Acepto los términos')
    expect(checkbox).toHaveAttribute('name', 'terms')
    await user.click(checkbox)
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toEqual({ terms: true })
  })
})
