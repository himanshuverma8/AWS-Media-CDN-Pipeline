'use client';

import { useState } from 'react';
import { X, Copy, ExternalLink, Calendar, HardDrive, FileText, Image as ImageIcon } from 'lucide-react';

interface FileDetailsModalProps {
  file: {
    name: string;
    size?: number;
    lastModified?: string;
    url?: string;
    key?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  type: 'image' | 'file';
}

export default function FileDetailsModal({ file, isOpen, onClose, type }: FileDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toUpperCase() || '';
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300 p-2 sm:p-4">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30 dark:border-gray-700/30 animate-in zoom-in-95 duration-300 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-gray-700/10" />
        
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 min-w-0 flex-1">
              <div className="p-2 sm:p-2.5 lg:p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg flex-shrink-0">
                {type === 'image' ? (
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                ) : (
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white truncate">File Details</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">Information about your file</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg sm:rounded-xl transition-colors duration-200 flex-shrink-0 ml-2"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* File Preview */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl lg:rounded-2xl">
              <div className="p-2 sm:p-2.5 lg:p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 rounded-lg sm:rounded-xl flex-shrink-0">
                {type === 'image' ? (
                  <ImageIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-500" />
                ) : (
                  <FileText className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white truncate" title={file.name}>
                  {file.name}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {getFileExtension(file.name)} File
                </p>
              </div>
            </div>
          </div>

          {/* File Information */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl">
                <HardDrive className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">File Size</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
                    {file.size ? formatFileSize(file.size) : 'Unknown'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Last Modified</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
                    {file.lastModified ? formatDate(file.lastModified) : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CDN URL */}
          {file.url && (
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5 sm:mb-2">
                CDN URL
              </label>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <code className="flex-1 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 bg-gray-100 dark:bg-gray-700 rounded-lg sm:rounded-xl text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-mono break-all overflow-x-auto">
                  {file.url}
                </code>
                <button
                  onClick={() => copyToClipboard(file.url!)}
                  className="p-2 sm:p-2.5 lg:p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:rounded-xl transition-colors duration-200 flex-shrink-0"
                  title="Copy URL"
                >
                  <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
              {copied && (
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1.5 sm:mt-2 animate-in fade-in duration-200">
                  URL copied to clipboard!
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-medium text-sm sm:text-base transition-colors duration-300 rounded-lg sm:rounded-xl"
            >
              Close
            </button>
            {file.url && (
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white rounded-lg sm:rounded-xl lg:rounded-2xl hover:from-blue-700/90 hover:to-indigo-700/90 font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-md border border-white/20 flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Open File</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
