'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Photo {
  id: string;
  url: string;
  altText?: string;
}

interface VehicleImageGalleryProps {
  photos: Photo[];
  vehicleTitle: string;
}

export default function VehicleImageGallery({ photos, vehicleTitle }: VehicleImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!photos || photos.length === 0) {
    return (
      <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center">
        <span className="text-gray-500 text-6xl">🚗</span>
      </div>
    );
  }

  const currentPhoto = photos[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % photos.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group">
        <div className="relative h-96 bg-gray-800 rounded-lg overflow-hidden">
          <Image
            src={currentPhoto.url}
            alt={currentPhoto.altText || vehicleTitle}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
          
          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="View fullscreen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          {/* Image Counter */}
          {photos.length > 1 && (
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {photos.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {photos.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {photos.slice(0, 8).map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => goToImage(index)}
              className={`relative h-20 bg-gray-800 rounded overflow-hidden transition-all duration-300 ${
                index === currentImageIndex
                  ? 'ring-2 ring-blue-500 scale-105'
                  : 'hover:scale-105 hover:ring-1 hover:ring-gray-400'
              }`}
            >
              <Image
                src={photo.url}
                alt={photo.altText || `${vehicleTitle} - Image ${index + 1}`}
                fill
                className="object-cover"
              />
              {index === currentImageIndex && (
                <div className="absolute inset-0 bg-blue-500/20" />
              )}
            </button>
          ))}
          {photos.length > 8 && (
            <div className="relative h-20 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-gray-400 text-sm">+{photos.length - 8}</span>
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full">
            <Image
              src={currentPhoto.url}
              alt={currentPhoto.altText || vehicleTitle}
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300"
              aria-label="Close fullscreen"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Fullscreen Navigation */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300"
                  aria-label="Previous image"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300"
                  aria-label="Next image"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Fullscreen Thumbnails */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => goToImage(index)}
                      className={`relative w-16 h-12 rounded overflow-hidden transition-all duration-300 ${
                        index === currentImageIndex
                          ? 'ring-2 ring-blue-500'
                          : 'hover:ring-1 hover:ring-gray-400'
                      }`}
                    >
                      <Image
                        src={photo.url}
                        alt={photo.altText || `${vehicleTitle} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
