'use client';

// Vehicle Form Component (Create/Edit)

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type VehicleFormProps = {
  vehicle?: any;
  isEdit?: boolean;
};

export default function VehicleForm({ vehicle, isEdit = false }: VehicleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    vin: vehicle?.vin || '',
    stockNumber: vehicle?.stockNumber || '',
    year: vehicle?.year || new Date().getFullYear(),
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    trim: vehicle?.trim || '',
    bodyType: vehicle?.bodyType || '',
    drivetrain: vehicle?.drivetrain || '',
    fuelType: vehicle?.fuelType || '',
    transmission: vehicle?.transmission || '',
    engine: vehicle?.engine || '',
    cylinders: vehicle?.cylinders || '',
    odometerKm: vehicle?.odometerKm || '',
    priceCents: vehicle?.priceCents ? vehicle.priceCents / 100 : '',
    status: vehicle?.status || 'DRAFT',
    exteriorColor: vehicle?.exteriorColor || '',
    interiorColor: vehicle?.interiorColor || '',
    title: vehicle?.title || '',
    description: vehicle?.description || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      
      // Convert price to cents and clean up empty strings
      const data: any = {
        vin: formData.vin,
        year: parseInt(formData.year as any),
        make: formData.make,
        model: formData.model,
        title: formData.title,
        odometerKm: parseInt(formData.odometerKm as any),
        priceCents: Math.round(parseFloat(formData.priceCents as any) * 100),
        status: formData.status,
      };

      // Only include optional fields if they have values
      if (formData.stockNumber) data.stockNumber = formData.stockNumber;
      if (formData.trim) data.trim = formData.trim;
      if (formData.bodyType) data.bodyType = formData.bodyType;
      if (formData.drivetrain) data.drivetrain = formData.drivetrain;
      if (formData.fuelType) data.fuelType = formData.fuelType;
      if (formData.transmission) data.transmission = formData.transmission;
      if (formData.engine) data.engine = formData.engine;
      if (formData.cylinders) data.cylinders = parseInt(formData.cylinders as any);
      if (formData.exteriorColor) data.exteriorColor = formData.exteriorColor;
      if (formData.interiorColor) data.interiorColor = formData.interiorColor;
      if (formData.description) data.description = formData.description;

      const url = isEdit ? `/api/admin/vehicles/${vehicle.id}` : '/api/admin/vehicles';
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/admin/vehicles');
      } else {
        setError(result.error || 'Failed to save vehicle');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              VIN <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vin"
              value={formData.vin}
              onChange={handleChange}
              required
              maxLength={17}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Stock Number</label>
            <input
              type="text"
              name="stockNumber"
              value={formData.stockNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Year <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              min="1900"
              max={new Date().getFullYear() + 2}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Make <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="make"
              value={formData.make}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Trim</label>
            <input
              type="text"
              name="trim"
              value={formData.trim}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Technical Specs */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Technical Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Body Type</label>
            <select
              name="bodyType"
              value={formData.bodyType}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              <option value="SEDAN">Sedan</option>
              <option value="COUPE">Coupe</option>
              <option value="HATCHBACK">Hatchback</option>
              <option value="WAGON">Wagon</option>
              <option value="SUV">SUV</option>
              <option value="TRUCK">Truck</option>
              <option value="VAN">Van</option>
              <option value="CONVERTIBLE">Convertible</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Drivetrain</label>
            <select
              name="drivetrain"
              value={formData.drivetrain}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              <option value="FWD">Front-Wheel Drive</option>
              <option value="RWD">Rear-Wheel Drive</option>
              <option value="AWD">All-Wheel Drive</option>
              <option value="FOUR_WD">4-Wheel Drive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Fuel Type</label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              <option value="GASOLINE">Gasoline</option>
              <option value="DIESEL">Diesel</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ELECTRIC">Electric</option>
              <option value="PLUG_IN_HYBRID">Plug-in Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Transmission</label>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              <option value="AUTOMATIC">Automatic</option>
              <option value="MANUAL">Manual</option>
              <option value="CVT">CVT</option>
              <option value="DCT">Dual-Clutch</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Engine</label>
            <input
              type="text"
              name="engine"
              value={formData.engine}
              onChange={handleChange}
              placeholder="e.g., 2.0L I4"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Cylinders</label>
            <input
              type="number"
              name="cylinders"
              value={formData.cylinders}
              onChange={handleChange}
              min="2"
              max="16"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Pricing & Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Pricing & Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Odometer (km) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="odometerKm"
              value={formData.odometerKm}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="priceCents"
              value={formData.priceCents}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="DRAFT">Draft</option>
              <option value="AVAILABLE">Available</option>
              <option value="PENDING">Pending</option>
              <option value="SOLD">Sold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Exterior Color</label>
            <input
              type="text"
              name="exteriorColor"
              value={formData.exteriorColor}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Interior Color</label>
            <input
              type="text"
              name="interiorColor"
              value={formData.interiorColor}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Description</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., 2020 Honda Civic LX"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Image Upload - Simplified for MVP */}
      {vehicle?.id && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Vehicle Images</h3>
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Vehicle images can be added after creating the vehicle. Visit the vehicle details page to upload photos.
            </p>
            <button
              type="button"
              onClick={() => router.push(`/admin/vehicles/${vehicle.id}`)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Manage Photos
            </button>
          </div>
        </div>
      )}

      {!vehicle?.id && (
        <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-lg font-semibold text-blue-300 mb-2">Add Images After Creating Vehicle</h4>
              <p className="text-sm text-gray-300">
                Save the vehicle first, then you'll be able to upload images from the vehicle details page.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Vehicle' : 'Create Vehicle'}
        </button>
      </div>
    </form>
  );
}

