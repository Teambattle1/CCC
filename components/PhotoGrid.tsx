import React, { useState } from 'react';
import { ArrowLeft, Upload, X, Image, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GoogleMediaItem } from '../lib/googlePhotos';

interface PhotoGridProps {
  photos: GoogleMediaItem[];
  albumTitle: string;
  onBack: () => void;
  onUpload: () => void;
  loading: boolean;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, albumTitle, onBack, onUpload, loading }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = () => {
    if (lightboxIndex !== null && lightboxIndex < photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const goPrev = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-battle-grey/50 border border-white/10 text-gray-400 hover:text-white hover:border-battle-orange/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-white font-bold text-lg">{albumTitle}</h3>
            <p className="text-gray-500 text-xs">{photos.length} billeder</p>
          </div>
        </div>
        <button
          onClick={onUpload}
          className="flex items-center gap-2 px-4 py-2 bg-battle-orange hover:bg-battle-orangeLight text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-3 tablet-portrait:grid-cols-4 tablet-landscape:grid-cols-5 gap-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="aspect-square bg-battle-grey/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Image className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg">Ingen billeder i dette album</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 tablet-portrait:grid-cols-4 tablet-landscape:grid-cols-5 gap-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => openLightbox(index)}
              className="aspect-square rounded-lg overflow-hidden bg-battle-grey/50 group"
            >
              <img
                src={`${photo.baseUrl}=w300-h300-c`}
                alt={photo.filename}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 p-2 text-white/70 hover:text-white bg-white/10 rounded-full transition-colors z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {lightboxIndex < photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 p-2 text-white/70 hover:text-white bg-white/10 rounded-full transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <img
            src={`${photos[lightboxIndex].baseUrl}=w1600-h1200`}
            alt={photos[lightboxIndex].filename}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 text-white/50 text-sm">
            {photos[lightboxIndex].filename} — {lightboxIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGrid;
