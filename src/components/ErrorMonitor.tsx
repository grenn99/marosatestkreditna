import React, { useState, useEffect } from 'react';
import { getStoredErrors, clearStoredErrors, ErrorData, ErrorSeverity } from '../utils/errorMonitoring';

/**
 * A development-only component that displays recent errors
 * This should only be rendered in development mode
 */
export function ErrorMonitor() {
  const [errors, setErrors] = useState<ErrorData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<ErrorSeverity | 'all'>('all');

  // Update errors every second
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const interval = setInterval(() => {
      setErrors(getStoredErrors());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't render in production
  if (!import.meta.env.DEV) return null;

  // Filter errors by severity
  const filteredErrors = filter === 'all' 
    ? errors 
    : errors.filter(error => error.severity === filter);

  // Get count of errors by severity
  const errorCounts = {
    info: errors.filter(e => e.severity === ErrorSeverity.INFO).length,
    warning: errors.filter(e => e.severity === ErrorSeverity.WARNING).length,
    error: errors.filter(e => e.severity === ErrorSeverity.ERROR).length,
    critical: errors.filter(e => e.severity === ErrorSeverity.CRITICAL).length,
  };

  // Get color for severity
  const getSeverityColor = (severity: ErrorSeverity): string => {
    switch (severity) {
      case ErrorSeverity.INFO: return 'bg-blue-500';
      case ErrorSeverity.WARNING: return 'bg-yellow-500';
      case ErrorSeverity.ERROR: return 'bg-red-500';
      case ErrorSeverity.CRITICAL: return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Error count button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-800 text-white px-3 py-2 rounded-full shadow-lg hover:bg-gray-700"
      >
        <span className="font-mono">🐞</span>
        <span className="font-mono">{errors.length}</span>
        {errorCounts.critical > 0 && (
          <span className="inline-block w-3 h-3 rounded-full bg-purple-500"></span>
        )}
        {errorCounts.error > 0 && errorCounts.critical === 0 && (
          <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
        )}
      </button>

      {/* Error panel */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 w-96 max-h-[80vh] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Error Monitor</h3>
            <div className="flex space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as ErrorSeverity | 'all')}
                className="text-xs border rounded px-1 py-0.5"
              >
                <option value="all">All ({errors.length})</option>
                <option value={ErrorSeverity.INFO}>Info ({errorCounts.info})</option>
                <option value={ErrorSeverity.WARNING}>Warning ({errorCounts.warning})</option>
                <option value={ErrorSeverity.ERROR}>Error ({errorCounts.error})</option>
                <option value={ErrorSeverity.CRITICAL}>Critical ({errorCounts.critical})</option>
              </select>
              <button
                onClick={() => clearStoredErrors()}
                className="text-xs bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Error list */}
          <div className="overflow-y-auto flex-1">
            {filteredErrors.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No errors to display</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredErrors.map((error, index) => (
                  <div key={index} className="p-3 hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${getSeverityColor(error.severity)}`}></span>
                      <span className="text-xs font-medium text-gray-500">{error.type}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-medium">{error.message}</div>
                    <div className="mt-1 text-xs text-gray-500">{error.source}</div>
                    {error.stack && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-500 cursor-pointer">Stack trace</summary>
                        <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                    {error.metadata && Object.keys(error.metadata).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-500 cursor-pointer">Metadata</summary>
                        <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(error.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
