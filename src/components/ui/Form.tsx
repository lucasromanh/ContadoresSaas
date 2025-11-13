import React from 'react'
import { useForm, FormProvider } from 'react-hook-form'

export const Form = ({ children, onSubmit, defaultValues = {} }: { children: React.ReactNode; onSubmit: (data: any) => void; defaultValues?: any }) => {
  const methods = useForm({ defaultValues })

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>{children}</form>
    </FormProvider>
  )
}

export const FormField = ({ children }: { children: React.ReactNode }) => <div className="mb-3">{children}</div>
