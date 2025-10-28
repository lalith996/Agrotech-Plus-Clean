
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Alert } from '@/components/ui/alert';

interface Farmer {
  id: string;
  farmName: string;
  location: string;
  phone?: string;
  isApproved: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  _count: {
    products: number;
  };
}

interface FarmerScore {
  score: number;
  factors: Array<{
    name: string;
    score: number;
    weight: number;
    details: string;
  }>;
  recommendation: 'approve' | 'review' | 'reject';
  usedFallback: boolean;
}

const AdminFarmersPage = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('all'); // 'all', 'pending', 'approved'
  const [search, setSearch] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [farmerScores, setFarmerScores] = useState<Record<string, FarmerScore>>({});
  const [loadingScores, setLoadingScores] = useState<Record<string, boolean>>({});
  const [expandedFactors, setExpandedFactors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchFarmers = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (status !== 'all') params.append('status', status);
        if (search) params.append('search', search);

        const { data } = await axios.get(`/api/admin/farmers?${params.toString()}`);
        const fetchedFarmers = data.farmers;
        setFarmers(fetchedFarmers);

        // Fetch scores for pending farmers
        fetchedFarmers.forEach((farmer: Farmer) => {
          if (!farmer.isApproved) {
            fetchFarmerScore(farmer.id);
          }
        });
      } catch (err) {
        setError('Failed to load farmers.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search input
    const timer = setTimeout(() => {
      fetchFarmers();
    }, 500);

    return () => clearTimeout(timer);
  }, [status, search]);

  const fetchFarmerScore = async (farmerId: string) => {
    // Skip if already loading or loaded
    if (loadingScores[farmerId] || farmerScores[farmerId]) {
      return;
    }

    setLoadingScores(prev => ({ ...prev, [farmerId]: true }));

    try {
      const { data } = await axios.post<FarmerScore>('/api/admin/farmers/score', {
        farmerId
      });
      setFarmerScores(prev => ({ ...prev, [farmerId]: data }));
    } catch (err) {
      console.error(`Failed to fetch score for farmer ${farmerId}:`, err);
      // Don't show error to user, just log it
    } finally {
      setLoadingScores(prev => ({ ...prev, [farmerId]: false }));
    }
  };

  const toggleFactors = (farmerId: string) => {
    setExpandedFactors(prev => ({ ...prev, [farmerId]: !prev[farmerId] }));
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 70) return { bg: '#d1fae5', color: '#065f46', border: '#10b981' };
    if (score >= 50) return { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' };
    return { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' };
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'approve': return '✓ Recommend Approve';
      case 'review': return '⚠ Needs Review';
      case 'reject': return '✗ Recommend Reject';
      default: return recommendation;
    }
  };

  // Sort farmers by score (lowest first for review priority)
  const sortedFarmers = [...farmers].sort((a, b) => {
    // Approved farmers go to the end
    if (a.isApproved && !b.isApproved) return 1;
    if (!a.isApproved && b.isApproved) return -1;
    
    // For pending farmers, sort by score (lowest first)
    if (!a.isApproved && !b.isApproved) {
      const scoreA = farmerScores[a.id]?.score ?? 100;
      const scoreB = farmerScores[b.id]?.score ?? 100;
      return scoreA - scoreB;
    }
    
    return 0;
  });

  const handleApproveFarmer = async (farmerId: string) => {
    setActionLoading(farmerId);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data } = await axios.post(`/api/admin/farmers/${farmerId}/approve`);
      setSuccessMessage(data.message || 'Farmer approved successfully!');
      
      // Update farmer in local state
      setFarmers(prev => 
        prev.map(f => f.id === farmerId ? { ...f, isApproved: true } : f)
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve farmer');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectFarmer = async (farmerId: string) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setActionLoading(farmerId);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data } = await axios.post(`/api/admin/farmers/${farmerId}/reject`, {
        reason: rejectionReason
      });
      setSuccessMessage(data.message || 'Farmer application rejected');
      
      // Keep farmer in list but ensure isApproved is false
      setFarmers(prev => 
        prev.map(f => f.id === farmerId ? { ...f, isApproved: false } : f)
      );
      
      // Close modal and reset reason
      setShowRejectModal(null);
      setRejectionReason('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject farmer');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (farmerId: string) => {
    setShowRejectModal(farmerId);
    setRejectionReason('');
    setError(null);
  };

  const closeRejectModal = () => {
    setShowRejectModal(null);
    setRejectionReason('');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Farmer Management</h1>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert style={{ marginBottom: '1rem', backgroundColor: '#d1fae5', borderColor: '#10b981', color: '#065f46' }}>
          {successMessage}
        </Alert>
      )}
      {error && (
        <Alert style={{ marginBottom: '1rem', backgroundColor: '#fee2e2', borderColor: '#ef4444', color: '#991b1b' }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Search by name, email, location..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={{ 
            flexGrow: 1, 
            padding: '10px 12px', 
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
        <select 
          value={status} 
          onChange={e => setStatus(e.target.value)} 
          style={{ 
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            minWidth: '150px'
          }}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {/* Farmer List */}
      {isLoading && <p>Loading farmers...</p>}
      {!isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sortedFarmers.length > 0 ? sortedFarmers.map(farmer => (
            <div 
              key={farmer.id} 
              style={{ 
                border: '1px solid #e5e7eb', 
                padding: '1.5rem', 
                borderRadius: '8px',
                backgroundColor: farmer.isApproved ? '#ffffff' : '#fffbeb',
                borderLeft: farmer.isApproved ? '4px solid #10b981' : '4px solid #f59e0b'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                {/* Farmer Info */}
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '18px', color: '#111827' }}>
                    {farmer.farmName}
                  </h3>
                  <p style={{ margin: '0.25rem 0', color: '#6b7280', fontSize: '14px' }}>
                    <strong>Owner:</strong> {farmer.user.name}
                  </p>
                  <p style={{ margin: '0.25rem 0', color: '#6b7280', fontSize: '14px' }}>
                    <strong>Email:</strong> {farmer.user.email}
                  </p>
                  <p style={{ margin: '0.25rem 0', color: '#6b7280', fontSize: '14px' }}>
                    <strong>Location:</strong> {farmer.location}
                  </p>
                  {farmer.phone && (
                    <p style={{ margin: '0.25rem 0', color: '#6b7280', fontSize: '14px' }}>
                      <strong>Phone:</strong> {farmer.phone}
                    </p>
                  )}
                </div>

                {/* Status & Stats */}
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px' }}>Status:</strong>
                    <span 
                      style={{ 
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '600',
                        backgroundColor: farmer.isApproved ? '#d1fae5' : '#fef3c7',
                        color: farmer.isApproved ? '#065f46' : '#92400e'
                      }}
                    >
                      {farmer.isApproved ? '✓ Approved' : '⏳ Pending'}
                    </span>
                  </div>

                  {/* Approval Score - only for pending farmers */}
                  {!farmer.isApproved && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px' }}>
                        Approval Score:
                      </strong>
                      {loadingScores[farmer.id] ? (
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>Loading...</span>
                      ) : farmerScores[farmer.id] ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span 
                              style={{ 
                                display: 'inline-block',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '700',
                                ...getScoreBadgeColor(farmerScores[farmer.id].score),
                                border: `2px solid ${getScoreBadgeColor(farmerScores[farmer.id].score).border}`
                              }}
                            >
                              {farmerScores[farmer.id].score}/100
                            </span>
                            <button
                              onClick={() => toggleFactors(farmer.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#3b82f6',
                                cursor: 'pointer',
                                fontSize: '12px',
                                textDecoration: 'underline',
                                padding: 0
                              }}
                            >
                              {expandedFactors[farmer.id] ? 'Hide details' : 'Show details'}
                            </button>
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '0.25rem' }}>
                            {getRecommendationText(farmerScores[farmer.id].recommendation)}
                          </div>
                          {farmerScores[farmer.id].usedFallback && (
                            <div style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic' }}>
                              (Rule-based scoring)
                            </div>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>Score unavailable</span>
                      )}
                    </div>
                  )}

                  <p style={{ margin: '0.25rem 0', color: '#6b7280', fontSize: '14px' }}>
                    <strong>Products:</strong> {farmer._count.products}
                  </p>
                  <p style={{ margin: '0.25rem 0', color: '#6b7280', fontSize: '14px' }}>
                    <strong>Registered:</strong> {new Date(farmer.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                  {!farmer.isApproved && (
                    <>
                      <button
                        onClick={() => handleApproveFarmer(farmer.id)}
                        disabled={actionLoading === farmer.id}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: actionLoading === farmer.id ? '#9ca3af' : '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: actionLoading === farmer.id ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        {actionLoading === farmer.id ? 'Processing...' : '✓ Approve'}
                      </button>
                      <button
                        onClick={() => openRejectModal(farmer.id)}
                        disabled={actionLoading === farmer.id}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: actionLoading === farmer.id ? '#9ca3af' : '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: actionLoading === farmer.id ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        {actionLoading === farmer.id ? 'Processing...' : '✗ Reject'}
                      </button>
                    </>
                  )}
                  <Link 
                    href={`/admin/farmers/${farmer.id}`}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      textAlign: 'center',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    View Details
                  </Link>
                </div>
              </div>

              {/* Expanded Score Factors */}
              {!farmer.isApproved && expandedFactors[farmer.id] && farmerScores[farmer.id] && (
                <div 
                  style={{ 
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Score Breakdown
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
                    {farmerScores[farmer.id].factors.map((factor, idx) => (
                      <div 
                        key={idx}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: 'white',
                          borderRadius: '4px',
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                            {factor.name}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#3b82f6' }}>
                            {factor.score}/{Math.round(factor.weight * 100)}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {factor.details}
                        </div>
                        <div style={{ marginTop: '0.5rem', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              height: '100%', 
                              width: `${(factor.score / (factor.weight * 100)) * 100}%`,
                              backgroundColor: factor.score >= factor.weight * 70 ? '#10b981' : factor.score >= factor.weight * 50 ? '#f59e0b' : '#ef4444',
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )) : (
            <div style={{ 
              padding: '3rem', 
              textAlign: 'center', 
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                No farmers found with the current filters.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={closeRejectModal}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Reject Farmer Application</h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Please provide a reason for rejecting this application. This will be sent to the farmer.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '1rem',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={closeRejectModal}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectFarmer(showRejectModal)}
                disabled={!rejectionReason.trim() || actionLoading === showRejectModal}
                style={{
                  padding: '8px 16px',
                  backgroundColor: !rejectionReason.trim() || actionLoading === showRejectModal ? '#9ca3af' : '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: !rejectionReason.trim() || actionLoading === showRejectModal ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {actionLoading === showRejectModal ? 'Rejecting...' : 'Reject Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFarmersPage;
