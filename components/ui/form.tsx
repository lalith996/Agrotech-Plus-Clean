import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const Form = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement>
>(({ className, ...props }, ref) => (
  <form
    ref={ref}
    className={cn("space-y-6", className)}
    {...props}
  />
))
Form.displayName = "Form"

const FormField = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-2", className)}
    {...props}
  />
))
FormField.displayName = "FormField"

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
FormLabel.displayName = "FormLabel"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    variant?: 'error' | 'success' | 'info'
  }
>(({ className, variant = 'error', ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm",
      {
        'text-destructive': variant === 'error',
        'text-success': variant === 'success', 
        'text-muted-foreground': variant === 'info'
      },
      className
    )}
    role={variant === 'error' ? 'alert' : 'status'}
    aria-live={variant === 'error' ? 'assertive' : 'polite'}
    {...props}
  />
))
FormMessage.displayName = "FormMessage"

export { Form, FormField, FormLabel, FormMessage }