import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Form, Field } from '@/components/ui/Form'
import { NumberInput } from './NumberInput'

describe('NumberInput', () => {
  it('escribe y commitea al perder foco', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    function Controlled() {
      const [value, setValue] = useState<number | null>(null)
      return (
        <NumberInput
          aria-label="Monto"
          value={value}
          onChange={(next) => {
            onChange(next)
            setValue(next)
          }}
        />
      )
    }
    render(<Controlled />)
    const input = screen.getByLabelText('Monto')
    await user.click(input)
    await user.type(input, '1234')
    await user.tab()
    expect(onChange).toHaveBeenLastCalledWith(1234)
  })

  it('stepper incrementa y decrementa con step', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    function Controlled() {
      const [value, setValue] = useState<number | null>(10)
      return (
        <NumberInput
          aria-label="Monto"
          step={5}
          value={value}
          onChange={(next) => {
            onChange(next)
            setValue(next)
          }}
        />
      )
    }
    render(<Controlled />)
    await user.click(screen.getByLabelText('Incrementar'))
    expect(onChange).toHaveBeenLastCalledWith(15)
    await user.click(screen.getByLabelText('Decrementar'))
    expect(onChange).toHaveBeenLastCalledWith(10)
  })

  it('clamp respeta min y max', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    function Controlled() {
      const [value, setValue] = useState<number | null>(null)
      return (
        <NumberInput
          aria-label="Monto"
          min={0}
          max={100}
          value={value}
          onChange={(next) => {
            onChange(next)
            setValue(next)
          }}
        />
      )
    }
    render(<Controlled />)
    const input = screen.getByLabelText('Monto')
    await user.click(input)
    await user.type(input, '500')
    await user.tab()
    expect(onChange).toHaveBeenLastCalledWith(100)
  })

  it('dentro de Field envía número', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    function TestForm() {
      const form = useForm<{ amount: number | null }>({ defaultValues: { amount: null } })
      return (
        <Form form={form} onSubmit={onSubmit}>
          <Field name="amount" label="Monto">
            <NumberInput />
          </Field>
          <button type="submit">Enviar</button>
        </Form>
      )
    }
    render(<TestForm />)
    const input = screen.getByLabelText('Monto')
    await user.click(input)
    await user.type(input, '42')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toEqual({ amount: 42 })
  })
})
