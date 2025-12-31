'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Folder, 
  File, 
  Image as ImageIcon, 
  ArrowLeft,
  RefreshCw,
  Upload,
  FolderPlus
} from 'lucide-react';
import FileActionsDropdown from './FileActionsDropdown';
import FileDetailsModal from './FileDetailsModal';
import RenameModal from './RenameModal';
import StorageLimitErrorModal from './StorageLimitErrorModal';

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  size?: number;
  lastModified?: string;
  url?: string;
  key?: string;
}

interface FileManagerProps {
  type: 'images' | 'files';
  isReadOnly?: boolean;
}

export default function FileManager({ type, isReadOnly = false }: FileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showStorageErrorModal, setShowStorageErrorModal] = useState(false);
  const [storageError, setStorageError] = useState<string>('');
  const [storageInfo, setStorageInfo] = useState<{
    userStorageUsed?: number;
    userStorageLimit?: number;
    globalStorageUsed?: number;
    globalStorageLimit?: number;
  } | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/list?type=${type === 'images' ? 'image' : 'file'}&prefix=${currentFolder}`);
      const result = await response.json();

      if (result.success) {
        setFiles(result.files || []);
        setFolders(result.folders || []);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  }, [type, currentFolder]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleFolderClick = (folderName: string) => {
    const newPath = currentFolder ? `${currentFolder}/${folderName}` : folderName;
    setCurrentFolder(newPath);
  };

  const handleBackClick = () => {
    const pathParts = currentFolder.split('/');
    pathParts.pop();
    setCurrentFolder(pathParts.join('/'));
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderName: folderName.trim(),
          type: type === 'images' ? 'image' : 'file',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setFolderName('');
        setShowCreateFolder(false);
        loadFiles();
      } else {
        console.error('Folder creation failed:', result.error);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Folder creation error:', error);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', currentFolder);
        formData.append('type', type === 'images' ? 'image' : 'file');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (response.status === 413) {
          // Storage limit exceeded
          setStorageError(result.error || 'Storage limit exceeded');
          setStorageInfo(result.storageInfo);
          setShowStorageErrorModal(true);
          break; // Stop processing remaining files
        } else if (result.success) {
          loadFiles();
        } else {
          console.error('Upload failed:', result.error);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleRename = async (oldKey: string, newName: string) => {
    try {
      const response = await fetch('/api/rename', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldKey,
          newName,
          type: type === 'images' ? 'image' : 'file',
        }),
      });

      const result = await response.json();

      if (result.success) {
        loadFiles(); // Refresh the file list
      } else {
        console.error('Rename failed:', result.error);
      }
    } catch (error) {
      console.error('Rename error:', error);
    }
  };

  const handleDelete = async (file: FileItem) => {
    if (!file.key) return;

    if (window.confirm(`Are you sure you want to delete "${file.name}"? This action cannot be undone.`)) {
      try {
        const response = await fetch('/api/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: file.key,
          }),
        });

        const result = await response.json();

        if (result.success) {
          loadFiles(); // Refresh the file list
        } else {
          console.error('Delete failed:', result.error);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleViewDetails = (file: FileItem) => {
    setSelectedFile(file);
    setShowDetailsModal(true);
  };

  const handleRenameFile = (file: FileItem) => {
    setSelectedFile(file);
    setShowRenameModal(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };


  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    // Image files
    if (type === 'images' || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'tiff'].includes(extension || '')) {
      return <ImageIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-500" />;
    }
    
    // Document files
    if (['pdf'].includes(extension || '')) {
      return <File className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-red-500" />;
    }
    
    // Text files
    if (['txt', 'md', 'doc', 'docx'].includes(extension || '')) {
      return <File className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-500" />;
    }
    
    // Archive files
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return <File className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-500" />;
    }
    
    // Video files
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension || '')) {
      return <File className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-pink-500" />;
    }
    
    // Audio files
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(extension || '')) {
      return <File className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-orange-500" />;
    }
    
    // Default file icon
    return <File className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-gray-500" />;
  };

  const pathParts = currentFolder ? currentFolder.split('/') : [];

  return (
    <div 
      className="h-[500px] sm:h-[600px] flex flex-col relative"
      onDragEnter={!isReadOnly ? handleDrag : undefined}
      onDragLeave={!isReadOnly ? handleDrag : undefined}
      onDragOver={!isReadOnly ? handleDrag : undefined}
      onDrop={!isReadOnly ? handleDrop : undefined}
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-white/10 to-gray-100/10 dark:from-gray-800/10 dark:to-gray-700/10 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20 gap-3 sm:gap-0">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          {currentFolder && (
            <button
              onClick={handleBackClick}
              className="p-2 sm:p-3 hover:bg-white/20 dark:hover:bg-gray-700/20 rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-lg group backdrop-blur-md flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" />
            </button>
          )}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <div className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/30 dark:border-gray-700/30">
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${type === 'images' ? 'bg-green-500' : 'bg-blue-500'} animate-pulse flex-shrink-0`}></div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
                {type === 'images' ? 'Images' : 'Files'}
              </span>
            </div>
            {pathParts.length > 0 && (
              <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300 min-w-0">
                <span className="text-gray-400 dark:text-gray-500 flex-shrink-0">/</span>
                <span className="font-medium text-gray-900 dark:text-white bg-white/20 dark:bg-gray-800/20 backdrop-blur-md px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl border border-white/30 dark:border-gray-700/30 truncate">
                  {pathParts[pathParts.length - 1]}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-3 w-full sm:w-auto">
          {!isReadOnly && (
            <>
              <button
                onClick={() => setShowCreateFolder(true)}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-5 py-1.5 sm:py-3 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white rounded-xl sm:rounded-2xl hover:from-blue-700/90 hover:to-indigo-700/90 text-xs sm:text-sm font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 backdrop-blur-md border border-white/20 flex-1 sm:flex-none justify-center"
              >
                <FolderPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">New Folder</span>
                <span className="sm:hidden">Folder</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-5 py-1.5 sm:py-3 bg-gradient-to-r from-green-600/90 to-emerald-600/90 text-white rounded-xl sm:rounded-2xl hover:from-green-700/90 hover:to-emerald-700/90 disabled:opacity-50 text-xs sm:text-sm font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 disabled:transform-none backdrop-blur-md border border-white/20 flex-1 sm:flex-none justify-center"
              >
                <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{isUploading ? 'Uploading...' : 'Upload'}</span>
                <span className="sm:hidden">{isUploading ? '...' : 'Up'}</span>
              </button>
            </>
          )}
          {isReadOnly && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-500/20 dark:bg-yellow-600/20 backdrop-blur-md rounded-xl border border-yellow-400/30 dark:border-yellow-500/30">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium text-yellow-700 dark:text-yellow-300">
                Read Only Mode
              </span>
            </div>
          )}
          <button
            onClick={loadFiles}
            className="p-2 sm:p-3 hover:bg-white/20 dark:hover:bg-gray-700/20 rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-lg group backdrop-blur-md flex-shrink-0"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-3xl p-8 w-96 shadow-2xl border border-white/30 dark:border-gray-700/30 animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-gray-700/10" />
            <div className="relative">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                  <FolderPlus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Folder</h3>
              </div>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name..."
                className="w-full px-4 py-4 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                autoFocus
              />
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateFolder(false);
                    setFolderName('');
                  }}
                  className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-medium transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!folderName.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white rounded-2xl hover:from-blue-700/90 hover:to-indigo-700/90 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none backdrop-blur-md border border-white/20"
                >
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Grid */}
      <div className="flex-1 p-6 overflow-auto bg-gradient-to-br from-gray-50/30 to-white/30 dark:from-gray-800/30 dark:to-gray-900/30 backdrop-blur-sm">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <RefreshCw className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-400" />
                <div className="absolute inset-0 w-10 h-10 border-2 border-blue-200/50 dark:border-blue-800/50 rounded-full animate-pulse"></div>
              </div>
              <span className="text-gray-600 dark:text-gray-300 font-medium">Loading files...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-3 lg:gap-4">
            {/* Folders */}
            {folders.map((folder, index) => (
              <div
                key={index}
                onClick={() => handleFolderClick(folder.name)}
                className="flex flex-col items-center p-2 sm:p-3 lg:p-4 hover:bg-white/20 dark:hover:bg-gray-700/20 rounded-2xl sm:rounded-3xl cursor-pointer group transition-all duration-500 hover:shadow-2xl hover:scale-105 border border-transparent hover:border-blue-200/50 dark:hover:border-blue-700/50 backdrop-blur-md"
              >
                <div className="relative mb-2 sm:mb-3 lg:mb-4">
                  <div className="p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-blue-500/90 to-indigo-600/90 rounded-2xl sm:rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 backdrop-blur-md border border-white/20">
                    <Folder className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-center truncate w-full text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white" title={folder.name}>
                  {folder.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Folder</span>
              </div>
            ))}

            {/* Files */}
            {files.map((file, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-2 sm:p-3 lg:p-4 hover:bg-white/20 dark:hover:bg-gray-700/20 rounded-2xl sm:rounded-3xl group relative transition-all duration-500 hover:shadow-2xl hover:scale-105 border border-transparent hover:border-gray-200/50 dark:hover:border-gray-600/50 backdrop-blur-md"
              >
                <div className="relative mb-2 sm:mb-3 lg:mb-4">
                  <div className="p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-gray-100/80 to-gray-200/80 dark:from-gray-700/80 dark:to-gray-600/80 rounded-2xl sm:rounded-3xl shadow-lg group-hover:shadow-2xl transition-all duration-500 backdrop-blur-md border border-white/30 dark:border-gray-600/30">
                    {getFileIcon(file.name)}
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-center truncate w-full text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white" title={file.name}>
                  {file.name}
                </span>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {file.size && formatFileSize(file.size)}
                </div>
                
                {/* File Actions */}
                {!isReadOnly && (
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <FileActionsDropdown
                      file={file}
                      onRename={handleRenameFile}
                      onDelete={handleDelete}
                      onViewDetails={handleViewDetails}
                      onCopyUrl={copyToClipboard}
                    />
                  </div>
                )}
                {/* Read-only copy button */}
                {isReadOnly && (
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={() => copyToClipboard(file.url || '')}
                      className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl transition-all duration-300 transform hover:scale-110 border border-white/30 dark:border-gray-700/30"
                      title="Copy URL"
                    >
                      <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Empty State */}
            {folders.length === 0 && files.length === 0 && !loading && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                <div className="relative mb-8">
                  <div className="p-8 bg-gradient-to-br from-gray-100/80 to-gray-200/80 dark:from-gray-700/80 dark:to-gray-600/80 rounded-3xl shadow-2xl backdrop-blur-md border border-white/30 dark:border-gray-600/30">
                    <Folder className="w-20 h-20 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-sm font-bold">?</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-3">No files or folders</h3>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 max-w-md mb-6">
                  Drag and drop files here or use the upload button to get started with your CDN
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white rounded-2xl text-sm font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-md border border-white/20"
                  >
                    Upload Files
                  </button>
                  <button
                    onClick={() => setShowCreateFolder(true)}
                    className="px-6 py-3 bg-gradient-to-r from-gray-600/90 to-gray-700/90 dark:from-gray-700/90 dark:to-gray-800/90 text-white rounded-2xl text-sm font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-md border border-white/20"
                  >
                    Create Folder
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drag Overlay */}
      {dragActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/80 to-indigo-100/80 dark:from-blue-900/80 dark:to-indigo-900/80 backdrop-blur-md border-2 border-dashed border-blue-400 dark:border-blue-500 flex items-center justify-center z-10 animate-in fade-in duration-300">
          <div className="text-center">
            <div className="p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl mb-6 border border-white/30 dark:border-gray-700/30">
              <Upload className="w-20 h-20 text-blue-600 dark:text-blue-400 mx-auto animate-bounce" />
            </div>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-3">Drop files here to upload</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">Release to upload to your CDN</p>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={type === 'images' ? 'image/*' : '*'}
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Copy Success Message */}
      {copiedUrl && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500/90 to-emerald-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-bottom-2 duration-300 backdrop-blur-md border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="font-semibold">URL copied to clipboard!</span>
          </div>
        </div>
      )}

      {/* File Details Modal */}
      {selectedFile && (
        <FileDetailsModal
          file={selectedFile}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedFile(null);
          }}
          type={type === 'images' ? 'image' : 'file'}
        />
      )}

      {/* Rename Modal */}
      {selectedFile && (
        <RenameModal
          file={selectedFile}
          isOpen={showRenameModal}
          onClose={() => {
            setShowRenameModal(false);
            setSelectedFile(null);
          }}
          onRename={handleRename}
          type={type === 'images' ? 'image' : 'file'}
        />
      )}

      {/* Storage Limit Error Modal */}
      <StorageLimitErrorModal
        isOpen={showStorageErrorModal}
        onClose={() => {
          setShowStorageErrorModal(false);
          setStorageError('');
          setStorageInfo(undefined);
        }}
        error={storageError}
        storageInfo={storageInfo}
      />
    </div>
  );
}
