
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const AdminQCDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [inspection, setInspection] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    actualQuantity: 0,
    qualityScore: 5,
    notes: ''
  });

  useEffect(() => {
    if (!id) return;
    const fetchInspectionDetails = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get('/api/admin/qc/inspections');
        if (data.success) {
          const foundInspection = data.inspections.find((i: any) => i.id === id);
          if (foundInspection) {
            setInspection(foundInspection);
            setFormData({ ...formData, actualQuantity: foundInspection.expectedQuantity });
          } else {
            setError('Inspection not found.');
          }
        }
      } catch (err) {
        setError('Failed to load inspection details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInspectionDetails();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        farmerDeliveryId: inspection.farmerDeliveryId,
        productId: inspection.productId,
        ...formData
      };
      const { data } = await axios.post('/api/admin/qc/submit', payload);
      if (data.success) {
        alert('QC results submitted successfully!');
        router.push('/admin/qc');
      } else {
        alert(data.message || 'Failed to submit QC results.');
      }
    } catch (err) {
      alert('An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p>Loading inspection...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!inspection) return <p>Inspection not found.</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>QC Inspection for Delivery: {inspection.id}</h1>
      <p>Farmer: {inspection.farmerName}</p>
      <p>Farm: {inspection.farmName}</p>
      <p>Product: {inspection.productName}</p>
      <p>Expected Quantity: {inspection.expectedQuantity} {inspection.unit}</p>
      
      <form onSubmit={handleSubmit} style={{ margin: '2rem 0' }}>
        <div>
          <label>Actual Quantity:</label>
          <input type="number" name="actualQuantity" value={formData.actualQuantity} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Quality Score (1-5):</label>
          <input type="range" name="qualityScore" min="1" max="5" value={formData.qualityScore} onChange={handleInputChange} />
        </div>
        <div>
          <label>Notes:</label>
          <textarea name="notes" value={formData.notes} onChange={handleInputChange} />
        </div>
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Results'}</button>
      </form>
    </div>
  );
};

export default AdminQCDetailPage;
