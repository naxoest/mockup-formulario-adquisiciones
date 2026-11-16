import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Form, Field } from '@/components/ui/Form'
import { Select } from './Select'

describe('Select', () => {
  it('renderiza opciones y es controlable', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [value, setValue] = useState('')
      return (
        <Select aria-label="Pais" value={value} onChange={(e) => setValue(e.target.value)}>
          <option value="">Selecciona</option>
          <option value="cl">Chile</option>
          <option value="ar">Argentina</option>
        </Select>
      )
    }
    render(<Controlled />)
    const select = screen.getByLabelText('Pais')
    await user.selectOptions(select, 'cl')
    expect(select).toHaveValue('cl')
  })

  it('dentro de Field consume el contexto', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    function TestForm() {
      const form = useForm({ defaultValues: { country: '' } })
      return (
        <Form form={form} onSubmit={onSubmit}>
          <Field name="country" label="Pais">
            <Select>
              <option value="">Selecciona</option>
              <option value="cl">Chile</option>
              <option value="ar">Argentina</option>
            </Select>
          </Field>
          <button type="submit">Enviar</button>
        </Form>
      )
    }
    render(<TestForm />)
    const select = screen.getByLabelText('Pais')
    await user.selectOptions(select, 'cl')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toEqual({ country: 'cl' })
  })

  it('aplica estilo invalid cuando prop invalid es true', () => {
    render(
      <Select aria-label="X" invalid>
        <option value="a">A</option>
      </Select>,
    )
    const select = screen.getByLabelText('X')
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(select.className).toMatch(/scarlet/)
  })
})
