'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { LogIn, LogOut, User, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import Toast from './Toast';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  
  const isLoading = status === 'loading';
  const isAuthenticated = !!session?.user && !!session.user.email;
  const user = isAuthenticated ? session.user : null;

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setRipple({ x, y });
    setTimeout(() => setRipple(null), 600);
  };

  const login = async (event: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(event);
    setIsLoggingIn(true);
    setToast({ message: 'Redirecting to Google...', type: 'info' });
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Login error:', error);
      setToast({ message: 'Login failed. Please try again.', type: 'error' });
      setIsLoggingIn(false);
    }
  };

  const logout = async (event: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(event);
    setIsLoggingOut(true);
    setToast({ message: 'Logging out...', type: 'info' });
    try {
      await signOut({ callbackUrl: '/' });
      setToast({ message: 'Successfully logged out!', type: 'success' });
    } catch (error) {
      console.error('Logout error:', error);
      setToast({ message: 'Logout failed. Please try again.', type: 'error' });
    } finally {
      setTimeout(() => setIsLoggingOut(false), 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-xl border border-white/30 dark:border-gray-700/30">
        <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-300" />
        <span className="text-sm text-gray-600 dark:text-gray-300">Loading...</span>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-xl border border-white/30 dark:border-gray-700/30">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || 'User'}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline">
              {user?.name || 'User'}
            </span>
          </div>
          <button
            onClick={logout}
            disabled={isLoggingOut}
            className="relative flex items-center space-x-2 px-3 py-2 bg-red-600/90 hover:bg-red-700/90 active:bg-red-800/90 disabled:bg-red-500/70 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none shadow-lg hover:shadow-xl active:shadow-md cursor-pointer touch-manipulation select-none overflow-hidden"
            style={{
              WebkitTapHighlightColor: 'transparent',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none'
            }}
          >
            {ripple && (
              <span
                className="absolute bg-white/30 rounded-full animate-ping pointer-events-none"
                style={{
                  left: ripple.x - 10,
                  top: ripple.y - 10,
                  width: 20,
                  height: 20,
                  animationDuration: '600ms'
                }}
              />
            )}
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            <span className="text-sm font-medium hidden sm:inline">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </span>
          </button>
        </div>
        
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={login}
        disabled={isLoggingIn}
        className="relative flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-700/90 hover:to-indigo-700/90 active:from-blue-800/90 active:to-indigo-800/90 disabled:from-blue-500/70 disabled:to-indigo-500/70 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none shadow-lg hover:shadow-xl active:shadow-md cursor-pointer touch-manipulation select-none overflow-hidden"
        style={{
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
      >
        {ripple && (
          <span
            className="absolute bg-white/30 rounded-full animate-ping pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
              animationDuration: '600ms'
            }}
          />
        )}
        {isLoggingIn ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogIn className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">
          {isLoggingIn ? 'Signing in...' : 'Login with Google'}
        </span>
      </button>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
