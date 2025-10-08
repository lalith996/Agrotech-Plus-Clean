
import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDriversPage = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/api/admin/logistics/drivers');
      setDrivers(data.drivers);
      setStats(data.stats);
    } catch (err) {
      setError('Failed to load drivers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleUpdateStatus = async (driverId: string, status: string) => {
    try {
      await axios.put('/api/admin/logistics/drivers', { driverId, status });
      fetchDrivers(); // Refresh the list
    } catch (err) {
      alert('Failed to update driver status.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Driver Management</h1>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>Total Drivers: {stats.total}</div>
        <div>Available: {stats.available}</div>
        <div>On Route: {stats.onRoute}</div>
        <div>Offline: {stats.offline}</div>
        <div>Avg. Rating: {stats.averageRating?.toFixed(2)}</div>
      </div>

      {isLoading && <p>Loading drivers...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {drivers.map(driver => (
            <div key={driver.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
              <h3>{driver.user.name}</h3>
              <p>Vehicle: {driver.vehicle.make} {driver.vehicle.model} ({driver.vehicle.licensePlate})</p>
              <p>Status: {driver.status}</p>
              <p>Rating: {driver.rating}</p>
              <select value={driver.status} onChange={e => handleUpdateStatus(driver.id, e.target.value)}>
                <option value="available">Available</option>
                <option value="on_route">On Route</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDriversPage;
