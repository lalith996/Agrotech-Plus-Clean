
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { UserRole } from '@prisma/client';

const AdminUserDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>();

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`/api/admin/users/${id}`);
        setUser(data.user);
        setSelectedRole(data.user.role);
      } catch (err) {
        setError('Failed to load user details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleRoleChange = async () => {
    if (!selectedRole) return;
    setIsUpdating(true);
    try {
      const { data } = await axios.put(`/api/admin/users/${id}`, { role: selectedRole });
      setUser(data.user);
      alert(data.message);
    } catch (err) {
      alert('Failed to update user role.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <p>Loading user details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!user) return <p>User not found.</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Member Since: {new Date(user.createdAt).toLocaleDateString()}</p>

      {/* Role Management */}
      <div style={{ margin: '2rem 0' }}>
        <h2>User Role</h2>
        <select value={selectedRole} onChange={e => setSelectedRole(e.target.value as UserRole)} style={{ padding: '8px', marginRight: '1rem' }}>
          {Object.values(UserRole).map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        <button onClick={handleRoleChange} disabled={isUpdating || user.role === selectedRole}>
          {isUpdating ? 'Updating...' : 'Save Role'}
        </button>
      </div>

      {/* Associated Data */}
      {user.customer && (
        <div>
          <h2>Customer Details</h2>
          <p>Total Orders: {user.customer.orders.length}</p>
          <p>Active Subscriptions: {user.customer.subscriptions.filter((s:any) => s.status === 'ACTIVE').length}</p>
        </div>
      )}

      {user.farmer && (
        <div>
          <h2>Farmer Details</h2>
          <p>Farm Name: {user.farmer.farmName}</p>
          <p>Total Products: {user.farmer.products.length}</p>
          <p>Status: {user.farmer.isApproved ? 'Approved' : 'Pending Approval'}</p>
        </div>
      )}

    </div>
  );
};

export default AdminUserDetailPage;
