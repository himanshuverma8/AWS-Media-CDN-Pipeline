'use client';

import { signIn } from 'next-auth/react';
import { Shield, Lock, AlertCircle } from 'lucide-react';

export default function LoginPrompt() {
  const login = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center">
      <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/20 max-w-md w-full">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500/90 to-orange-600/90 rounded-full flex items-center justify-center shadow-2xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <Lock className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Authentication Required
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              You need to be logged in with the authorized Google account to manage files.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-xl p-4 w-full">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Google Authentication Required
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Sign in with your Google account to access file operations
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={login}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-700/90 hover:to-indigo-700/90 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
