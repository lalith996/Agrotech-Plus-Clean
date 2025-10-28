import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { Edit2, Plus, Trash2 } from 'lucide-react';

import { withAuth } from '@/components/auth/with-auth';
import { UserRole } from '@prisma/client'
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Certification {
  id: string;
  type: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  documentUrl: string;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  notes?: string;
}

function getStatusColor(status: Certification['status']) {
  switch (status) {
    case 'verified':
      return 'bg-emerald-100 text-emerald-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'expired':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function CertificationsPage() {
  const router = useRouter();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [certificationToDelete, setCertificationToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const response = await fetch('/api/certifications');
      if (!response.ok) {
        throw new Error('Failed to fetch certifications');
      }
      const data = await response.json();
      const mapped: Certification[] = (data.certifications || []).map((c: any) => {
        const expired = c.expiryDate ? new Date(c.expiryDate) < new Date() : false;
        const status: Certification['status'] = expired ? 'expired' : (c.isValidated ? 'verified' : 'pending');
        return {
          id: c.id,
          type: c.type,
          issuer: c.issuer,
          issueDate: c.issueDate,
          expiryDate: c.expiryDate ?? undefined,
          documentUrl: c.file?.url ?? '',
          status,
          notes: c.validationNotes ?? '',
        } as Certification;
      });
      setCertifications(mapped);
    } catch (error) {
      toast.error('Failed to load certifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!certificationToDelete) return;

    // DELETE not implemented in API; show message and close dialog
    toast.error('Deletion is currently not supported');
    setCertificationToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Certifications</h1>
        <Button onClick={() => router.push('/farmer/certifications/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Certification
        </Button>
      </div>

      {certifications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No certifications found</p>
          <Button onClick={() => router.push('/farmer/certifications/new')}>
            Add Your First Certification
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certifications.map((cert) => (
            <Card key={cert.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{cert.type}</h3>
                  <p className="text-gray-600">{cert.issuer}</p>
                </div>
                <Badge className={getStatusColor(cert.status)}>
                  {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <span className="font-medium">Issued:</span>{' '}
                  {format(new Date(cert.issueDate), 'PP')}
                </p>
                {cert.expiryDate && (
                  <p className="text-sm">
                    <span className="font-medium">Expires:</span>{' '}
                    {format(new Date(cert.expiryDate), 'PP')}
                  </p>
                )}
                {cert.notes && (
                  <p className="text-sm">
                    <span className="font-medium">Notes:</span> {cert.notes}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/farmer/certifications/${cert.id}/edit`)}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setCertificationToDelete(cert.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Certification</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this certification? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setCertificationToDelete(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => window.open(cert.documentUrl, '_blank')}
                >
                  View Document
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default withAuth(CertificationsPage, { requiredRoles: [UserRole.FARMER] })