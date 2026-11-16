import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Form, Field } from '@/components/ui/Form'
import { DatePicker } from './DatePicker'

describe('DatePicker', () => {
  it('abre el calendario y permite cerrarlo con click afuera', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <DatePicker />
        <button type="button">fuera</button>
      </div>,
    )
    const trigger = screen.getAllByRole('button')[0]
    await user.click(trigger)
    expect(screen.getByRole('dialog', { name: 'Selector de fecha' })).toBeInTheDocument()
  })

  it('en modo stand-alone selecciona una fecha y refleja onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    function Controlled() {
      const [value, setValue] = useState<Date | null>(null)
      return (
        <DatePicker
          value={value}
          onChange={(next) => {
            onChange(next)
            setValue(next)
          }}
        />
      )
    }
    render(<Controlled />)
    await user.click(screen.getByRole('button'))
    const day15 = await screen.findByRole('button', { name: /15/ })
    await user.click(day15)
    await waitFor(() => expect(onChange).toHaveBeenCalled())
    const arg = onChange.mock.calls[0][0] as Date
    expect(arg).toBeInstanceOf(Date)
    expect(arg.getDate()).toBe(15)
  })

  it('clearable limpia la fecha', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    function Controlled() {
      const [value, setValue] = useState<Date | null>(new Date(2026, 0, 15))
      return (
        <DatePicker
          value={value}
          onChange={(next) => {
            onChange(next)
            setValue(next)
          }}
        />
      )
    }
    render(<Controlled />)
    await user.click(screen.getByLabelText('Limpiar fecha'))
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('dentro de Field consume el contexto', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    function TestForm() {
      const form = useForm<{ date: Date | null }>({ defaultValues: { date: null } })
      return (
        <Form form={form} onSubmit={onSubmit}>
          <Field name="date" label="Fecha">
            <DatePicker />
          </Field>
          <button type="submit">Enviar</button>
        </Form>
      )
    }
    render(<TestForm />)
    await user.click(screen.getByRole('button', { name: 'Fecha' }))
    const day10 = await screen.findByRole('button', { name: /10/ })
    await user.click(day10)
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const submitted = onSubmit.mock.calls[0][0] as { date: Date }
    expect(submitted.date).toBeInstanceOf(Date)
    expect(submitted.date.getDate()).toBe(10)
  })
})
