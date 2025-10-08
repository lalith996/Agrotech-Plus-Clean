
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Inspection {
  id: string;
  farmerName: string;
  farmName: string;
  deliveryDate: string;
  status: string;
}

const AdminQCPage = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInspections = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/api/admin/qc/inspections');
      if (data.success) {
        setInspections(data.inspections);
      }
    } catch (err) {
      setError('Failed to load QC inspections.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Quality Control Inspections</h1>
        <Link href="/admin/qc/submit-offline"><button>Submit Offline Inspections</button></Link>
      </div>

      {isLoading && <p>Loading inspections...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {inspections.length > 0 ? inspections.map(inspection => (
            <div key={inspection.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
              <Link href={`/admin/qc/${inspection.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h3>Farmer: {inspection.farmerName}</h3>
                <p>Farm: {inspection.farmName}</p>
                <p>Delivery Date: {new Date(inspection.deliveryDate).toLocaleDateString()}</p>
                <p>Status: {inspection.status}</p>
              </Link>
            </div>
          )) : <p>No pending QC inspections found.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminQCPage;
