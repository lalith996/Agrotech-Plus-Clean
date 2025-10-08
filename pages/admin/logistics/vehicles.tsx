
import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminVehiclesPage = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/api/admin/logistics/vehicles');
      setVehicles(data.vehicles);
      setStats(data.stats);
    } catch (err) {
      setError('Failed to load vehicles.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleUpdateStatus = async (vehicleId: string, status: string) => {
    try {
      await axios.put('/api/admin/logistics/vehicles', { vehicleId, status });
      fetchVehicles(); // Refresh the list
    } catch (err) {
      alert('Failed to update vehicle status.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Vehicle Management</h1>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>Total Vehicles: {stats.total}</div>
        <div>Available: {stats.available}</div>
        <div>In Use: {stats.inUse}</div>
        <div>Maintenance: {stats.maintenance}</div>
      </div>

      {isLoading && <p>Loading vehicles...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {vehicles.map(vehicle => (
            <div key={vehicle.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
              <h3>{vehicle.make} {vehicle.model} ({vehicle.licensePlate})</h3>
              <p>Assigned Driver: {vehicle.assignedDriver?.user.name || 'None'}</p>
              <p>Status: {vehicle.status}</p>
              <select value={vehicle.status} onChange={e => handleUpdateStatus(vehicle.id, e.target.value)}>
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVehiclesPage;
