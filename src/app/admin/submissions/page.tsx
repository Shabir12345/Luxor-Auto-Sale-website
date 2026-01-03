'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  vehicleInterest?: string;
  status: string;
  createdAt: string;
}

interface FinancingApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleInterest?: string;
  status: string;
  createdAt: string;
}

interface TradeInRequest {
  id: string;
  vehicle: string;
  mileage: string;
  condition: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function SubmissionsPage() {
  const [activeTab, setActiveTab] = useState<'contact' | 'financing' | 'trade-in'>('contact');
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [financingApplications, setFinancingApplications] = useState<FinancingApplication[]>([]);
  const [tradeInRequests, setTradeInRequests] = useState<TradeInRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch all types of submissions
      const [contactRes, financingRes, tradeInRes] = await Promise.all([
        fetch('/api/admin/contact-submissions', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/financing-applications', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/trade-in-requests', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (contactRes.ok) {
        const contactData = await contactRes.json();
        setContactSubmissions(contactData.data || []);
      }

      if (financingRes.ok) {
        const financingData = await financingRes.json();
        setFinancingApplications(financingData.data || []);
      }

      if (tradeInRes.ok) {
        const tradeInData = await tradeInRes.json();
        setTradeInRequests(tradeInData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (type: string, id: string, status: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/${type}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchSubmissions(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-500';
      case 'CONTACTED': return 'bg-yellow-500';
      case 'IN_PROGRESS': return 'bg-orange-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'ARCHIVED': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-4 text-gray-400 text-lg">Loading submissions...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Form Submissions</h1>
          <div className="text-sm text-gray-400">
            Total: {contactSubmissions.length + financingApplications.length + tradeInRequests.length} submissions
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'contact'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Contact ({contactSubmissions.length})
          </button>
          <button
            onClick={() => setActiveTab('financing')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'financing'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Financing ({financingApplications.length})
          </button>
          <button
            onClick={() => setActiveTab('trade-in')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'trade-in'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Trade-In ({tradeInRequests.length})
          </button>
        </div>

        {/* Contact Submissions */}
        {activeTab === 'contact' && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Contact Form Submissions</h2>
              {contactSubmissions.length === 0 ? (
                <p className="text-gray-400">No contact submissions yet.</p>
              ) : (
                <div className="space-y-4">
                  {contactSubmissions.map((submission) => (
                    <div key={submission.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{submission.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(submission.status)}`}>
                              {submission.status}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{submission.email}</p>
                          {submission.phone && (
                            <p className="text-gray-300 text-sm mb-2">{submission.phone}</p>
                          )}
                          {submission.vehicleInterest && (
                            <p className="text-gray-300 text-sm mb-2">
                              <strong>Vehicle of Interest:</strong> {submission.vehicleInterest}
                            </p>
                          )}
                          <p className="text-gray-300 text-sm mb-3">{submission.message}</p>
                          <p className="text-gray-400 text-xs">
                            {new Date(submission.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={submission.status}
                            onChange={(e) => updateStatus('contact-submissions', submission.id, e.target.value)}
                            className="bg-gray-600 text-white px-2 py-1 rounded text-sm"
                          >
                            <option value="NEW">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Financing Applications */}
        {activeTab === 'financing' && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Financing Applications</h2>
              {financingApplications.length === 0 ? (
                <p className="text-gray-400">No financing applications yet.</p>
              ) : (
                <div className="space-y-4">
                  {financingApplications.map((application) => (
                    <div key={application.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {application.firstName} {application.lastName}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(application.status)}`}>
                              {application.status}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{application.email}</p>
                          <p className="text-gray-300 text-sm mb-2">{application.phone}</p>
                          {application.vehicleInterest && (
                            <p className="text-gray-300 text-sm mb-2">
                              <strong>Vehicle Interest:</strong> {application.vehicleInterest}
                            </p>
                          )}
                          <p className="text-gray-400 text-xs">
                            {new Date(application.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={application.status}
                            onChange={(e) => updateStatus('financing-applications', application.id, e.target.value)}
                            className="bg-gray-600 text-white px-2 py-1 rounded text-sm"
                          >
                            <option value="NEW">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trade-In Requests */}
        {activeTab === 'trade-in' && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Trade-In Requests</h2>
              {tradeInRequests.length === 0 ? (
                <p className="text-gray-400">No trade-in requests yet.</p>
              ) : (
                <div className="space-y-4">
                  {tradeInRequests.map((request) => (
                    <div key={request.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{request.vehicle}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{request.email}</p>
                          <p className="text-gray-300 text-sm mb-2">
                            <strong>Mileage:</strong> {request.mileage}
                          </p>
                          <p className="text-gray-300 text-sm mb-2">
                            <strong>Condition:</strong> {request.condition}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {new Date(request.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={request.status}
                            onChange={(e) => updateStatus('trade-in-requests', request.id, e.target.value)}
                            className="bg-gray-600 text-white px-2 py-1 rounded text-sm"
                          >
                            <option value="NEW">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
