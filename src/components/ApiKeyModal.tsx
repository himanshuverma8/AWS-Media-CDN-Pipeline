'use client';

import { useState, useEffect } from 'react';
import { X, Key, Copy, Check, AlertCircle, Loader2, Trash2, Eye, EyeOff } from 'lucide-react';
import Toast from './Toast';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Credentials {
  apiKey: string | null;
  hasSecret: boolean;
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [newCredentials, setNewCredentials] = useState<{ apiKey: string; apiSecret: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCredentials();
    } else {
      // Reset state when modal closes
      setCredentials(null);
      setNewCredentials(null);
      setShowSecret(false);
      setCopied(null);
    }
  }, [isOpen]);

  const loadCredentials = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/credentials');
      const data = await response.json();
      
      if (data.success) {
        setCredentials({
          apiKey: data.apiKey,
          hasSecret: data.hasSecret,
        });
      } else {
        setToast({ message: data.error || 'Failed to load credentials', type: 'error' });
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
      setToast({ message: 'Failed to load credentials', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const generateCredentials = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/v1/credentials', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        setNewCredentials({
          apiKey: data.apiKey,
          apiSecret: data.apiSecret,
        });
        setCredentials({
          apiKey: data.apiKey,
          hasSecret: true,
        });
        setToast({ 
          message: 'API credentials generated successfully! Save your secret now - it won\'t be shown again.', 
          type: 'success' 
        });
      } else {
        setToast({ message: data.error || 'Failed to generate credentials', type: 'error' });
      }
    } catch (error) {
      console.error('Error generating credentials:', error);
      setToast({ message: 'Failed to generate credentials', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const revokeCredentials = async () => {
    if (!confirm('Are you sure you want to revoke your API credentials? This action cannot be undone.')) {
      return;
    }

    setIsRevoking(true);
    try {
      const response = await fetch('/api/v1/credentials', {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        setCredentials(null);
        setNewCredentials(null);
        setToast({ message: 'API credentials revoked successfully', type: 'success' });
      } else {
        setToast({ message: data.error || 'Failed to revoke credentials', type: 'error' });
      }
    } catch (error) {
      console.error('Error revoking credentials:', error);
      setToast({ message: 'Failed to revoke credentials', type: 'error' });
    } finally {
      setIsRevoking(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'key' | 'secret') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setToast({ message: `${type === 'key' ? 'API Key' : 'API Secret'} copied to clipboard!`, type: 'success' });
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      setToast({ message: 'Failed to copy to clipboard', type: 'error' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">API Credentials</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your API keys for programmatic access</p>
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
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* New Credentials (shown only after generation) */}
              {newCredentials && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl p-4 sm:p-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        New API Credentials Generated
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Save your API Secret now - it will not be shown again!
                      </p>
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-green-900 dark:text-green-100">API Key</label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-green-200 dark:border-green-700 text-sm font-mono break-all">
                        {newCredentials.apiKey}
                      </code>
                      <button
                        onClick={() => copyToClipboard(newCredentials.apiKey, 'key')}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        title="Copy API Key"
                      >
                        {copied === 'key' ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* API Secret */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-green-900 dark:text-green-100">API Secret</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <code className="block w-full bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-green-200 dark:border-green-700 text-sm font-mono break-all">
                          {showSecret ? newCredentials.apiSecret : '•'.repeat(64)}
                        </code>
                        <button
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          title={showSecret ? 'Hide Secret' : 'Show Secret'}
                        >
                          {showSecret ? (
                            <EyeOff className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => copyToClipboard(newCredentials.apiSecret, 'secret')}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        title="Copy API Secret"
                      >
                        {copied === 'secret' ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Existing Credentials */}
              {credentials?.apiKey ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 sm:p-6">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">Current API Key</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 block">
                          API Key
                        </label>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-blue-200 dark:border-blue-700 text-sm font-mono break-all">
                            {credentials.apiKey}
                          </code>
                          <button
                            onClick={() => copyToClipboard(credentials.apiKey!, 'key')}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            title="Copy API Key"
                          >
                            {copied === 'key' ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Copy className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {credentials.hasSecret && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-800 dark:text-yellow-200">
                              Your API Secret was generated but is not shown for security. Generate new credentials to see the secret again.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={generateCredentials}
                      disabled={isGenerating}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Key className="w-5 h-5" />
                          <span>Generate New Credentials</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={revokeCredentials}
                      disabled={isRevoking}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed"
                    >
                      {isRevoking ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Revoking...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-5 h-5" />
                          <span className="hidden sm:inline">Revoke</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                    <Key className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No API Credentials
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Generate API credentials to access the CDN programmatically
                    </p>
                    <button
                      onClick={generateCredentials}
                      disabled={isGenerating}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Key className="w-5 h-5" />
                          <span>Generate API Credentials</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Usage Instructions */}
              {credentials?.apiKey && (
                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Usage Example</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use your API key in the <code className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">X-API-Key</code> header:
                    </p>
                    <code className="block bg-gray-900 dark:bg-gray-800 text-gray-100 px-4 py-3 rounded-lg text-xs font-mono overflow-x-auto">
                      curl -X POST https://your-domain.com/api/v1/upload \<br />
                      &nbsp;&nbsp;-H &quot;X-API-Key: {credentials.apiKey}&quot; \<br />
                      &nbsp;&nbsp;-F &quot;file=@image.jpg&quot; \<br />
                      &nbsp;&nbsp;-F &quot;type=image&quot;
                    </code>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
