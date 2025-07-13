import React from 'react';
import { useTranslation } from 'react-i18next';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const defaultText = text || t('common.loading', 'Loading...');

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-brown-200 border-t-brown-600`}></div>
      {defaultText && (
        <p className="mt-4 text-sm text-gray-600">{defaultText}</p>
      )}
    </div>
  );
}

// Page-level loading component for lazy-loaded routes
export function PageLoadingSpinner() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 animate-spin rounded-full border-4 border-brown-200 border-t-brown-600 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-700">{t('common.loading', 'Loading...')}</p>
        <p className="mt-2 text-sm text-gray-500">{t('common.loadingPage', 'Please wait while we load the page')}</p>
      </div>
    </div>
  );
}
