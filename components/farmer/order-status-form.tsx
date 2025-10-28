import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { orderStatusSchema, OrderStatusFormData, ORDER_STATUS_OPTIONS } from '@/lib/schemas/order'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface OrderStatusFormProps {
  orderId: string
  currentStatus: OrderStatusFormData['status']
  onStatusUpdate: () => void
}

export function OrderStatusForm({ orderId, currentStatus, onStatusUpdate }: OrderStatusFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<OrderStatusFormData>({
    resolver: zodResolver(orderStatusSchema),
    defaultValues: {
      status: currentStatus,
      notes: ''
    }
  })

  const onSubmit = async (data: OrderStatusFormData) => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) throw new Error('Failed to update order status')

      onStatusUpdate()
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const errors = form.formState.errors

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Update Order Status</CardTitle>
      </CardHeader>
      <Form {...(form as any)}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ORDER_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage>{errors.status?.message as string}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      aria-label="Notes"
                      placeholder="Add any notes about this status update..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>{errors.notes?.message as string}</FormMessage>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}