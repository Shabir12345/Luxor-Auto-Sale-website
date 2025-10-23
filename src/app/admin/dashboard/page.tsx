'use client';

// Modern Admin Dashboard

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';

interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  pendingVehicles: number;
  soldVehicles: number;
  draftVehicles: number;
  totalValue: number;
  averagePrice: number;
  recentVehicles: any[];
  recentActivity: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch vehicles
      const vehiclesResponse = await fetch('/api/admin/vehicles?perPage=1000', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const vehiclesData = await vehiclesResponse.json();
      
      if (!vehiclesData.success) {
        throw new Error('Failed to fetch vehicles');
      }

      const vehicles = vehiclesData.data.data;
      
      // Calculate stats
      const totalVehicles = vehicles.length;
      const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
      const pendingVehicles = vehicles.filter(v => v.status === 'PENDING').length;
      const soldVehicles = vehicles.filter(v => v.status === 'SOLD').length;
      const draftVehicles = vehicles.filter(v => v.status === 'DRAFT').length;
      
      const totalValue = vehicles.reduce((sum, v) => sum + v.priceCents, 0);
      const averagePrice = totalVehicles > 0 ? totalValue / totalVehicles : 0;
      
      // Recent vehicles (last 5)
      const recentVehicles = vehicles
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      setStats({
        totalVehicles,
        availableVehicles,
        pendingVehicles,
        soldVehicles,
        draftVehicles,
        totalValue,
        averagePrice,
        recentVehicles,
        recentActivity: [], // TODO: Implement activity log
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
          {error}
        </div>
      </AdminLayout>
    );
  }

  if (!stats) return null;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-2">Welcome back! Here's what's happening with your inventory.</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin/vehicles/new"
              className="btn-modern flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Vehicle
            </Link>
            <Link
              href="/admin/vehicles"
              className="btn-outline-modern"
            >
              View All
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Vehicles</p>
                <p className="text-3xl font-bold">{stats.totalVehicles}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Available</p>
                <p className="text-3xl font-bold">{stats.availableVehicles}</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold">{stats.pendingVehicles}</p>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Sold</p>
                <p className="text-3xl font-bold">{stats.soldVehicles}</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Value Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Inventory Value</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-400">{formatPrice(stats.totalValue)}</p>
                <p className="text-gray-400 text-sm">Total value of all vehicles</p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Average Price</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-400">{formatPrice(stats.averagePrice)}</p>
                <p className="text-gray-400 text-sm">Average vehicle price</p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Vehicles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Vehicles</h3>
              <Link href="/admin/vehicles" className="text-blue-400 hover:text-blue-300 text-sm">
                View all
              </Link>
            </div>
            {stats.recentVehicles.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-gray-400">No vehicles yet</p>
                <Link href="/admin/vehicles/new" className="text-blue-400 hover:text-blue-300 text-sm">
                  Add your first vehicle
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{vehicle.title}</p>
                      <p className="text-gray-400 text-sm">{vehicle.year} • {vehicle.make}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-semibold">{formatPrice(vehicle.priceCents)}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        vehicle.status === 'AVAILABLE' ? 'bg-green-500/20 text-green-400' :
                        vehicle.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        vehicle.status === 'SOLD' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {vehicle.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/admin/vehicles/new"
                className="flex items-center gap-3 p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors"
              >
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Add New Vehicle</p>
                  <p className="text-gray-400 text-sm">Create a new vehicle listing</p>
                </div>
              </Link>

              <Link
                href="/admin/vehicles"
                className="flex items-center gap-3 p-3 bg-gray-600/20 hover:bg-gray-600/30 rounded-lg transition-colors"
              >
                <div className="bg-gray-500/20 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Manage Vehicles</p>
                  <p className="text-gray-400 text-sm">View and edit all vehicles</p>
                </div>
              </Link>

              <Link
                href="/"
                className="flex items-center gap-3 p-3 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors"
              >
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">View Website</p>
                  <p className="text-gray-400 text-sm">See how customers see your site</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}