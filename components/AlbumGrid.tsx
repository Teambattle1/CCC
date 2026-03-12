import React from 'react';
import { FolderOpen, Image } from 'lucide-react';
import type { GoogleAlbum } from '../lib/googlePhotos';

interface AlbumGridProps {
  albums: GoogleAlbum[];
  onSelectAlbum: (album: GoogleAlbum) => void;
  loading: boolean;
}

const AlbumGrid: React.FC<AlbumGridProps> = ({ albums, onSelectAlbum, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 tablet-portrait:grid-cols-3 tablet-landscape:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-battle-grey/50 rounded-xl border border-white/10 overflow-hidden animate-pulse">
            <div className="aspect-square bg-white/5" />
            <div className="p-3">
              <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <FolderOpen className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">Ingen albums fundet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 tablet-portrait:grid-cols-3 tablet-landscape:grid-cols-4 gap-4">
      {albums.map((album) => (
        <button
          key={album.id}
          onClick={() => onSelectAlbum(album)}
          className="bg-battle-grey/50 rounded-xl border border-white/10 overflow-hidden text-left transition-all hover:border-battle-orange/50 hover:shadow-neon group"
        >
          <div className="aspect-square bg-white/5 relative overflow-hidden">
            {album.coverPhotoBaseUrl ? (
              <img
                src={`${album.coverPhotoBaseUrl}=w400-h400-c`}
                alt={album.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FolderOpen className="w-12 h-12 text-gray-600" />
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="text-white font-medium text-sm truncate">{album.title}</h3>
            <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
              <Image className="w-3 h-3" />
              {album.mediaItemsCount || '0'} billeder
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default AlbumGrid;
