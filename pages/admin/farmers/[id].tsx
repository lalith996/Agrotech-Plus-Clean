
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

const AdminFarmerDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [farmer, setFarmer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchFarmer = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`/api/admin/farmers/${id}`);
        setFarmer(data.farmer);
      } catch (err) { 
        setError('Failed to load farmer details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFarmer();
  }, [id]);

  const handleApproval = async (isApproved: boolean) => {
    setIsUpdating(true);
    try {
      const { data } = await axios.put(`/api/admin/farmers/${id}`, { isApproved });
      setFarmer(data.farmer);
      alert(data.message);
    } catch (err) {
      alert('Failed to update farmer status.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p style={{color: 'red'}}>{error}</p>;
  if (!farmer) return <p>Farmer not found.</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{farmer.farmName}</h1>
      <p>Managed by: {farmer.user.name} ({farmer.user.email})</p>

      {!farmer.isApproved && (
        <div style={{ padding: '1rem', backgroundColor: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '8px', marginBottom: '1rem' }}>
          <p>This farmer is pending approval.</p>
          <button onClick={() => handleApproval(true)} disabled={isUpdating} style={{marginRight: '1rem'}}>{isUpdating ? 'Approving...' : 'Approve Farmer'}</button>
        </div>
      )}

      {/* Farmer Details */}
      <h2>Profile Details</h2>
      <p>Location: {farmer.location}</p>
      <p>Bio: {farmer.bio || 'Not provided'}</p>
      <p>Member Since: {new Date(farmer.user.createdAt).toLocaleDateString()}</p>

      {/* Products */}
      <h2>Products ({farmer.products.length})</h2>
      <ul>
        {farmer.products.map((product: any) => (
          <li key={product.id}>
            <Link href={`/admin/products/${product.id}`}>{product.name}</Link>
            - {product.isActive ? 'Active' : 'Inactive'}
          </li>
        ))}
      </ul>

       {/* Certifications */}
       <h2>Certifications</h2>
       {farmer.certifications.length > 0 ? (
         <ul>
          {farmer.certifications.map((cert: any) => (
            <li key={cert.id}>{cert.name} ({cert.issuingBody}) - Expires: {new Date(cert.expiryDate).toLocaleDateString()}</li>
          ))}
         </ul>
       ) : <p>No certifications uploaded.</p>}

    </div>
  );
};

export default AdminFarmerDetailPage;
