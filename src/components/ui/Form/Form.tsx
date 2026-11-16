import type { FormHTMLAttributes, ReactNode } from 'react'
import {
  FormProvider,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form'
import { cn } from '@/utils/cn'

interface FormProps<TValues extends FieldValues> extends Omit<
  FormHTMLAttributes<HTMLFormElement>,
  'onSubmit'
> {
  form: UseFormReturn<TValues>
  onSubmit: SubmitHandler<TValues>
  className?: string
  children: ReactNode
}

export const Form = <TValues extends FieldValues>({
  form,
  onSubmit,
  className,
  children,
  ...formProps
}: FormProps<TValues>) => {
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(className)}
        noValidate
        {...formProps}
      >
        {children}
      </form>
    </FormProvider>
  )
}
