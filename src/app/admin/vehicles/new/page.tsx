'use client';

// New Vehicle Page

import AdminLayout from '@/components/AdminLayout';
import VehicleForm from '@/components/VehicleForm';

export default function NewVehiclePage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Add New Vehicle</h1>
        <VehicleForm />
      </div>
    </AdminLayout>
  );
}

