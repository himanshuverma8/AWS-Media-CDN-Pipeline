'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Image as ImageIcon, FileText, Settings, Key, Book } from 'lucide-react';
import FileManager from '@/components/FileManager';
import AuthButton from '@/components/AuthButton';
import AnimatedLightningLogo from '@/components/AnimatedLightningLogo';
import SettingsModal from '@/components/SettingsModal';
import ApiKeyModal from '@/components/ApiKeyModal';
import OnboardingPrompt from '@/components/OnboardingPrompt';
import { useSession } from 'next-auth/react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'images' | 'files'>('images');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const { data: session, status } = useSession();
  
  const isLoading = status === 'loading';
  const isAuthenticated = !!session?.user && !!session.user.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-500 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 dark:from-blue-500/10 dark:to-indigo-700/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 dark:from-purple-500/10 dark:to-pink-700/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 dark:from-cyan-500/5 dark:to-blue-700/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Header */}
      <header className="relative bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl shadow-2xl border-b border-white/20 dark:border-gray-700/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div className="relative group flex-shrink-0">
                <AnimatedLightningLogo className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent truncate">
                  CDN Control Panel
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 sm:space-x-2 lg:space-x-3 flex-shrink-0">
              <Link
                href="/docs"
                className="flex items-center justify-center w-8 h-8 sm:w-auto sm:px-2 lg:px-3 sm:py-1.5 lg:py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/30 dark:border-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-colors"
                title="API Documentation"
              >
                <Book className="w-4 h-4 sm:w-3 lg:w-4 sm:h-3 lg:h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline ml-1 lg:ml-2">Docs</span>
              </Link>
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="flex items-center justify-center w-8 h-8 sm:w-auto sm:px-2 lg:px-3 sm:py-1.5 lg:py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/30 dark:border-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-colors"
                    title="Account Settings"
                  >
                    <Settings className="w-4 h-4 sm:w-3 lg:w-4 sm:h-3 lg:h-4 text-gray-600 dark:text-gray-300" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline ml-1 lg:ml-2">Settings</span>
                  </button>
                  <button
                    onClick={() => setIsApiKeyModalOpen(true)}
                    className="flex items-center justify-center w-8 h-8 sm:w-auto sm:px-2 lg:px-3 sm:py-1.5 lg:py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/30 dark:border-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-colors"
                    title="Manage API Keys"
                  >
                    <Key className="w-4 h-4 sm:w-3 lg:w-4 sm:h-3 lg:h-4 text-gray-600 dark:text-gray-300" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline ml-1 lg:ml-2">API Keys</span>
                  </button>
                </>
              )}
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600 dark:text-gray-300">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Navigation - Only show when authenticated */}
            {isAuthenticated && (
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-1 sm:p-2 shadow-2xl border border-white/20 dark:border-gray-700/20">
                  <nav className="flex space-x-1 sm:space-x-2">
                    <button
                      onClick={() => setActiveTab('images')}
                      className={`flex-1 py-2 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-6 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm flex items-center justify-center space-x-1 sm:space-x-2 transition-all duration-500 relative overflow-hidden group ${
                    activeTab === 'images'
                      ? 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white shadow-2xl transform scale-105'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-gray-700/20'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden xs:inline">Images</span>
                      <span className="xs:hidden">IMG</span>
                      {activeTab === 'images' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('files')}
                      className={`flex-1 py-2 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-6 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm flex items-center justify-center space-x-1 sm:space-x-2 transition-all duration-500 relative overflow-hidden group ${
                        activeTab === 'files'
                          ? 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white shadow-2xl transform scale-105'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-gray-700/20'
                      }`}
                    >
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden xs:inline">Files</span>
                      <span className="xs:hidden">DOC</span>
                      {activeTab === 'files' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                    </button>
                  </nav>
                </div>
              </div>
            )}

            {/* File Manager or Onboarding */}
            {isAuthenticated ? (
              <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-gray-700/5" />
                <FileManager type={activeTab} isReadOnly={false} />
              </div>
            ) : (
              <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-gray-700/5 pointer-events-none" />
                <OnboardingPrompt />
              </div>
            )}
                  </>
                )}
              </main>

              {/* Footer */}
              <footer className="relative mt-8 sm:mt-12 lg:mt-16">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                  <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/20 dark:border-gray-700/20">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                          © {new Date().getFullYear()}{' '}
                          <a
                            href="https://hv6.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors animate-blink"
                          >
                            hv6.dev
                          </a>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* API Key Management Modal */}
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} 
        onClose={() => setIsApiKeyModalOpen(false)} 
      />
    </div>
  );
}
