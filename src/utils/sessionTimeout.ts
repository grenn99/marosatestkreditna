/**
 * Session Timeout Utilities
 *
 * This module provides functions for implementing session timeouts
 * to automatically log out inactive users.
 */

import { supabase } from '../lib/supabaseClient';
import { logSecurityEvent, SecurityEventType } from './securityMonitoring';
import { USER_SESSION_TIMEOUT } from '../config/adminConfig';

// Default session timeout is now imported from adminConfig

// Storage key for last activity timestamp
const LAST_ACTIVITY_KEY = 'last_activity_timestamp';

// Variable to store the timeout ID
let sessionTimeoutId: number | null = null;

/**
 * Initializes the session timeout mechanism
 *
 * @param timeoutMs The session timeout in milliseconds (default: from adminConfig)
 */
export function initSessionTimeout(timeoutMs: number = USER_SESSION_TIMEOUT): void {
  // Record initial activity
  recordUserActivity();

  // Set up event listeners for user activity
  const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];

  activityEvents.forEach(eventType => {
    window.addEventListener(eventType, handleUserActivity, { passive: true });
  });

  // Start the session timeout check
  startSessionTimeoutCheck(timeoutMs);
}

/**
 * Handles user activity by recording the timestamp
 */
function handleUserActivity(): void {
  recordUserActivity();
}

/**
 * Records user activity by updating the last activity timestamp
 */
export function recordUserActivity(): void {
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}

/**
 * Starts the session timeout check
 *
 * @param timeoutMs The session timeout in milliseconds
 */
function startSessionTimeoutCheck(timeoutMs: number): void {
  // Clear any existing timeout
  if (sessionTimeoutId !== null) {
    window.clearInterval(sessionTimeoutId);
  }

  // Check for session timeout every minute
  sessionTimeoutId = window.setInterval(() => {
    checkSessionTimeout(timeoutMs);
  }, 60 * 1000); // Check every minute
}

/**
 * Checks if the session has timed out
 *
 * @param timeoutMs The session timeout in milliseconds
 */
async function checkSessionTimeout(timeoutMs: number): Promise<void> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    // If no user is logged in, no need to check for timeout
    if (!user) return;

    // Get the last activity timestamp
    const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);

    if (!lastActivityStr) {
      // No activity recorded, record current time
      recordUserActivity();
      return;
    }

    const lastActivity = parseInt(lastActivityStr, 10);
    const now = Date.now();
    const inactiveTime = now - lastActivity;

    // Check if the session has timed out
    if (inactiveTime >= timeoutMs) {
      // Log the security event
      logSecurityEvent(SecurityEventType.AUTHENTICATION_SUCCESS, {
        action: 'session_timeout',
        inactiveTime,
        timeoutMs
      });

      // Sign out the user
      await supabase.auth.signOut();

      // Show a message to the user
      alert('Your session has expired due to inactivity. Please log in again.');

      // Redirect to login page
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Error checking session timeout:', error);
  }
}

/**
 * Cleans up the session timeout mechanism
 */
export function cleanupSessionTimeout(): void {
  // Clear the interval
  if (sessionTimeoutId !== null) {
    window.clearInterval(sessionTimeoutId);
    sessionTimeoutId = null;
  }

  // Remove event listeners
  const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];

  activityEvents.forEach(eventType => {
    window.removeEventListener(eventType, handleUserActivity);
  });
}

/**
 * Gets the remaining time until session timeout
 *
 * @param timeoutMs The session timeout in milliseconds
 * @returns The remaining time in milliseconds, or 0 if no session exists
 */
export function getSessionTimeRemaining(timeoutMs: number = USER_SESSION_TIMEOUT): number {
  try {
    // Get the last activity timestamp
    const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);

    if (!lastActivityStr) {
      return timeoutMs;
    }

    const lastActivity = parseInt(lastActivityStr, 10);
    const now = Date.now();
    const inactiveTime = now - lastActivity;

    return Math.max(0, timeoutMs - inactiveTime);
  } catch (error) {
    console.error('Error getting session time remaining:', error);
    return 0;
  }
}
