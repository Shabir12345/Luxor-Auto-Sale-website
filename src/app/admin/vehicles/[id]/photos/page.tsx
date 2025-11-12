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
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
    currentFileName: '',
  });
  const [deletingAll, setDeletingAll] = useState(false);

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

    const fileArray = Array.from(files);
    
    // Client-side validation before upload
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
    const maxSize = 20 * 1024 * 1024; // 20MB
    const minSize = 100; // 100 bytes minimum
    
    for (const file of fileArray) {
      const fileName = file.name.toLowerCase();
      const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
      
      if (!hasValidExtension) {
        setError(
          `Invalid file type: ${file.name}. ` +
          `Please upload JPEG, PNG, WebP, or HEIC images only. ` +
          `If you selected a Live Photo, choose the still photo instead of the video clip.`
        );
        return;
      }
      
      if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        setError(`File too large: ${file.name} (${sizeMB}MB). Maximum size is 20MB.`);
        return;
      }
      
      if (file.size < minSize) {
        setError(`File appears to be empty or corrupted: ${file.name}. Please select a valid image file.`);
        return;
      }
    }
    
    setUploading(true);
    setError('');
    setSuccessMessage('');
    setUploadProgress({
      current: 0,
      total: fileArray.length,
      currentFileName: '',
    });

    const successfulUploads: string[] = [];
    let uploadError: Error | null = null;

    try {
      const token = localStorage.getItem('authToken');
      let photoCount = photos.length;
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        
        // Update progress - starting upload
        setUploadProgress({
          current: i,
          total: fileArray.length,
          currentFileName: file.name,
        });

        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('vehicleId', vehicleId);

          const uploadResponse = await fetch('/api/admin/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });

          if (!uploadResponse.ok) {
            let errorMessage = `Upload failed with status ${uploadResponse.status} (File: ${file.name})`;
            try {
              const errorData = await uploadResponse.json();
              if (errorData?.error) {
                errorMessage = `${errorData.error} (File: ${file.name})`;
              }
            } catch {
              // ignore JSON parse errors and fall back to default message
            }
            throw new Error(errorMessage);
          }

          const uploadData = await uploadResponse.json();
          if (!uploadData.success) {
            const errorMsg = uploadData.error || 'Upload failed';
            throw new Error(`${errorMsg} (File: ${file.name})`);
          }

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
              sortOrder: photoCount + successfulUploads.length,
              isPrimary: photoCount === 0 && successfulUploads.length === 0,
            }),
          });

          if (!photoResponse.ok) {
            let errorMessage = `Failed to create photo record (status: ${photoResponse.status})`;
            try {
              const errorData = await photoResponse.json();
              if (errorData?.error) {
                errorMessage = errorData.error;
              }
            } catch {
              // ignore JSON parse errors
            }
            console.warn('Photo record creation failed for uploaded file:', uploadData.data.url);
            throw new Error(`${errorMessage} (File: ${file.name})`);
          }

          const photoData = await photoResponse.json();
          if (!photoData.success) {
            throw new Error(`${photoData.error || 'Failed to create photo record'} (File: ${file.name})`);
          }

          successfulUploads.push(file.name);

          setUploadProgress({
            current: i + 1,
            total: fileArray.length,
            currentFileName: file.name,
          });
        } catch (loopError) {
          uploadError = loopError instanceof Error ? loopError : new Error('Upload failed');
          break;
        }
      }

      if (successfulUploads.length > 0) {
        await fetchPhotos();
        const pluralized = successfulUploads.length === 1 ? 'photo' : 'photos';
        setSuccessMessage(
          uploadError
            ? `Uploaded ${successfulUploads.length} ${pluralized}, but encountered an error on a later file.`
            : `Successfully uploaded ${successfulUploads.length} ${pluralized}.`
        );
      }

      if (uploadError) {
        let errorMessage = uploadError.message || 'Upload failed';
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        }
        if (successfulUploads.length > 0) {
          const pluralized = successfulUploads.length === 1 ? 'photo' : 'photos';
          errorMessage += ` ${successfulUploads.length} ${pluralized} uploaded successfully before the error.`;
        }
        if (errorMessage.includes('pattern') || errorMessage.includes('match')) {
          errorMessage = 'File validation failed. Please ensure you are uploading JPEG, PNG, WebP, or HEIC images.';
        }
        setError(errorMessage);
      }

      if (!uploadError && successfulUploads.length === 0) {
        setSuccessMessage('No photos were uploaded.');
      }
    } catch (err) {
      let errorMessage = 'Upload failed';
      if (err instanceof Error) {
        errorMessage = err.message;
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        }
        if (err.message.includes('pattern') || err.message.includes('match')) {
          errorMessage = 'File validation failed. Please ensure you are uploading JPEG, PNG, WebP, or HEIC images.';
        }
      }
      setError(errorMessage);
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadProgress({
          current: 0,
          total: 0,
          currentFileName: '',
        });
      }, 500);

      const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Set selected photo as primary (backend will handle unsetting others)
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

  const handleDeleteAllPhotos = async () => {
    if (photos.length === 0) return;

    const message = `Are you sure you want to delete ALL ${photos.length} ${photos.length === 1 ? 'photo' : 'photos'} for this vehicle?\n\nThis action cannot be undone.`;
    if (!confirm(message)) return;

    setDeletingAll(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/photos?vehicleId=${vehicleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        await fetchPhotos();
      } else {
        setError(data.error || 'Failed to delete all photos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete all photos');
    } finally {
      setDeletingAll(false);
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
          <div className="flex gap-3">
            {photos.length > 0 && (
              <button
                onClick={handleDeleteAllPhotos}
                disabled={deletingAll || uploading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
              >
                {deletingAll ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete All Photos
                  </>
                )}
              </button>
            )}
            <Link
              href="/admin/vehicles"
              className="btn-outline-modern"
            >
              Back to Vehicles
            </Link>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Upload Photos</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}

          {/* Progress Indicator */}
          {uploading && uploadProgress.total > 0 && (
            <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-6 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {uploadProgress.current === uploadProgress.total 
                      ? `Completed ${uploadProgress.total} ${uploadProgress.total === 1 ? 'photo' : 'photos'}`
                      : `Uploading photo ${uploadProgress.current + 1} of ${uploadProgress.total}`}
                  </p>
                  {uploadProgress.currentFileName && uploadProgress.current < uploadProgress.total && (
                    <p className="text-gray-400 text-sm mt-1 truncate">
                      {uploadProgress.currentFileName}
                    </p>
                  )}
                </div>
                <div className="text-white font-medium ml-4">
                  {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${Math.min((uploadProgress.current / uploadProgress.total) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
              onChange={(e) => {
                handleFileUpload(e);
                // Reset input to allow re-uploading the same file
                e.target.value = '';
              }}
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
                JPEG, PNG, WebP, HEIC up to 20MB each
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Live Photos are supported automatically (select the still photo when prompted)
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
                        className="flex-1 btn-modern text-sm"
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
