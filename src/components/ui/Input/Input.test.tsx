import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/Form'
import { Field } from '@/components/ui/Form'
import { Input } from './Input'

describe('Input', () => {
  it('en modo stand-alone es controlable con value y onChange', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [value, setValue] = useState('')
      return <Input aria-label="Campo" value={value} onChange={(e) => setValue(e.target.value)} />
    }
    render(<Controlled />)
    const input = screen.getByLabelText('Campo')
    await user.type(input, 'hola')
    expect(input).toHaveValue('hola')
  })

  it('aplica clases de tamano', () => {
    const { rerender } = render(<Input aria-label="X" size="sm" />)
    expect(screen.getByLabelText('X')).toHaveClass('text-xs')
    rerender(<Input aria-label="X" size="lg" />)
    expect(screen.getByLabelText('X')).toHaveClass('text-base')
  })

  it('aplica estilo invalid cuando prop invalid es true', () => {
    render(<Input aria-label="X" invalid />)
    const input = screen.getByLabelText('X')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input.className).toMatch(/scarlet/)
  })

  it('dentro de Field consume el contexto', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    function TestForm() {
      const form = useForm({ defaultValues: { email: '' } })
      return (
        <Form form={form} onSubmit={onSubmit}>
          <Field name="email" label="Email">
            <Input />
          </Field>
          <button type="submit">Enviar</button>
        </Form>
      )
    }
    render(<TestForm />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('name', 'email')
    await user.type(input, 'a@b.cl')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'a@b.cl' })
  })
})
