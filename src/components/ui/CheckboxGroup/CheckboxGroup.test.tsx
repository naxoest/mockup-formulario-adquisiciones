import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Form, Field } from '@/components/ui/Form'
import { CheckboxGroup } from './CheckboxGroup'

const OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push' },
]

describe('CheckboxGroup', () => {
  it('en modo stand-alone toggle agrega y quita valores', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [value, setValue] = useState<string[]>([])
      return (
        <>
          <CheckboxGroup options={OPTIONS} value={value} onChange={setValue} />
          <output>{value.join(',')}</output>
        </>
      )
    }
    render(<Controlled />)
    await user.click(screen.getByLabelText('Email'))
    await user.click(screen.getByLabelText('SMS'))
    expect(screen.getByRole('status')).toHaveTextContent('email,sms')
    await user.click(screen.getByLabelText('Email'))
    expect(screen.getByRole('status')).toHaveTextContent('sms')
  })

  it('dentro de Field consume el contexto y envia array', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    function TestForm() {
      const form = useForm({ defaultValues: { channels: [] as string[] } })
      return (
        <Form form={form} onSubmit={onSubmit}>
          <Field name="channels" label="Canales">
            <CheckboxGroup options={OPTIONS} />
          </Field>
          <button type="submit">Enviar</button>
        </Form>
      )
    }
    render(<TestForm />)
    await user.click(screen.getByLabelText('Email'))
    await user.click(screen.getByLabelText('Push'))
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toEqual({ channels: ['email', 'push'] })
  })

  it('respeta opciones deshabilitadas individualmente', () => {
    render(
      <CheckboxGroup
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
