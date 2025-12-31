'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { 
  Upload, 
  Cloud, 
  Zap, 
  Shield, 
  Globe, 
  ArrowRight,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { useState } from 'react';

export default function OnboardingPrompt() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Login error:', error);
      setIsLoggingIn(false);
    }
  };

  const features = [
    {
      icon: Cloud,
      title: 'Cloud Storage',
      description: 'Store and manage your files in the cloud with 50 MB free storage',
    },
    {
      icon: Zap,
      title: 'Fast CDN',
      description: 'Lightning-fast content delivery with global edge network',
    },
    {
      icon: ImageIcon,
      title: 'Image Optimization',
      description: 'Automatic image transformations and format conversion',
    },
    {
      icon: Shield,
      title: 'Secure Access',
      description: 'API keys and authentication for secure file management',
    },
    {
      icon: Globe,
      title: 'Public URLs',
      description: 'Get instant CDN URLs for your uploaded files',
    },
    {
      icon: FileText,
      title: 'File Management',
      description: 'Organize files in folders and manage your content',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-6 sm:p-8 lg:p-12">
      <div className="max-w-4xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-2xl mb-4">
            <Cloud className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
            Your Media CDN Platform
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload, manage, and deliver your files with a powerful CDN. Get started in seconds with Google Sign-In.
          </p>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center space-x-2 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {isLoggingIn ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Sign in to Upload Files</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all duration-300 hover:shadow-2xl hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Documentation Link */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Want to learn more? Check out our API documentation
          </p>
          <Link
            href="/docs"
            className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors cursor-pointer relative z-10"
          >
            <span>View Documentation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

