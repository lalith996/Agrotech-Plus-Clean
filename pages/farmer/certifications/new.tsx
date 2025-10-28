import { useRouter } from 'next/router';

import { CertificationForm } from '@/components/farmer/certification-form';
import { withAuth } from '@/components/auth/with-auth'
import { UserRole } from '@prisma/client'
import type { CertificationFormData } from '@/lib/schemas/certification';

function NewCertificationPage() {
  const router = useRouter();

  const handleSubmit = async (data: CertificationFormData) => {
    const response = await fetch('/api/farmer/certifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create certification');
    }

    router.push('/farmer/certifications');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Add New Certification</h1>
      <div className="mx-auto max-w-2xl">
        <CertificationForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

export default withAuth(NewCertificationPage, { requiredRoles: [UserRole.FARMER] })