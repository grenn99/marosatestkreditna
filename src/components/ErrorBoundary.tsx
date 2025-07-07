import React, { Component, ErrorInfo, ReactNode } from 'react';
import { trackError, ErrorType, ErrorSeverity } from '../utils/errorMonitoring';
import { withTranslation, WithTranslation } from 'react-i18next';

interface Props extends WithTranslation {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and handle unhandled errors in React components
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundaryComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Track the error with our monitoring system
    trackError(
      error,
      ErrorType.UI,
      ErrorSeverity.ERROR,
      'ErrorBoundary',
      {
        componentStack: errorInfo.componentStack
      }
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-lg font-semibold text-red-700 mb-2">{this.props.t('error.somethingWentWrong', 'Something went wrong')}</h2>
          <p className="text-red-600 mb-4">
            {this.state.error?.message || this.props.t('error.unexpectedError', 'An unexpected error occurred')}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {this.props.t('error.tryAgain', 'Try again')}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryComponent);
