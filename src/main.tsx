import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx'
import './index.css'
import './styles/admin.css' // Import admin styles
import './i18n'; // Initialize i18next
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import { ErrorBoundary } from './components/ErrorBoundary'; // Import ErrorBoundary
import { trackError, ErrorType, ErrorSeverity } from './utils/errorMonitoring';

// Set up global error handler for uncaught exceptions
window.addEventListener('error', (event) => {
  trackError(
    event.error || event.message,
    ErrorType.UNKNOWN,
    ErrorSeverity.ERROR,
    'window.onerror',
    {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    }
  );
});

// Set up global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  trackError(
    event.reason || 'Unhandled Promise Rejection',
    ErrorType.UNKNOWN,
    ErrorSeverity.ERROR,
    'unhandledrejection',
    {
      reason: event.reason
    }
  );
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider> {/* Wrap App with AuthProvider */}
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
