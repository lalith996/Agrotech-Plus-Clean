import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { CertificationForm } from '@/components/farmer/certification-form';
import { withAuth } from '@/components/auth/with-auth'
import { UserRole } from '@prisma/client'
import type { CertificationFormData } from '@/lib/schemas/certification';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function EditCertificationPage() {
  const router = useRouter();
  const { id } = router.query;
  const [certification, setCertification] = useState<CertificationFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/farmer/certifications/${id}`)
        .then((res) => res.json())
        .then((data) => {
          // Convert string dates to Date objects
          const formattedData = {
            ...data,
            issueDate: new Date(data.issueDate),
            expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
          };
          setCertification(formattedData);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch certification:', error);
          setIsLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = async (data: CertificationFormData) => {
    const response = await fetch(`/api/farmer/certifications/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update certification');
    }

    router.push('/farmer/certifications');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="mx-auto max-w-2xl space-y-6">
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (!certification) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Certification Not Found</h1>
        <p className="text-gray-600 mb-8">
          The certification you are looking for does not exist or you do not have permission to edit it.
        </p>
        <Button onClick={() => router.push('/farmer/certifications')}>
          Back to Certifications
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Edit Certification</h1>
      <div className="mx-auto max-w-2xl">
        <CertificationForm onSubmit={handleSubmit} initialData={certification} />
      </div>
    </div>
  );
}

export default withAuth(EditCertificationPage, { requiredRoles: [UserRole.FARMER] })