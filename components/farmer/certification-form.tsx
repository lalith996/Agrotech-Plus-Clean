import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

import {
  certificationSchema,
  CertificationFormData,
  CERTIFICATION_TYPES,
} from '@/lib/schemas/certification';

interface CertificationFormProps {
  onSubmit: (data: CertificationFormData) => Promise<void>;
  initialData?: Partial<CertificationFormData>;
}

export function CertificationForm({
  onSubmit,
  initialData,
}: CertificationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const form = useForm<CertificationFormData>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      type: initialData?.type,
      issuer: initialData?.issuer || '',
      issueDate: initialData?.issueDate,
      expiryDate: initialData?.expiryDate,
      documentUrl: initialData?.documentUrl || '',
      notes: initialData?.notes || '',
    },
  });

  const handleSubmit = async (data: CertificationFormData) => {
    try {
      setIsLoading(true);

      if (documentFile) {
        const formData = new FormData();
        formData.append('file', documentFile);

        const uploadResponse = await fetch('/api/upload/certification', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload document');
        }

        const { url } = await uploadResponse.json();
        data.documentUrl = url;
      }

      await onSubmit(data);
      // Minimal feedback without external toast dependency
      // eslint-disable-next-line no-alert
      alert('Certification submitted successfully');
    } catch (error) {
      console.error(error);
      // eslint-disable-next-line no-alert
      alert('Failed to submit certification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
    }
  };

  const errors = form.formState.errors;
  const issueDate = form.watch('issueDate');
  const expiryDate = form.watch('expiryDate');

  return (
    <Form {...(form as any)}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certification Type</FormLabel>
              <Select
                value={field.value}
                onValueChange={(val) => field.onChange(val)}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select certification type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CERTIFICATION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage>{errors.type?.message as string}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="issuer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issuer</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter certification issuer"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage>{errors.issuer?.message as string}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="issueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full pl-3 text-left font-normal ${!issueDate && 'text-muted-foreground'}`}
                    disabled={isLoading}
                  >
                    {issueDate ? (
                      format(issueDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={issueDate}
                    onSelect={(date) => field.onChange(date as Date)}
                    disabled={(date) =>
                      (date as Date) > new Date() || (date as Date) < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage>{errors.issueDate?.message as string}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry Date (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full pl-3 text-left font-normal ${!expiryDate && 'text-muted-foreground'}`}
                    disabled={isLoading}
                  >
                    {expiryDate ? (
                      format(expiryDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={(date) => field.onChange(date as Date)}
                    disabled={(date) =>
                      (date as Date) < new Date() || (date as Date) < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage>{errors.expiryDate?.message as string}</FormMessage>
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Certification Document</FormLabel>
          <FormControl>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              {initialData?.documentUrl && !documentFile && (
                <a
                  href={initialData.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline"
                >
                  View Current
                </a>
              )}
            </div>
          </FormControl>
          <FormMessage>{errors.documentUrl?.message as string}</FormMessage>
        </FormItem>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  aria-label="Additional Notes"
                  placeholder="Enter any additional notes or comments"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage>{errors.notes?.message as string}</FormMessage>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Certification'}
        </Button>
      </form>
    </Form>
  );
}