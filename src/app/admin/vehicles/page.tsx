'use client';

// Admin Vehicles List

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { formatPrice, formatMileage } from '@/utils/formatters';

export default function VehiclesListPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/vehicles?perPage=1000', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setVehicles(data.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextStatus = (currentStatus: string): string => {
    // Cycle through: AVAILABLE -> PENDING -> SOLD -> AVAILABLE
    switch (currentStatus) {
      case 'AVAILABLE':
        return 'PENDING';
      case 'PENDING':
        return 'SOLD';
      case 'SOLD':
        return 'AVAILABLE';
      case 'DRAFT':
        return 'AVAILABLE';
      default:
        return 'AVAILABLE';
    }
  };

  const handleStatusClick = async (vehicleId: string, currentStatus: string) => {
    const newStatus = getNextStatus(currentStatus);
    await handleStatusChange(vehicleId, newStatus);
  };

  const handleStatusChange = async (vehicleId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh list
        fetchVehicles();
      } else {
        const errorData = await response.json();
        console.error('Failed to update status:', errorData.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleFeaturedToggle = async (vehicleId: string, isFeatured: boolean) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });

      if (response.ok) {
        // Refresh list
        fetchVehicles();
      }
    } catch (error) {
      console.error('Failed to update featured status:', error);
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Refresh list
        fetchVehicles();
      }
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-500';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'SOLD':
        return 'bg-blue-500';
      case 'DRAFT':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Vehicles</h1>
          <Link
            href="/admin/vehicles/new"
            className="btn-modern"
          >
            Add New Vehicle
          </Link>
        </div>

        {loading ? (
          <div className="text-white">Loading...</div>
        ) : vehicles.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center text-gray-400">
            No vehicles found. Add your first vehicle!
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Mileage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Featured
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="px-6 py-4 text-white">
                      <div className="font-medium">{vehicle.title}</div>
                      <div className="text-sm text-gray-400">{vehicle.vin}</div>
                    </td>
                    <td className="px-6 py-4 text-white">{vehicle.year}</td>
                    <td className="px-6 py-4 text-white">{formatMileage(vehicle.odometerKm)}</td>
                    <td className="px-6 py-4 text-white">{formatPrice(vehicle.priceCents)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleStatusClick(vehicle.id, vehicle.status)}
                        className={`px-3 py-1 rounded-full text-xs font-medium text-white transition-all hover:opacity-80 hover:scale-105 cursor-pointer ${getStatusColor(
                          vehicle.status
                        )}`}
                        title="Click to change status"
                      >
                        {vehicle.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleFeaturedToggle(vehicle.id, vehicle.isFeatured || false)}
                        className={`px-3 py-1 rounded-full text-xs font-medium text-white transition-colors ${
                          vehicle.isFeatured 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                      >
                        {vehicle.isFeatured ? 'Featured' : 'Not Featured'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/vehicles/${vehicle.id}/photos`}
                          className="text-green-400 hover:text-green-300 text-sm"
                        >
                          Photos
                        </Link>
                        <Link
                          href={`/admin/vehicles/${vehicle.id}/edit`}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

