import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Form, Field } from '@/components/ui/Form'
import { RadioGroup } from './RadioGroup'

const OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
]

describe('RadioGroup', () => {
  it('en modo stand-alone selecciona uno excluyente', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [value, setValue] = useState('')
      return (
        <>
          <RadioGroup options={OPTIONS} value={value} onChange={setValue} />
          <output>{value}</output>
        </>
      )
    }
    render(<Controlled />)
    await user.click(screen.getByLabelText('Pro'))
    expect(screen.getByRole('status')).toHaveTextContent('pro')
    await user.click(screen.getByLabelText('Enterprise'))
    expect(screen.getByRole('status')).toHaveTextContent('enterprise')
  })

  it('dentro de Field consume el contexto', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    function TestForm() {
      const form = useForm({ defaultValues: { plan: '' } })
      return (
        <Form form={form} onSubmit={onSubmit}>
          <Field name="plan" label="Plan">
            <RadioGroup options={OPTIONS} />
          </Field>
          <button type="submit">Enviar</button>
        </Form>
      )
    }
    render(<TestForm />)
    await user.click(screen.getByLabelText('Pro'))
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toEqual({ plan: 'pro' })
  })

  it('respeta opciones deshabilitadas', () => {
    render(
      <RadioGroup
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B', disabled: true },
        ]}
      />,
    )
    expect(screen.getByLabelText('A')).not.toBeDisabled()
    expect(screen.getByLabelText('B')).toBeDisabled()
  })
})
