
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface ProcurementList {
  id: string;
  date: string;
  status: string;
  totalItems: number;
  totalFarmers: number;
}

const AdminProcurementPage = () => {
  const [lists, setLists] = useState<ProcurementList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProcurementLists = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/api/admin/procurement');
      setLists(data.lists);
    } catch (err) {
      setError('Failed to load procurement lists.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProcurementLists();
  }, []);

  const generateNewList = async () => {
    if (!confirm('Are you sure you want to generate a new procurement list based on current demand?')) return;
    try {
      const { data } = await axios.post('/api/admin/procurement/generate', {});
      alert(data.message);
      fetchProcurementLists(); // Refresh the list
    } catch (err) {
      alert('Failed to generate new list.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Procurement Management</h1>
        <button onClick={generateNewList}>Generate New List</button>
      </div>

      {isLoading && <p>Loading lists...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {lists.length > 0 ? lists.map(list => (
            <div key={list.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
              <Link href={`/admin/procurement/${list.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h3>List ID: {list.id}</h3>
                <p>Date: {new Date(list.date).toLocaleDateString()}</p>
                <p>Status: {list.status}</p>
                <p>Items: {list.totalItems} | Farmers: {list.totalFarmers}</p>
              </Link>
            </div>
          )) : <p>No procurement lists found.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminProcurementPage;
