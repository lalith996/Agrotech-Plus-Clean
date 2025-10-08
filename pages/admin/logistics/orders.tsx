
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchOrders = async (date: string) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`/api/admin/logistics/orders?date=${date}`);
      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleOptimizeRoutes = async () => {
    try {
      const { data } = await axios.post('/api/admin/logistics/optimize', { date: selectedDate });
      alert(data.message);
      // Optionally, refresh the orders list to show updated route info
      fetchOrders(selectedDate);
    } catch (err) {
      alert('Failed to optimize routes.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Delivery Orders</h1>
        <div>
          <input type="date" value={selectedDate} onChange={handleDateChange} />
          <button onClick={handleOptimizeRoutes} style={{ marginLeft: '1rem' }}>Optimize Routes</button>
        </div>
      </div>

      {isLoading && <p>Loading orders...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.length > 0 ? orders.map(order => (
            <div key={order.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
              <Link href={`/admin/logistics/orders/${order.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h3>Order ID: {order.id}</h3>
                <p>Customer: {order.customerName}</p>
                <p>Address: {order.address.street}, {order.address.city}</p>
                <p>Status: {order.status}</p>
                <p>Priority: {order.priority}</p>
                <p>Route: {order.routeName || 'Not Assigned'}</p>
              </Link>
            </div>
          )) : <p>No orders found for this date.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
