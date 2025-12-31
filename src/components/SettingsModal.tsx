'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  X, 
  Settings, 
  User, 
  Calendar, 
  HardDrive, 
  Image as ImageIcon, 
  FileText, 
  Key,
  Loader2,
  Mail,
  Clock,
  Database,
  BarChart3
} from 'lucide-react';
import { USER_STORAGE_LIMIT } from '@/lib/aws-config';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserStats {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    avatar: string | null;
  };
  stats: {
    totalFiles: number;
    totalImages: number;
    totalDocuments: number;
    totalStorageBytes: number;
    totalStorageFormatted: string;
    hasApiKey: boolean;
    apiKeyCreatedAt: string | null;
  };
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [data, setData] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStats();
    } else {
      setData(null);
      setError(null);
    }
  }, [isOpen]);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user/stats');
      const result = await response.json();

     // console.log(result);
      
      if (result.success) {
        setData(result);
      } else {
        setError(result.error || 'Failed to load statistics');
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStoragePercentage = (bytes: number) => {
    return Math.min((bytes / USER_STORAGE_LIMIT) * 100, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account Settings</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">View your account details and usage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={loadStats}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : data && (
            <>
              {/* User Profile Section */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-4 sm:p-6">
                <div className="flex items-start space-x-4">
                  {data.user.avatar ? (
                    <Image
                      src={data.user.avatar}
                      alt={data.user.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-700 shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                      {data.user.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {data.user.email}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Member since {formatDate(data.user.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Storage Usage */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <HardDrive className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Storage Usage</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your current storage consumption</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {data.stats.totalStorageFormatted}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">of 50 MB</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${getStoragePercentage(data.stats.totalStorageBytes)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getStoragePercentage(data.stats.totalStorageBytes).toFixed(1)}% of storage used
                  </p>
                </div>
              </div>

              {/* File Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {data.stats.totalFiles}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Total Files</div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {data.stats.totalImages}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Images</div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {data.stats.totalDocuments}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Documents</div>
                </div>
              </div>

              {/* API Key Status */}
              <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    data.stats.hasApiKey 
                      ? 'bg-green-600' 
                      : 'bg-gray-400'
                  }`}>
                    <Key className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">API Access</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {data.stats.hasApiKey ? 'API key is active' : 'No API key configured'}
                    </p>
                  </div>
                </div>

                {data.stats.hasApiKey && data.stats.apiKeyCreatedAt && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg px-4 py-2">
                    <Clock className="w-4 h-4" />
                    <span>Created on {formatDateTime(data.stats.apiKeyCreatedAt)}</span>
                  </div>
                )}
              </div>

              {/* Account Info */}
              <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Account Details</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your account information</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Account ID</span>
                    <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                      {data.user.id.slice(0, 8)}...
                    </code>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">CDN Domain</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">cdn.hv6.dev</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Plan</span>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Free Tier</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    <span className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">Active</span>
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


