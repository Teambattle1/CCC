import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { uploadPhoto } from '../lib/googlePhotos';

interface PhotoUploadProps {
  accessToken: string;
  albumId: string;
  onUploadComplete: () => void;
  onClose: () => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ accessToken, albumId, onUploadComplete, onClose }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, 'pending' | 'uploading' | 'done' | 'error'>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    const newProgress: Record<string, 'pending' | 'uploading' | 'done' | 'error'> = {};
    files.forEach((f) => { newProgress[f.name] = 'pending'; });
    setProgress(newProgress);

    for (const file of files) {
      setProgress((prev) => ({ ...prev, [file.name]: 'uploading' }));
      try {
        await uploadPhoto(accessToken, file, albumId);
        setProgress((prev) => ({ ...prev, [file.name]: 'done' }));
      } catch {
        setProgress((prev) => ({ ...prev, [file.name]: 'error' }));
      }
    }

    setUploading(false);
    onUploadComplete();
  };

  const doneCount = Object.values(progress).filter((s) => s === 'done').length;
  const allDone = doneCount === files.length && files.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-battle-dark rounded-2xl border border-white/10 w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-bold">Upload billeder</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Drop zone */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center gap-3 text-gray-400 hover:border-battle-orange/50 hover:text-battle-orange transition-colors mb-4"
          >
            <Upload className="w-8 h-8" />
            <span className="text-sm">Klik for at vælge billeder</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, i) => (
                <div key={`${file.name}-${i}`} className="flex items-center gap-3 bg-battle-grey/50 rounded-lg p-2">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{file.name}</p>
                    <p className="text-gray-500 text-xs">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  {progress[file.name] === 'uploading' && <Loader className="w-4 h-4 text-battle-orange animate-spin" />}
                  {progress[file.name] === 'done' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {progress[file.name] === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                  {!uploading && (
                    <button onClick={() => removeFile(i)} className="text-gray-500 hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-gray-500 text-sm">
            {allDone ? `${doneCount} billeder uploadet` : `${files.length} valgt`}
          </span>
          {allDone ? (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Færdig
            </button>
          ) : (
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="px-4 py-2 bg-battle-orange hover:bg-battle-orangeLight disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              {uploading ? 'Uploader...' : 'Upload'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;
