import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasValidAdminSession, createAdminSession, refreshAdminSession } from '../utils/adminSecurity';
import { useTranslation } from 'react-i18next';
import { recordUserActivity } from '../utils/sessionTimeout';
import { logSecurityEvent, SecurityEventType } from '../utils/securityMonitoring';

interface SecureAdminRouteProps {
  children: React.ReactNode;
}

/**
 * A component that ensures only authenticated admin users can access certain routes
 * with additional security measures like session timeout.
 */
export function SecureAdminRoute({ children }: SecureAdminRouteProps) {
  const { user, isAdmin, loading } = useAuth();
  const [isValidating, setIsValidating] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const validateAdminSession = async () => {
      console.log('SecureAdminRoute: Validating admin session', {
        loading,
        user: user?.email,
        isAdmin
      });

      if (!loading && user) {
        // Record user activity to prevent session timeout
        recordUserActivity();

        // Special handling for known admin emails - always grant access
        const knownAdminEmails = ['nakupi@si.si']; // Add any other known admin emails here
        const isKnownAdmin = knownAdminEmails.includes(user.email || '');

        if (isKnownAdmin) {
          console.log('User is a known admin, granting access');
          setHasSession(true);

          // Log security event for admin access
          logSecurityEvent(SecurityEventType.ADMIN_ACCESS, {
            action: 'admin_session_created_for_known_admin',
            path: location.pathname
          });

          setIsValidating(false);
          return;
        }

        // Check if the user is an admin first
        if (isAdmin) {
          console.log('User is admin according to AuthContext');

          // Check if user has a valid admin session
          const isValid = await hasValidAdminSession();
          console.log('Admin session valid?', isValid);

          if (!isValid) {
            // Try to create a new admin session
            console.log('Creating new admin session');
            const created = await createAdminSession();
            console.log('Admin session created?', created);
            setHasSession(created);

            if (created) {
              // Log security event for admin access
              logSecurityEvent(SecurityEventType.ADMIN_ACCESS, {
                action: 'admin_session_created',
                path: location.pathname
              });
            } else {
              console.warn('Failed to create admin session');
            }
          } else {
            // Refresh the existing session
            console.log('Refreshing existing admin session');
            await refreshAdminSession();
            setHasSession(true);

            // Log security event for admin access
            logSecurityEvent(SecurityEventType.ADMIN_ACCESS, {
              action: 'admin_session_refreshed',
              path: location.pathname
            });
          }
        } else {
          console.log('User is not an admin according to AuthContext');
          setHasSession(false);
        }
      } else {
        console.log('User not logged in or still loading');
        setHasSession(false);
      }

      setIsValidating(false);
    };

    validateAdminSession();

    // Set up a timer to refresh the session every 15 minutes instead of 5
    // This reduces the frequency of refreshes while still maintaining security
    const interval = setInterval(async () => {
      if (user) {
        // Record user activity to prevent session timeout
        recordUserActivity();

        // Special handling for known admin emails - always maintain access
        const knownAdminEmails = ['nakupi@si.si']; // Add any other known admin emails here
        const isKnownAdmin = knownAdminEmails.includes(user.email || '');

        if (isKnownAdmin) {
          console.log('Known admin detected, maintaining access');
          setHasSession(true);
          return;
        }

        // For regular admins, check and refresh session
        if (isAdmin) {
          // Only refresh if the session is still valid
          // This avoids unnecessary refreshes
          if (await hasValidAdminSession()) {
            console.log('Refreshing admin session periodically');
            const refreshed = await refreshAdminSession();
            setHasSession(refreshed);
          }
        }
      }
    }, 15 * 60 * 1000); // 15 minutes instead of 5

    return () => clearInterval(interval);
  }, [user, isAdmin, loading, location.pathname]);

  // Show loading state
  if (loading || isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('admin.validating', 'Preverjanje administratorskih pravic...')}</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={`/login?redirectTo=${encodeURIComponent(location.pathname)}&lang=${i18n.language}`} replace />;
  }

  // Check if this is a known admin email
  const knownAdminEmails = ['nakupi@si.si']; // Add any other known admin emails here
  const isKnownAdmin = user && knownAdminEmails.includes(user.email || '');

  // Redirect to home if not an admin or no valid session (except for known admins)
  if ((!isAdmin && !isKnownAdmin) || !hasSession) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h2 className="text-lg font-semibold mb-2">{t('admin.accessDenied', 'Dostop zavrnjen')}</h2>
          <p>{t('admin.noPermission', 'Nimate dovoljenja za dostop do te strani.')}</p>
        </div>
        <a
          href={`/?lang=${i18n.language}`}
          className="inline-block mt-4 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
        >
          {t('common.backToHome', 'Nazaj na domačo stran')}
        </a>
      </div>
    );
  }

  // Render children if user is an admin with a valid session
  return <>{children}</>;
}
