
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const ProcurementDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [list, setList] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchListDetails = async () => {
      setIsLoading(true);
      try {
        // In a real app, you might have a /api/admin/procurement/[id] endpoint.
        // For now, we fetch all and filter, as per the mock API structure.
        const { data } = await axios.get('/api/admin/procurement');
        const foundList = data.lists.find((l: any) => l.id === id);
        if (foundList) {
          setList(foundList);
        } else {
          setError('Procurement list not found.');
        }
      } catch (err) {
        setError('Failed to load procurement details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchListDetails();
  }, [id]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!list) return <p>List not found.</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Procurement List: {list.id}</h1>
      <p>Date: {new Date(list.date).toLocaleDateString()}</p>
      <p>Status: <strong>{list.status}</strong></p>

      <div style={{ margin: '2rem 0' }}>
        <button style={{ marginRight: '1rem' }}>Send to Farmers</button>
        <button style={{ marginRight: '1rem' }}>Mark as Complete</button>
        <button>Export as CSV</button>
      </div>

      <h2>Items to Procure</h2>
      {list.items.map((item: any) => (
        <div key={item.productId} style={{ border: '1px solid #eee', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h3>{item.productName}</h3>
          <p>Total Quantity: {item.totalQuantity} {item.unit}</p>
          <h4>Assigned Farmers:</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Farmer</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Farm</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Assigned Quantity</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Reported Capacity</th>
              </tr>
            </thead>
            <tbody>
              {item.farmers.map((farmer: any) => (
                <tr key={farmer.farmerId}>
                  <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{farmer.farmerName}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{farmer.farmName}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{farmer.assignedQuantity} {item.unit}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{farmer.capacity} {item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default ProcurementDetailPage;
