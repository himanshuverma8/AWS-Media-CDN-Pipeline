'use client';

import { X, AlertTriangle } from 'lucide-react';

interface StorageLimitErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
  storageInfo?: {
    userStorageUsed?: number;
    userStorageLimit?: number;
    globalStorageUsed?: number;
    globalStorageLimit?: number;
  };
}

export default function StorageLimitErrorModal({
  isOpen,
  onClose,
  error,
  storageInfo,
}: StorageLimitErrorModalProps) {
  if (!isOpen) return null;

  const isGlobalLimit = error.toLowerCase().includes('system');
  const isStorageFull = error.toLowerCase().includes('full') || 
                       (storageInfo?.userStorageUsed && storageInfo?.userStorageLimit && 
                        storageInfo.userStorageUsed >= storageInfo.userStorageLimit);

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md border border-red-200 dark:border-red-800 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-red-200 dark:border-red-800 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Upload Failed
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {isStorageFull ? 'Storage is full' : 'Insufficient storage space'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0 ml-2"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 lg:p-6">
          {/* Error Message */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-red-800 dark:text-red-300 leading-relaxed">
              {error}
            </p>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {isGlobalLimit 
                ? 'Please try again later or contact support.'
                : 'Delete unused files to free up space. You can view your storage usage in Settings.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

