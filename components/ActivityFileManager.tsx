import React, { useState, useEffect, useRef } from 'react';
import {
  Download, Eye, Trash2, Upload, FileText, RefreshCw, ChevronLeft, X, ExternalLink,
  FileSpreadsheet, File, FileImage, CheckSquare, Square, DownloadCloud,
  Folder, FolderPlus, ChevronRight, Edit3, Save, MessageSquare, ArrowLeft, MoreVertical, Pencil
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type FileType = 'image' | 'pdf' | 'word' | 'excel' | 'powerpoint' | 'other';

interface FileMetadata {
  id: string;
  activity: string;
  file_path: string;
  display_name: string | null;
  description: string | null;
  folder: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface UploadedFile {
  name: string;
  fullPath: string;
  url: string;
  type: FileType;
  size: number;
  created_at: string;
  metadata?: FileMetadata;
}

interface VirtualFolder {
  name: string;
  path: string;
  fileCount: number;
}

interface ActivityFileManagerProps {
  activity: string;
  onBack: () => void;
}

const BUCKET_NAME = 'activity-files';

const VALID_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'];
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const PDF_EXTENSIONS = ['pdf'];
const WORD_EXTENSIONS = ['docx', 'doc'];
const EXCEL_EXTENSIONS = ['xlsx', 'xls'];
const PPT_EXTENSIONS = ['pptx', 'ppt'];

function getFileType(fileName: string): FileType {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
  if (PDF_EXTENSIONS.includes(ext)) return 'pdf';
  if (WORD_EXTENSIONS.includes(ext)) return 'word';
  if (EXCEL_EXTENSIONS.includes(ext)) return 'excel';
  if (PPT_EXTENSIONS.includes(ext)) return 'powerpoint';
  return 'other';
}

function getFileTypeLabel(type: FileType): string {
  switch (type) {
    case 'image': return 'Billede';
    case 'pdf': return 'PDF';
    case 'word': return 'Word';
    case 'excel': return 'Excel';
    case 'powerpoint': return 'PowerPoint';
    default: return 'Fil';
  }
}

function getFileIcon(type: FileType) {
  switch (type) {
    case 'image': return <FileImage className="w-8 h-8 text-green-400" />;
    case 'pdf': return <FileText className="w-8 h-8 text-red-400" />;
    case 'word': return <FileText className="w-8 h-8 text-blue-400" />;
    case 'excel': return <FileSpreadsheet className="w-8 h-8 text-emerald-400" />;
    case 'powerpoint': return <FileText className="w-8 h-8 text-orange-400" />;
    default: return <File className="w-8 h-8 text-gray-400" />;
  }
}

const ACTIVITY_DISPLAY_NAMES: Record<string, string> = {
  teamplay: 'TeamPlay',
  teamtaste: 'TeamTaste',
  teamchallenge: 'TeamChallenge',
  teamlazer: 'TeamLazer',
  teamrobin: 'TeamRobin',
  teamsegway: 'TeamSegway',
  teamconnect: 'TeamConnect',
  teambox: 'TeamBox',
  teamcontrol: 'TeamControl',
  teamaction: 'TeamAction',
  teamconstruct: 'TeamConstruct',
  teamrace: 'TeamRace',
};

const ActivityFileManager: React.FC<ActivityFileManagerProps> = ({ activity, onBack }) => {
  const { profile } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [allMetadata, setAllMetadata] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [currentFolder, setCurrentFolder] = useState('/');
  const [folders, setFolders] = useState<VirtualFolder[]>([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [contextMenuFile, setContextMenuFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'GAMEMASTER';
  const displayName = ACTIVITY_DISPLAY_NAMES[activity] || activity;
  const folderPrefix = `${activity}/`;

  useEffect(() => {
    loadFiles();
    loadMetadata();
  }, [activity]);

  useEffect(() => {
    // Compute folders from metadata
    const folderSet = new Set<string>();
    folderSet.add('/');
    allMetadata.forEach(m => {
      if (m.folder && m.folder !== '/') {
        // Add this folder and all parent folders
        const parts = m.folder.split('/').filter(Boolean);
        let path = '';
        parts.forEach(part => {
          path += '/' + part;
          folderSet.add(path);
        });
      }
    });

    const folderList: VirtualFolder[] = Array.from(folderSet)
      .filter(f => {
        // Only show direct children of current folder
        if (currentFolder === '/') {
          return f !== '/' && f.split('/').filter(Boolean).length === 1;
        } else {
          return f !== currentFolder &&
            f.startsWith(currentFolder + '/') &&
            f.replace(currentFolder + '/', '').split('/').filter(Boolean).length === 1;
        }
      })
      .map(f => ({
        name: f.split('/').filter(Boolean).pop() || '',
        path: f,
        fileCount: allMetadata.filter(m => m.folder === f || m.folder.startsWith(f + '/')).length
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    setFolders(folderList);
  }, [allMetadata, currentFolder]);

  const loadMetadata = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_file_metadata')
        .select('*')
        .eq('activity', activity);

      if (error) {
        console.error('Error loading metadata:', error);
        return;
      }
      setAllMetadata(data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(activity, {
          limit: 200,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('Error loading files:', error);
        setIsLoading(false);
        return;
      }

      const fileList: UploadedFile[] = (data || [])
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file => {
          const fullPath = `${folderPrefix}${file.name}`;
          const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fullPath);

          return {
            name: file.name,
            fullPath,
            url: publicUrl,
            type: getFileType(file.name),
            size: file.metadata?.size || 0,
            created_at: file.created_at || ''
          };
        });

      setFiles(fileList);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Merge files with their metadata
  const getFilesWithMetadata = (): UploadedFile[] => {
    return files.map(file => {
      const meta = allMetadata.find(m => m.file_path === file.name);
      return { ...file, metadata: meta };
    });
  };

  // Get files for current folder
  const getCurrentFolderFiles = (): UploadedFile[] => {
    const filesWithMeta = getFilesWithMetadata();
    return filesWithMeta.filter(f => {
      const fileFolder = f.metadata?.folder || '/';
      return fileFolder === currentFolder;
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedInputFiles = e.target.files;
    if (!selectedInputFiles || selectedInputFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(selectedInputFiles)) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!VALID_EXTENSIONS.includes(ext || '')) {
          alert(`Ugyldig filtype: ${file.name}. Tilladte typer: JPEG, PNG, PDF, Word, Excel, PowerPoint`);
          continue;
        }

        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storageName = `${timestamp}-${safeName}`;
        const fileName = `${folderPrefix}${storageName}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, file, { upsert: true });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert(`Fejl ved upload af ${file.name}: ${uploadError.message}`);
          continue;
        }

        // Create metadata record with current folder
        const { error: metaError } = await supabase
          .from('activity_file_metadata')
          .insert({
            activity,
            file_path: storageName,
            display_name: safeName.replace(/_/g, ' '),
            description: null,
            folder: currentFolder,
            created_by: profile?.email || null,
          });

        if (metaError) {
          console.error('Metadata insert error:', metaError);
        }
      }

      await loadFiles();
      await loadMetadata();
    } catch (err) {
      console.error('Error uploading:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (file: UploadedFile) => {
    if (!confirm(`Slet filen "${getFileDisplayName(file)}"?`)) return;

    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([file.fullPath]);

      if (error) {
        console.error('Delete error:', error);
        alert(`Fejl ved sletning: ${error.message}`);
        return;
      }

      // Also delete metadata
      await supabase
        .from('activity_file_metadata')
        .delete()
        .eq('activity', activity)
        .eq('file_path', file.name);

      setFiles(prev => prev.filter(f => f.name !== file.name));
      setAllMetadata(prev => prev.filter(m => m.file_path !== file.name));
      setSelectedFiles(prev => {
        const next = new Set(prev);
        next.delete(file.name);
        return next;
      });
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const handleFileClick = (file: UploadedFile) => {
    if (selectMode) {
      toggleSelect(file.name);
      return;
    }
    if (file.type === 'image') {
      setPreviewImage(file.url);
    } else {
      window.open(file.url, '_blank');
    }
  };

  const toggleSelect = (fileName: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(fileName)) {
        next.delete(fileName);
      } else {
        next.add(fileName);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    const currentFiles = getCurrentFolderFiles();
    if (selectedFiles.size === currentFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(currentFiles.map(f => f.name)));
    }
  };

  const handleDownloadSelected = async () => {
    const toDownload = files.filter(f => selectedFiles.has(f.name));
    for (const file of toDownload) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = getFileDisplayName(file);
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;

    // Validate folder name
    const safeName = name.replace(/[^a-zA-Z0-9æøåÆØÅ _-]/g, '');
    if (!safeName) {
      alert('Ugyldigt mappenavn');
      return;
    }

    const newPath = currentFolder === '/' ? `/${safeName}` : `${currentFolder}/${safeName}`;

    // Check if folder already exists
    if (allMetadata.some(m => m.folder === newPath)) {
      alert('Mappen eksisterer allerede');
      return;
    }

    // Create a placeholder metadata entry to mark the folder as existing
    const { error } = await supabase
      .from('activity_file_metadata')
      .insert({
        activity,
        file_path: `__folder_${Date.now()}`,
        display_name: safeName,
        description: null,
        folder: newPath,
        created_by: profile?.email || null,
      });

    if (error) {
      console.error('Error creating folder:', error);
      alert('Fejl ved oprettelse af mappe');
      return;
    }

    setNewFolderName('');
    setShowNewFolder(false);
    await loadMetadata();
  };

  const handleSaveFileEdit = async (file: UploadedFile) => {
    const meta = file.metadata;

    if (meta) {
      // Update existing metadata
      const { error } = await supabase
        .from('activity_file_metadata')
        .update({
          display_name: editDisplayName.trim() || null,
          description: editDescription.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', meta.id);

      if (error) {
        console.error('Error updating metadata:', error);
        alert('Fejl ved opdatering');
        return;
      }
    } else {
      // Insert new metadata
      const { error } = await supabase
        .from('activity_file_metadata')
        .insert({
          activity,
          file_path: file.name,
          display_name: editDisplayName.trim() || null,
          description: editDescription.trim() || null,
          folder: currentFolder,
          created_by: profile?.email || null,
        });

      if (error) {
        console.error('Error inserting metadata:', error);
        alert('Fejl ved opdatering');
        return;
      }
    }

    setEditingFile(null);
    await loadMetadata();
  };

  const startEditing = (file: UploadedFile) => {
    setEditingFile(file.name);
    setEditDisplayName(file.metadata?.display_name || getDefaultDisplayName(file.name));
    setEditDescription(file.metadata?.description || '');
    setContextMenuFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDefaultDisplayName = (fileName: string) => {
    const match = fileName.match(/^\d+-(.+)$/);
    return match ? match[1].replace(/_/g, ' ') : fileName.replace(/_/g, ' ');
  };

  const getFileDisplayName = (file: UploadedFile) => {
    return file.metadata?.display_name || getDefaultDisplayName(file.name);
  };

  // Breadcrumb parts
  const getBreadcrumbs = () => {
    if (currentFolder === '/') return [];
    return currentFolder.split('/').filter(Boolean);
  };

  const navigateToFolder = (path: string) => {
    setCurrentFolder(path);
    setSelectedFiles(new Set());
    setSelectMode(false);
  };

  const currentFolderFiles = getCurrentFolderFiles();

  return (
    <div className="w-full max-w-4xl mx-auto px-2 tablet:px-4">
      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <a
            href={previewImage}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 p-3 bg-battle-orange/20 border border-battle-orange/30 rounded-lg text-battle-orange hover:bg-battle-orange/30 transition-colors flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-5 h-5" />
            <span className="text-sm uppercase">Åbn i nyt vindue</span>
          </a>
        </div>
      )}

      {/* File Edit Modal */}
      {editingFile && (() => {
        const file = getFilesWithMetadata().find(f => f.name === editingFile);
        if (!file) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditingFile(null)}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <div className="relative bg-battle-grey border border-purple-500/30 rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Edit3 className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">Rediger fil</h3>
                </div>
                <button onClick={() => setEditingFile(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 mb-6 p-3 bg-battle-black/50 rounded-xl border border-white/5">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-battle-black/50 border border-white/10 flex items-center justify-center flex-shrink-0">
                  {file.type === 'image' ? (
                    <img src={file.url} alt={file.name} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    getFileIcon(file.type)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 truncate">{getDefaultDisplayName(file.name)}</p>
                  <p className="text-xs text-gray-600">{getFileTypeLabel(file.type)} · {formatFileSize(file.size)}</p>
                </div>
              </div>

              {/* Display Name */}
              <div className="mb-4">
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Filnavn (visningsnavn)</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={e => setEditDisplayName(e.target.value)}
                  placeholder="Angiv et visningsnavn..."
                  className="w-full bg-battle-black border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Beskrivelse</label>
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  placeholder="Tilføj en beskrivelse..."
                  rows={3}
                  className="w-full bg-battle-black border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditingFile(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Annuller
                </button>
                <button
                  onClick={() => handleSaveFileEdit(file)}
                  className="flex items-center gap-2 px-5 py-2 bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-200 hover:bg-purple-500/40 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Gem</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl p-4 tablet:p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
              <Download className="w-6 h-6 tablet:w-8 tablet:h-8 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg tablet:text-xl font-bold text-white uppercase tracking-wider">
                FILER
              </h2>
              <p className="text-xs tablet:text-sm text-purple-400 uppercase">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentFolderFiles.length > 0 && (
              <button
                onClick={() => {
                  setSelectMode(!selectMode);
                  if (selectMode) setSelectedFiles(new Set());
                }}
                className={`px-3 py-2 rounded-lg text-xs uppercase tracking-wider transition-colors ${
                  selectMode
                    ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
                    : 'bg-white/10 border border-white/20 text-gray-400 hover:bg-white/20'
                }`}
              >
                {selectMode ? 'Annuller' : 'Vælg'}
              </button>
            )}
            <button
              onClick={() => { loadFiles(); loadMetadata(); }}
              disabled={isLoading}
              className="p-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 mb-4 flex-wrap">
          <button
            onClick={() => navigateToFolder('/')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs uppercase tracking-wider transition-colors ${
              currentFolder === '/' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Rod</span>
          </button>
          {getBreadcrumbs().map((part, idx) => {
            const path = '/' + getBreadcrumbs().slice(0, idx + 1).join('/');
            const isLast = idx === getBreadcrumbs().length - 1;
            return (
              <React.Fragment key={path}>
                <ChevronRight className="w-3 h-3 text-gray-600" />
                <button
                  onClick={() => navigateToFolder(path)}
                  className={`px-2 py-1 rounded-md text-xs uppercase tracking-wider transition-colors ${
                    isLast ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {part}
                </button>
              </React.Fragment>
            );
          })}

          {/* New folder button */}
          {isAdmin && (
            <button
              onClick={() => setShowNewFolder(!showNewFolder)}
              className="flex items-center gap-1 px-2 py-1 ml-2 rounded-md text-xs text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
              title="Ny mappe"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* New Folder Input */}
        {showNewFolder && isAdmin && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <FolderPlus className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <input
              type="text"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              placeholder="Mappenavn..."
              className="flex-1 bg-battle-black border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
              onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className="px-3 py-2 bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-200 hover:bg-purple-500/40 transition-colors text-xs uppercase tracking-wider disabled:opacity-50"
            >
              Opret
            </button>
            <button
              onClick={() => { setShowNewFolder(false); setNewFolderName(''); }}
              className="p-2 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Select Mode Toolbar */}
        {selectMode && currentFolderFiles.length > 0 && (
          <div className="flex items-center justify-between mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200 transition-colors"
              >
                {selectedFiles.size === currentFolderFiles.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>{selectedFiles.size === currentFolderFiles.length ? 'Fravælg alle' : 'Vælg alle'}</span>
              </button>
              <span className="text-xs text-gray-500">
                {selectedFiles.size} valgt
              </span>
            </div>
            {selectedFiles.size > 0 && (
              <button
                onClick={handleDownloadSelected}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-200 hover:bg-purple-500/40 transition-colors text-sm"
              >
                <DownloadCloud className="w-4 h-4" />
                <span className="uppercase tracking-wider">Download ({selectedFiles.size})</span>
              </button>
            )}
          </div>
        )}

        {/* Upload Section - Admin Only */}
        {isAdmin && (
          <div className="mb-4">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt"
              multiple
              onChange={handleUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-purple-500/30 rounded-xl text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/50 transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                  <span className="uppercase tracking-wider">Uploader...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span className="uppercase tracking-wider text-sm">Upload filer (Billeder, PDF, Word, Excel, PPT)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Folders */}
        {folders.length > 0 && (
          <div className="grid grid-cols-2 tablet:grid-cols-3 gap-2 mb-4">
            {folders.map(folder => (
              <button
                key={folder.path}
                onClick={() => navigateToFolder(folder.path)}
                className="flex items-center gap-3 p-3 bg-battle-black/30 border border-white/10 rounded-xl hover:border-purple-500/30 hover:bg-purple-500/5 transition-colors text-left group"
              >
                <Folder className="w-8 h-8 text-purple-400/70 group-hover:text-purple-400 transition-colors flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">{folder.name}</p>
                  <p className="text-xs text-gray-500">{folder.fileCount} fil{folder.fileCount !== 1 ? 'er' : ''}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Back to parent folder */}
        {currentFolder !== '/' && (
          <button
            onClick={() => {
              const parts = currentFolder.split('/').filter(Boolean);
              parts.pop();
              navigateToFolder(parts.length === 0 ? '/' : '/' + parts.join('/'));
            }}
            className="flex items-center gap-2 mb-4 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tilbage</span>
          </button>
        )}

        {/* Files Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 mt-3">Indlæser filer...</p>
          </div>
        ) : currentFolderFiles.length === 0 && folders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Download className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Ingen filer i denne mappe</p>
            {isAdmin && <p className="text-xs text-gray-600 mt-2">Upload filer med knappen ovenfor</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-3">
            {currentFolderFiles.map((file) => (
              <div
                key={file.name}
                className={`bg-battle-black/30 border rounded-xl p-4 transition-colors group cursor-pointer relative ${
                  selectMode && selectedFiles.has(file.name)
                    ? 'border-purple-500/50 bg-purple-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
                onClick={() => selectMode && toggleSelect(file.name)}
              >
                <div className="flex items-center gap-3">
                  {/* Select checkbox */}
                  {selectMode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelect(file.name); }}
                      className="flex-shrink-0 text-purple-400"
                    >
                      {selectedFiles.has(file.name) ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  )}

                  {/* File Preview/Icon */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleFileClick(file); }}
                    className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-battle-black/50 border border-white/10 flex items-center justify-center hover:border-purple-500/50 transition-colors"
                  >
                    {file.type === 'image' ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getFileIcon(file.type)
                    )}
                  </button>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleFileClick(file); }}
                      className="text-left w-full"
                    >
                      <p className="text-white font-medium truncate hover:text-purple-400 transition-colors text-sm">
                        {getFileDisplayName(file)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {getFileTypeLabel(file.type)} · {formatFileSize(file.size)}
                      </p>
                    </button>
                    {file.metadata?.description && (
                      <p className="text-xs text-gray-500 mt-1 truncate flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 flex-shrink-0 text-gray-600" />
                        <span className="truncate">{file.metadata.description}</span>
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {!selectMode && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleFileClick(file); }}
                        className="p-2 bg-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/20 transition-colors"
                        title={file.type === 'image' ? 'Vis billede' : 'Åbn fil'}
                      >
                        {file.type === 'image' ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <ExternalLink className="w-4 h-4" />
                        )}
                      </button>
                      <a
                        href={file.url}
                        download={getFileDisplayName(file)}
                        className="p-2 bg-white/10 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 transition-colors"
                        title="Download"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      {isAdmin && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setContextMenuFile(contextMenuFile === file.name ? null : file.name);
                            }}
                            className="p-2 bg-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
                            title="Mere"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {contextMenuFile === file.name && (
                            <div
                              className="absolute right-0 top-10 z-20 bg-battle-grey border border-white/20 rounded-xl shadow-2xl py-1 min-w-[160px]"
                              onClick={e => e.stopPropagation()}
                            >
                              <button
                                onClick={() => startEditing(file)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                                <span>Rediger</span>
                              </button>
                              <button
                                onClick={() => { handleDelete(file); setContextMenuFile(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Slet</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Text */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Klik på et billede for at se det i fuld størrelse. Klik på andre filer for at åbne dem.
        </div>

        {/* Click outside to close context menu - must be inside backdrop-blur container to share stacking context */}
        {contextMenuFile && (
          <div className="fixed inset-0 z-10" onClick={() => setContextMenuFile(null)} />
        )}
      </div>
    </div>
  );
};

export default ActivityFileManager;
