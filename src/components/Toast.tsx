import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Toast types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Toast item structure
interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

// Toast context interface
interface ToastContextType {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast provider props
interface ToastProviderProps {
  children: React.ReactNode;
}

/**
 * Toast Provider Component
 * Provides toast notification functionality to the application
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Add toast to the list
  const addToast = useCallback((message: string, type: ToastType, duration: number = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  // Remove toast from the list
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Create toast methods
  const success = useCallback((message: string, duration?: number) =>
    addToast(message, 'success', duration), [addToast]);

  const error = useCallback((message: string, duration?: number) =>
    addToast(message, 'error', duration), [addToast]);

  const info = useCallback((message: string, duration?: number) =>
    addToast(message, 'info', duration), [addToast]);

  const warning = useCallback((message: string, duration?: number) =>
    addToast(message, 'warning', duration), [addToast]);

  // Add toast methods to window for global access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.toast = { success, error, info, warning };
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.toast = undefined;
      }
    };
  }, [success, error, info, warning]);

  // Context value
  const contextValue = {
    success,
    error,
    info,
    warning,
    removeToast
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * Hook to use toast notifications
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Toast container props
interface ToastContainerProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

/**
 * Toast Container Component
 * Displays toast notifications
 */
function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  // Auto-remove toasts after their duration
  useEffect(() => {
    const timers = toasts.map(toast => {
      return setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

// Toast component props
interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

/**
 * Individual Toast Component
 */
function Toast({ message, type, onClose }: ToastProps) {
  const { t } = useTranslation();

  // Get background color based on type
  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div
      className={`${getBgColor()} text-white p-3 rounded-md shadow-md flex items-start justify-between min-w-[300px] max-w-md animate-fade-in`}
    >
      <p className="mr-2">{message}</p>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 focus:outline-none"
        aria-label={t('common.close', 'Close')}
      >
        <X size={18} />
      </button>
    </div>
  );
}

// Add animation to tailwind.config.js
// extend: {
//   keyframes: {
//     'fade-in': {
//       '0%': { opacity: '0', transform: 'translateY(10px)' },
//       '100%': { opacity: '1', transform: 'translateY(0)' }
//     }
//   },
//   animation: {
//     'fade-in': 'fade-in 0.3s ease-out'
//   }
// }
