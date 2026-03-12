import React, { useState, useCallback } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Camera, LogIn } from 'lucide-react';
import { fetchAlbums, fetchMediaItems } from '../lib/googlePhotos';
import type { GoogleAlbum, GoogleMediaItem } from '../lib/googlePhotos';
import AlbumGrid from './AlbumGrid';
import PhotoGrid from './PhotoGrid';
import PhotoUpload from './PhotoUpload';

const SCOPES = 'https://www.googleapis.com/auth/photoslibrary.readonly https://www.googleapis.com/auth/photoslibrary.appendonly';

const GooglePhotosView: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [albums, setAlbums] = useState<GoogleAlbum[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<GoogleAlbum | null>(null);
  const [photos, setPhotos] = useState<GoogleMediaItem[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const token = tokenResponse.access_token;
      setAccessToken(token);
      setError(null);
      setLoadingAlbums(true);
      try {
        const data = await fetchAlbums(token);
        setAlbums(data);
      } catch (err) {
        setError('Kunne ikke hente albums. Prøv igen.');
        console.error(err);
      } finally {
        setLoadingAlbums(false);
      }
    },
    onError: () => setError('Login fejlede. Prøv igen.'),
    scope: SCOPES,
  });

  const handleSelectAlbum = useCallback(async (album: GoogleAlbum) => {
    if (!accessToken) return;
    setSelectedAlbum(album);
    setLoadingPhotos(true);
    setError(null);
    try {
      const items = await fetchMediaItems(accessToken, album.id);
      setPhotos(items);
    } catch (err) {
      setError('Kunne ikke hente billeder. Prøv igen.');
      console.error(err);
    } finally {
      setLoadingPhotos(false);
    }
  }, [accessToken]);

  const handleBack = () => {
    setSelectedAlbum(null);
    setPhotos([]);
  };

  const handleUploadComplete = async () => {
    if (!accessToken || !selectedAlbum) return;
    setShowUpload(false);
    setLoadingPhotos(true);
    try {
      const items = await fetchMediaItems(accessToken, selectedAlbum.id);
      setPhotos(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  // Not logged in
  if (!accessToken) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full bg-battle-grey/50 border border-white/10 flex items-center justify-center mb-6">
            <Camera className="w-10 h-10 text-battle-orange" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Google Photos</h2>
          <p className="text-gray-400 text-sm mb-8 text-center max-w-md">
            Log ind med din Google-konto for at se og uploade billeder til dine albums.
          </p>
          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}
          <button
            onClick={() => login()}
            className="flex items-center gap-3 px-6 py-3 bg-white text-gray-800 font-medium rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Log ind med Google
          </button>
        </div>
      </div>
    );
  }

  // Logged in
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {selectedAlbum ? (
        <>
          <PhotoGrid
            photos={photos}
            albumTitle={selectedAlbum.title}
            onBack={handleBack}
            onUpload={() => setShowUpload(true)}
            loading={loadingPhotos}
          />
          {showUpload && (
            <PhotoUpload
              accessToken={accessToken}
              albumId={selectedAlbum.id}
              onUploadComplete={handleUploadComplete}
              onClose={() => setShowUpload(false)}
            />
          )}
        </>
      ) : (
        <>
          <div className="mb-6">
            <h3 className="text-white font-bold text-lg">Dine Albums</h3>
            <p className="text-gray-500 text-xs mt-1">{albums.length} albums</p>
          </div>
          <AlbumGrid
            albums={albums}
            onSelectAlbum={handleSelectAlbum}
            loading={loadingAlbums}
          />
        </>
      )}
    </div>
  );
};

export default GooglePhotosView;
