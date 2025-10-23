'use client';

// Edit Vehicle Page

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import VehicleForm from '@/components/VehicleForm';
import Link from 'next/link';

export default function EditVehiclePage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;
  
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicle();
  }, [vehicleId]);

  const fetchVehicle = async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('Fetching vehicle:', vehicleId, 'with token:', token ? 'present' : 'missing');
      
      const response = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setVehicle(data.data);
      } else {
        setError(data.error || 'Failed to load vehicle');
      }
    } catch (error) {
      console.error('Failed to fetch vehicle:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading vehicle...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
            {error}
          </div>
          <Link
            href="/admin/vehicles"
            className="btn-outline-modern"
          >
            Back to Vehicles
          </Link>
        </div>
      </AdminLayout>
    );
  }

  if (!vehicle) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-500/10 border border-gray-500 text-gray-500 px-4 py-3 rounded mb-6">
            Vehicle not found
          </div>
          <Link
            href="/admin/vehicles"
            className="btn-outline-modern"
          >
            Back to Vehicles
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Vehicle</h1>
            <p className="text-gray-400 mt-2">
              {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.vin}
            </p>
          </div>
          <Link
            href="/admin/vehicles"
            className="btn-outline-modern"
          >
            Back to Vehicles
          </Link>
        </div>

        {/* Vehicle Form */}
        <VehicleForm vehicle={vehicle} isEdit={true} />
      </div>
    </AdminLayout>
  );
}
