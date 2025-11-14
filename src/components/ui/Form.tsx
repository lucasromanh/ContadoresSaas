import React from 'react'
import { useForm, FormProvider, UseFormReturn } from 'react-hook-form'

type Props = {
  children: React.ReactNode
  onSubmit: (data: any) => void
  defaultValues?: any
  methods?: UseFormReturn<any>
}

export const Form = ({ children, onSubmit, defaultValues = {}, methods }: Props) => {
  const internal = useForm({ defaultValues })
  const formMethods = methods ?? internal

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)}>{children}</form>
    </FormProvider>
  )
}

export const FormField = ({ children }: { children: React.ReactNode }) => <div className="mb-3">{children}</div>
