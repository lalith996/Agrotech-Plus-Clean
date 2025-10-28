import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Order } from '@prisma/client';

const Map = dynamic(() => import('@/components/map'), { ssr: false });

const AdminRoutes = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchOrdersForDate = async (date: string) => {
    try {
      const response = await fetch(`/api/orders?status=PENDING`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('An error occurred while fetching orders', error);
    }
  };

  useEffect(() => {
    fetchOrdersForDate(selectedDate);
  }, [selectedDate]);

  // Placeholder geocoding to visualize orders
  const getCoordinates = (address: { city: string; street: string }) => {
    if (!address) return null;
    const lat = -3.745 + (address.city.length % 10) * 0.01;
    const lng = -38.523 + (address.street.length % 10) * 0.01;
    return { lat, lng };
  };

  const routeStops = useMemo(() => {
    // Build a single demo route from orders
    return orders
      .map((order) => getCoordinates({ city: 'Demo', street: 'Demo' }))
      .filter((c): c is { lat: number; lng: number } => !!c)
      .map((c, idx) => ({ lat: c.lat, lng: c.lng, label: String(idx + 1) }));
  }, [orders]);

  const center = useMemo(() => {
    return routeStops.length > 0 ? { lat: routeStops[0].lat, lng: routeStops[0].lng } : { lat: -3.745, lng: -38.523 };
  }, [routeStops]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Delivery Routes</h1>
      <label htmlFor="route-date" className="text-sm text-gray-600">Route Date</label>
      <input
        id="route-date"
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="border rounded p-2 ml-2"
      />

      <div className="mt-4 w-full h-[700px]">
        <Map
          center={center}
          zoom={12}
          routes={[{ vehicleId: 'demo-vehicle', stops: routeStops, color: '#1a73e8' }]}
          showTraffic
        />
      </div>
    </div>
  );
};

export default AdminRoutes;
