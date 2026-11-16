import { render, screen } from '@testing-library/react'

function Greeting({ name }: { name: string }) {
  return <h1>Hola, {name}</h1>
}

describe('smoke test del pipeline de testing', () => {
  it('renderiza un componente y verifica el DOM', () => {
    render(<Greeting name="mundo" />)
    expect(screen.getByRole('heading', { name: /hola, mundo/i })).toBeInTheDocument()
  })

  it('verifica que los matchers de jest-dom están disponibles', () => {
    render(<button disabled>clic</button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
