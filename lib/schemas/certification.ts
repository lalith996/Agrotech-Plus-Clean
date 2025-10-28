import { z } from 'zod';

export const CERTIFICATION_TYPES = [
  'Organic',
  'Fair Trade',
  'GAP',
  'Food Safety',
  'Sustainable Agriculture',
  'Pesticide-Free',
  'Non-GMO',
  'Rainforest Alliance',
] as const;

export const CERTIFICATION_STATUS = [
  'pending',
  'verified',
  'rejected',
  'expired',
] as const;

export const certificationSchema = z.object({
  type: z.enum(CERTIFICATION_TYPES, {
    required_error: 'Please select a certification type',
  }),
  issuer: z.string().min(2, {
    message: 'Issuer must be at least 2 characters',
  }),
  issueDate: z.date({
    required_error: 'Please select issue date',
  }),
  expiryDate: z.date({
    required_error: 'Please select expiry date',
  }).optional(),
  documentUrl: z.string().url({
    message: 'Please upload a valid certification document',
  }),
  notes: z.string().optional(),
});

export type CertificationFormData = z.infer<typeof certificationSchema>;