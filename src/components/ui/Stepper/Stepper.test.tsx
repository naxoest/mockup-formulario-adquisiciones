import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Stepper } from './Stepper'

describe('Stepper', () => {
  it('renderiza todos los pasos con sus labels', () => {
    render(
      <Stepper active={0}>
        <Stepper.Step label="Uno" />
        <Stepper.Step label="Dos" />
        <Stepper.Step label="Tres" />
      </Stepper>,
    )
    expect(screen.getAllByText('Uno').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Dos').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Tres').length).toBeGreaterThan(0)
  })

  it('marca el paso activo con aria-current="step"', () => {
    render(
      <Stepper active={1} onStepClick={() => {}}>
        <Stepper.Step label="Uno" />
        <Stepper.Step label="Dos" />
        <Stepper.Step label="Tres" />
      </Stepper>,
    )
    expect(screen.getByLabelText('Paso 1: Uno')).not.toHaveAttribute('aria-current')
    expect(screen.getByLabelText('Paso 2: Dos')).toHaveAttribute('aria-current', 'step')
    expect(screen.getByLabelText('Paso 3: Tres')).not.toHaveAttribute('aria-current')
  })

  it('renderiza el contenido del paso activo', () => {
    render(
      <Stepper active={1}>
        <Stepper.Step label="Uno">Contenido uno</Stepper.Step>
        <Stepper.Step label="Dos">Contenido dos</Stepper.Step>
      </Stepper>,
    )
    expect(screen.queryByText('Contenido uno')).not.toBeInTheDocument()
    expect(screen.getByText('Contenido dos')).toBeInTheDocument()
  })

  it('renderiza Stepper.Completed cuando active >= totalSteps', () => {
    render(
      <Stepper active={3}>
        <Stepper.Step label="Uno" />
        <Stepper.Step label="Dos" />
        <Stepper.Step label="Tres" />
        <Stepper.Completed>Has terminado</Stepper.Completed>
      </Stepper>,
    )
    expect(screen.getByText('Has terminado')).toBeInTheDocument()
  })

  it('dispara onStepClick al clickear un paso clicable', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(
      <Stepper active={2} onStepClick={handleClick}>
        <Stepper.Step label="Uno" />
        <Stepper.Step label="Dos" />
        <Stepper.Step label="Tres" />
      </Stepper>,
    )
    await user.click(screen.getByLabelText('Paso 1: Uno'))
    expect(handleClick).toHaveBeenCalledWith(0)
  })

  it('bloquea pasos futuros con allowNextStepsSelect=false', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(
      <Stepper active={0} onStepClick={handleClick} allowNextStepsSelect={false}>
        <Stepper.Step label="Uno" />
        <Stepper.Step label="Dos" />
      </Stepper>,
    )
    const future = screen.getByLabelText('Paso 2: Dos') as HTMLButtonElement
    expect(future).toBeDisabled()
    await user.click(future)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('permite clickear pasos completados con allowNextStepsSelect=false', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(
      <Stepper active={2} onStepClick={handleClick} allowNextStepsSelect={false}>
        <Stepper.Step label="Uno" />
        <Stepper.Step label="Dos" />
        <Stepper.Step label="Tres" />
      </Stepper>,
    )
    await user.click(screen.getByLabelText('Paso 1: Uno'))
    expect(handleClick).toHaveBeenCalledWith(0)
  })

  it('deshabilita botones cuando onStepClick no se proporciona', () => {
    render(
      <Stepper active={1}>
        <Stepper.Step label="Uno" />
        <Stepper.Step label="Dos" />
      </Stepper>,
    )
    expect(screen.getByLabelText('Paso 1: Uno')).toBeDisabled()
    expect(screen.getByLabelText('Paso 2: Dos')).toBeDisabled()
  })

  it('respeta allowStepSelect=false en un paso específico', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(
      <Stepper active={2} onStepClick={handleClick}>
        <Stepper.Step label="Uno" allowStepSelect={false} />
        <Stepper.Step label="Dos" />
        <Stepper.Step label="Tres" />
      </Stepper>,
    )
    const blocked = screen.getByLabelText('Paso 1: Uno') as HTMLButtonElement
    expect(blocked).toBeDisabled()
    await user.click(blocked)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renderiza icono custom en un paso pendiente', () => {
    render(
      <Stepper active={0}>
        <Stepper.Step label="Uno" />
        <Stepper.Step label="Dos" icon={<span data-testid="custom-icon">X</span>} />
      </Stepper>,
    )
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('renderiza spinner cuando loading=true', () => {
    const { container } = render(
      <Stepper active={1}>
        <Stepper.Step label="Uno" />
        <Stepper.Step label="Dos" loading />
      </Stepper>,
    )
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('aplica estilo de error a un paso con error=true', () => {
    render(
      <Stepper active={1}>
        <Stepper.Step label="Uno" error />
        <Stepper.Step label="Dos" />
      </Stepper>,
    )
    const errorStep = screen.getByLabelText('Paso 1: Uno')
    expect(errorStep.className).toMatch(/scarlet/)
  })

  it('renderiza description del paso si se provee', () => {
    render(
      <Stepper active={0}>
        <Stepper.Step label="Uno" description="Detalle del paso uno" />
      </Stepper>,
    )
    expect(screen.getByText('Detalle del paso uno')).toBeInTheDocument()
  })

  it('respeta completedIcon a nivel Stepper', () => {
    render(
      <Stepper active={2} completedIcon={<span data-testid="done-icon">D</span>}>
        <Stepper.Step label="Uno" />
        <Stepper.Step label="Dos" />
        <Stepper.Step label="Tres" />
      </Stepper>,
    )
    expect(screen.getAllByTestId('done-icon').length).toBe(2)
  })

  it('respeta className en el contenedor raíz', () => {
    const { container } = render(
      <Stepper active={0} className="custom-root-class">
        <Stepper.Step label="Uno" />
      </Stepper>,
    )
    expect(container.querySelector('.custom-root-class')).toBeInTheDocument()
  })
})
