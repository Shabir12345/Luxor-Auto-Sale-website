'use client';

// Admin Dashboard

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    available: 0,
    pending: 0,
    sold: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch vehicles and calculate stats
      const response = await fetch('/api/vehicles?status=AVAILABLE&perPage=1000');
      const data = await response.json();

      if (data.success) {
        const vehicles = data.data.data;
        const stats = {
          totalVehicles: vehicles.length,
          available: vehicles.filter((v: any) => v.status === 'AVAILABLE').length,
          pending: vehicles.filter((v: any) => v.status === 'PENDING').length,
          sold: vehicles.filter((v: any) => v.status === 'SOLD').length,
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

        {loading ? (
          <div className="text-white">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-gray-400 text-sm mb-2">Total Vehicles</div>
              <div className="text-3xl font-bold text-white">{stats.totalVehicles}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-gray-400 text-sm mb-2">Available</div>
              <div className="text-3xl font-bold text-green-500">{stats.available}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-gray-400 text-sm mb-2">Pending</div>
              <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-gray-400 text-sm mb-2">Sold</div>
              <div className="text-3xl font-bold text-blue-500">{stats.sold}</div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <a
              href="/admin/vehicles/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Add New Vehicle
            </a>
            <a
              href="/admin/vehicles"
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Manage Vehicles
            </a>
            <a
              href="/"
              target="_blank"
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              View Public Site
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

