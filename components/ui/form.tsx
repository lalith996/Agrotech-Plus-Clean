import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import {
  Controller,
  FormProvider,
  type Control,
  type FieldPath,
  type FieldValues,
  type ControllerRenderProps,
} from "react-hook-form"

// FormProvider wrapper to support <Form {...form}> usage
function Form({ children, ...props }: React.ComponentProps<typeof FormProvider>) {
  return <FormProvider {...props}>{children}</FormProvider>
}

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props} />
  )
)
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
)
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mt-2", className)} {...props} />
  )
)
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    variant?: "error" | "success" | "info"
  }
>(({ className, variant = "error", ...props }, ref) => {
  const baseClasses = cn(
    "text-sm",
    {
      "text-destructive": variant === "error",
      "text-success": variant === "success",
      "text-muted-foreground": variant === "info",
    },
    className
  )

  if (variant === "error") {
    return (
      <p
        ref={ref}
        className={baseClasses}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        {...props}
      />
    )
  }

  return (
    <p
      ref={ref}
      className={baseClasses}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      {...props}
    />
  )
})
FormMessage.displayName = "FormMessage"

// React Hook Form-aware FormField
export function FormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({ control, name, render }: {
  control: Control<TFieldValues>
  name: TName
  render: (props: { field: ControllerRenderProps<TFieldValues, TName> }) => React.ReactElement
}) {
  return <Controller control={control} name={name} render={render as any} />
}

export { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage }