'use client';

// Vehicle Photo Management Page

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';

interface Photo {
  id: string;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

interface Vehicle {
  id: string;
  title: string;
  year: number;
  make: string;
  model: string;
  vin: string;
}

export default function VehiclePhotosPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicle();
    fetchPhotos();
  }, [vehicleId]);

  const fetchVehicle = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setVehicle(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch vehicle:', error);
    }
  };

  const fetchPhotos = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/photos?vehicleId=${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setPhotos(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      
      for (const file of Array.from(files)) {
        // Upload file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('vehicleId', vehicleId);
        
        const uploadResponse = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        
        const uploadData = await uploadResponse.json();
        if (!uploadData.success) {
          throw new Error(uploadData.error || 'Upload failed');
        }

        // Create photo record
        const photoResponse = await fetch('/api/admin/photos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            vehicleId,
            url: uploadData.data.url,
            altText: file.name,
            sortOrder: photos.length,
            isPrimary: photos.length === 0, // First photo is primary
          }),
        });

        const photoData = await photoResponse.json();
        if (!photoData.success) {
          throw new Error(photoData.error || 'Failed to create photo record');
        }
      }

      // Refresh photos
      await fetchPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Update all photos to not primary
      await Promise.all(
        photos.map(photo =>
          fetch(`/api/admin/photos/${photo.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ isPrimary: false }),
          })
        )
      );

      // Set selected photo as primary
      const response = await fetch(`/api/admin/photos/${photoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPrimary: true }),
      });

      if (response.ok) {
        await fetchPhotos();
      }
    } catch (error) {
      console.error('Failed to set primary photo:', error);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/photos/${photoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await fetchPhotos();
      }
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading...</div>
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
            <h1 className="text-3xl font-bold text-white">Manage Photos</h1>
            {vehicle && (
              <p className="text-gray-400 mt-2">
                {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.vin}
              </p>
            )}
          </div>
          <Link
            href="/admin/vehicles"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Vehicles
          </Link>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Upload Photos</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-white font-medium">
                {uploading ? 'Uploading...' : 'Click to upload photos'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                PNG, JPG, GIF up to 10MB each
              </p>
            </label>
          </div>
        </div>

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-white text-lg font-medium mb-2">No Photos Yet</h3>
            <p className="text-gray-400">Upload some photos to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="relative">
                  <img
                    src={photo.url}
                    alt={photo.altText || 'Vehicle photo'}
                    className="w-full h-48 object-cover"
                  />
                  {photo.isPrimary && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Primary
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex gap-2">
                    {!photo.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(photo.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
