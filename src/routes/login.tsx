import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { Lock, Mail } from 'lucide-react'
import { Form, Field } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SystemLogo } from '@/components/ui/SystemLogo'
import { zodResolver } from '@/lib/zodResolver'
import { authSessionKey } from '@/features/auth/session'
import { useAuth } from '@/features/auth/useAuth'
import { loginSchema, type LoginValues } from '@/features/auth/loginSchema'
import { resolveLoginError } from '@/features/auth/loginErrors'
import loginImage from '@/assets/loginImage.jpg'

interface LoginSearch {
  redirect?: string
}

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { redirect } = Route.useSearch()
  const { isAuthenticated, isLoading, login } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email_intento: '', password: '' },
    mode: 'onTouched',
  })

  useEffect(() => {
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== authSessionKey[0],
    })
  }, [queryClient])

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to: redirect ?? '/' })
    }
  }, [isAuthenticated, isLoading, navigate, redirect])

  const onSubmit = (values: LoginValues) => {
    setFormError(null)
    login.mutate(values, {
      onSuccess: () => {
        navigate({ to: redirect ?? '/' })
      },
      onError: (error) => {
        const result = resolveLoginError(error)
        if (result.fieldError) {
          form.setError(result.fieldError.field, {
            type: 'server',
            message: result.fieldError.message,
          })
        }
        if (result.formMessage) {
          setFormError(result.formMessage)
        }
      },
    })
  }

  return (
    <div className="min-h-screen w-full flex bg-mercury-100 justify-center items-center p-4">
      <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="w-1/2 hidden md:block relative">
          <img
            src={loginImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-mercury-900/20 mix-blend-multiply" />
        </div>

        <div className="w-full md:w-1/2 py-12 px-8 sm:px-12 lg:px-16 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto flex flex-col gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-72">
                  <SystemLogo />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-mercury-900 tracking-tight">
                Inicio de sesión
              </h1>
              <p className="text-mercury-700 mt-2 text-sm">
                Ingresa las credenciales de tu correo institucional para acceder al sistema.
              </p>
            </div>

            {formError && (
              <div
                role="alert"
                className="bg-scarlet-50 border border-scarlet-200 text-scarlet-600 px-4 py-3 rounded-lg text-sm"
              >
                <span className="font-medium mr-1">Error:</span>
                {formError}
              </div>
            )}

            <Form form={form} onSubmit={onSubmit} className="flex flex-col gap-5">
              <Field name="email_intento" label="Correo electrónico">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mercury-400">
                    <Mail size={20} aria-hidden="true" />
                  </span>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="usuario@ulagos.cl"
                    className="pl-10"
                  />
                </div>
              </Field>

              <Field name="password" label="Contraseña">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mercury-400">
                    <Lock size={20} aria-hidden="true" />
                  </span>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
              </Field>

              <Button type="submit" size="lg" loading={login.isPending} className="w-full mt-2">
                Iniciar sesión
              </Button>
            </Form>

            <div className="text-center text-xs text-mercury-400 mt-4">
              © {new Date().getFullYear()} Sistema de Adquisiciones
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
