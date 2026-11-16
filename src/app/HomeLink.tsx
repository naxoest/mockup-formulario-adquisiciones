import { Link } from '@tanstack/react-router'

export function HomeLink() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-primary-600 underline-offset-4 hover:text-primary-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      Ir al inicio
    </Link>
  )
}
