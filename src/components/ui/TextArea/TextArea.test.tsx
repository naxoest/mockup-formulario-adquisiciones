import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Form, Field } from '@/components/ui/Form'
import { TextArea } from './TextArea'

describe('TextArea', () => {
  it('en modo stand-alone es controlable con value y onChange', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [value, setValue] = useState('')
      return (
        <TextArea aria-label="Campo" value={value} onChange={(e) => setValue(e.target.value)} />
      )
    }
    render(<Controlled />)
    const textarea = screen.getByLabelText('Campo')
    await user.type(textarea, 'hola mundo')
    expect(textarea).toHaveValue('hola mundo')
  })

  it('aplica clases de tamano', () => {
    const { rerender } = render(<TextArea aria-label="X" size="sm" />)
    expect(screen.getByLabelText('X')).toHaveClass('text-xs')
    rerender(<TextArea aria-label="X" size="lg" />)
    expect(screen.getByLabelText('X')).toHaveClass('text-base')
  })

  it('aplica estilo invalid cuando prop invalid es true', () => {
    render(<TextArea aria-label="X" invalid />)
    const textarea = screen.getByLabelText('X')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(textarea.className).toMatch(/scarlet/)
  })

  it('dentro de Field consume el contexto', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    function TestForm() {
      const form = useForm({ defaultValues: { description: '' } })
      return (
        <Form form={form} onSubmit={onSubmit}>
          <Field name="description" label="Descripción">
            <TextArea />
          </Field>
          <button type="submit">Enviar</button>
        </Form>
      )
    }
    render(<TestForm />)
    const textarea = screen.getByLabelText('Descripción')
    expect(textarea).toHaveAttribute('name', 'description')
    await user.type(textarea, 'detalle')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toEqual({ description: 'detalle' })
  })

  it('muestra contador cuando showCounter y maxLength estan presentes', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    function TestForm() {
      const form = useForm({ defaultValues: { description: '' } })
      return (
        <Form form={form} onSubmit={onSubmit}>
          <Field name="description" label="Descripción">
            <TextArea maxLength={20} showCounter />
          </Field>
        </Form>
      )
    }
    render(<TestForm />)
    expect(screen.getByText('0/20')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Descripción'), 'hola')
    expect(screen.getByText('4/20')).toBeInTheDocument()
  })
})
