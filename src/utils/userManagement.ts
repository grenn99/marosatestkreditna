/**
 * User Management Utilities
 *
 * This module provides functions for managing user roles and permissions.
 */

import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { UserMetadata } from '../types';
import { ADMIN_EMAILS } from '../config/adminConfig';

/**
 * Checks if a user is an admin based on their metadata or email
 *
 * @param user The user to check
 * @returns True if the user is an admin, false otherwise
 */
export async function isAdminUser(user: User | null): Promise<boolean> {
  if (!user) return false;

  // Check cached result first (if available)
  try {
    const cachedAdminStatus = localStorage.getItem(`admin_status_${user.id}`);
    const cachedTimestamp = localStorage.getItem(`admin_status_timestamp_${user.id}`);

    if (cachedAdminStatus && cachedTimestamp) {
      const timestamp = parseInt(cachedTimestamp, 10);
      const now = Date.now();
      const isWithin24Hours = now - timestamp < 24 * 60 * 60 * 1000; // 24 hours

      if (isWithin24Hours) {
        const isAdmin = cachedAdminStatus === 'true';
        console.log('Using cached admin status in utility function for:', user.email, 'Status:', isAdmin);
        return isAdmin;
      }
    }

    // Check in order of speed (fastest first)

    // 1. Check email (fastest, no async)
    // Special handling for known admin emails - always grant admin status
    const knownAdminEmails = ['nakupi@si.si']; // Add any other known admin emails here
    const isKnownAdmin = knownAdminEmails.includes(user.email || '');

    // Check against both the known admin list and the config admin list
    const isAdminByEmail = isKnownAdmin || ADMIN_EMAILS.includes(user.email || '');

    if (isAdminByEmail) {
      console.log('User is admin based on hardcoded email list');
      // Cache the result
      localStorage.setItem(`admin_status_${user.id}`, 'true');
      localStorage.setItem(`admin_status_timestamp_${user.id}`, Date.now().toString());
      return true;
    }

    // 2. Check user metadata (fast, no async)
    if (user.user_metadata && user.user_metadata.is_admin === true) {
      console.log('User is admin based on metadata');
      // Cache the result
      localStorage.setItem(`admin_status_${user.id}`, 'true');
      localStorage.setItem(`admin_status_timestamp_${user.id}`, Date.now().toString());
      return true;
    }

    // 3. Check the profiles table (slower, async)
    // Only check if we haven't checked recently
    const dbCheckTimestamp = localStorage.getItem(`admin_db_checked_timestamp_${user.id}`);
    const now = Date.now();

    // Extend DB check cache duration to 7 days to reduce database queries
    const DB_CHECK_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

    const shouldCheckDb = !dbCheckTimestamp ||
      (now - parseInt(dbCheckTimestamp, 10) > DB_CHECK_CACHE_DURATION);

    // Check if we have a cached DB result (positive or negative)
    const dbResultCached = localStorage.getItem(`admin_db_result_${user.id}`);

    // If we have a cached result and it's still valid, use it
    if (dbResultCached && dbCheckTimestamp &&
        (now - parseInt(dbCheckTimestamp, 10) <= DB_CHECK_CACHE_DURATION)) {
      const isAdminFromDb = dbResultCached === 'true';
      console.log('Using cached DB admin status for:', user.email, 'Status:', isAdminFromDb);

      if (isAdminFromDb) {
        // Update the main admin status cache as well
        localStorage.setItem(`admin_status_${user.id}`, 'true');
        localStorage.setItem(`admin_status_timestamp_${user.id}`, now.toString());
        return true;
      }

      // If cached result is false, continue with the flow
    }

    if (shouldCheckDb) {
      console.log('Checking database for admin status:', user.email);
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      // Mark that we've checked the database
      localStorage.setItem(`admin_db_checked_timestamp_${user.id}`, now.toString());

      // Store the result (true or false)
      const isAdminFromDb = !error && data && data.is_admin === true;
      localStorage.setItem(`admin_db_result_${user.id}`, isAdminFromDb.toString());

      if (isAdminFromDb) {
        console.log('User is admin based on profiles table');
        // Cache the result
        localStorage.setItem(`admin_status_${user.id}`, 'true');
        localStorage.setItem(`admin_status_timestamp_${user.id}`, now.toString());
        return true;
      }
    } else {
      console.log('Skipping database check for admin status, recently checked:', user.email);
    }

    // Not an admin by any method
    // Cache the negative result too
    localStorage.setItem(`admin_status_${user.id}`, 'false');
    localStorage.setItem(`admin_status_timestamp_${user.id}`, Date.now().toString());
    return false;
  } catch (err) {
    console.error('Error checking admin status:', err);

    // Fall back to email check if there's an error
    // Special handling for known admin emails - always grant admin status
    const knownAdminEmails = ['nakupi@si.si']; // Add any other known admin emails here
    const isKnownAdmin = knownAdminEmails.includes(user.email || '');

    // Check against both the known admin list and the config admin list
    const isAdminByEmail = isKnownAdmin || ADMIN_EMAILS.includes(user.email || '');

    if (isAdminByEmail) {
      console.log('User is admin based on hardcoded email list (fallback)');
    }

    return isAdminByEmail;
  }
}

/**
 * Updates a user's admin status in their metadata
 *
 * @param userId The ID of the user to update
 * @param isAdmin Whether the user should be an admin
 * @returns True if the update was successful, false otherwise
 */
export async function updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<boolean> {
  try {
    // First update the user metadata
    const { error: metadataError } = await supabase.auth.admin.updateUserById(
      userId,
      { user_metadata: { is_admin: isAdmin } }
    );

    if (metadataError) {
      console.error('Error updating user metadata:', metadataError);
      // Continue anyway to try updating the profiles table
    }

    // Then update the profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_admin: isAdmin })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating profiles table:', profileError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception updating user admin status:', err);
    return false;
  }
}

/**
 * Gets all users with their admin status
 *
 * @returns An array of users with their admin status
 */
export async function getAllUsers(): Promise<{ id: string; email: string; isAdmin: boolean }[]> {
  try {
    // Get all users from the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, is_admin');

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    // Map the data to the expected format
    return (data || []).map(user => ({
      id: user.id,
      email: user.email || '',
      isAdmin: user.is_admin || false
    }));
  } catch (err) {
    console.error('Exception fetching users:', err);
    return [];
  }
}

/**
 * Clears all admin-related cache for a user
 * This should be called when a user logs out or when admin status changes
 *
 * @param userId The ID of the user to clear cache for
 */
export function clearAdminCache(userId: string): void {
  if (!userId) return;

  try {
    // Clear all admin-related cache keys
    localStorage.removeItem(`admin_status_${userId}`);
    localStorage.removeItem(`admin_status_timestamp_${userId}`);
    localStorage.removeItem(`admin_edge_checked_${userId}`);
    localStorage.removeItem(`admin_edge_checked_timestamp_${userId}`);
    localStorage.removeItem(`admin_edge_result_${userId}`);
    localStorage.removeItem(`admin_db_checked_timestamp_${userId}`);
    localStorage.removeItem(`admin_db_result_${userId}`);

    console.log('Admin cache cleared for user:', userId);
  } catch (err) {
    console.error('Error clearing admin cache:', err);
  }
}

/**
 * Checks if a user is an admin using only cached data and client-side checks
 * This function does NOT make any network requests or edge function calls
 * It's suitable for non-critical UI components where a slight delay in admin status updates is acceptable
 *
 * @param user The user to check
 * @returns True if the user is likely an admin based on cached data, false otherwise
 */
export function isAdminUserClientSideOnly(user: User | null): boolean {
  if (!user) return false;

  try {
    // 1. Check cached admin status first (fastest)
    const cachedAdminStatus = localStorage.getItem(`admin_status_${user.id}`);
    const cachedTimestamp = localStorage.getItem(`admin_status_timestamp_${user.id}`);

    if (cachedAdminStatus && cachedTimestamp) {
      const timestamp = parseInt(cachedTimestamp, 10);
      const now = Date.now();
      const isWithin7Days = now - timestamp < 7 * 24 * 60 * 60 * 1000; // 7 days

      if (isWithin7Days) {
        return cachedAdminStatus === 'true';
      }
    }

    // 2. Check email (fast, no async)
    // Special handling for known admin emails - always grant admin status
    const knownAdminEmails = ['nakupi@si.si']; // Add any other known admin emails here
    const isKnownAdmin = knownAdminEmails.includes(user.email || '');

    // Check against both the known admin list and the config admin list
    if (isKnownAdmin || ADMIN_EMAILS.includes(user.email || '')) {
      return true;
    }

    // 3. Check user metadata (fast, no async)
    if (user.user_metadata && user.user_metadata.is_admin === true) {
      return true;
    }

    // 4. Check cached edge function result
    const edgeResult = localStorage.getItem(`admin_edge_result_${user.id}`);
    const edgeTimestamp = localStorage.getItem(`admin_edge_checked_timestamp_${user.id}`);

    if (edgeResult && edgeTimestamp) {
      const timestamp = parseInt(edgeTimestamp, 10);
      const now = Date.now();
      const isWithin7Days = now - timestamp < 7 * 24 * 60 * 60 * 1000; // 7 days

      if (isWithin7Days) {
        return edgeResult === 'true';
      }
    }

    // 5. Check cached DB result
    const dbResult = localStorage.getItem(`admin_db_result_${user.id}`);
    const dbTimestamp = localStorage.getItem(`admin_db_checked_timestamp_${user.id}`);

    if (dbResult && dbTimestamp) {
      const timestamp = parseInt(dbTimestamp, 10);
      const now = Date.now();
      const isWithin7Days = now - timestamp < 7 * 24 * 60 * 60 * 1000; // 7 days

      if (isWithin7Days) {
        return dbResult === 'true';
      }
    }

    // Default to false if no cached data is available
    return false;
  } catch (err) {
    console.error('Error in client-side admin check:', err);

    // Fall back to email check if there's an error
    // Special handling for known admin emails - always grant admin status
    const knownAdminEmails = ['nakupi@si.si']; // Add any other known admin emails here
    const isKnownAdmin = knownAdminEmails.includes(user.email || '');

    // Check against both the known admin list and the config admin list
    return isKnownAdmin || ADMIN_EMAILS.includes(user.email || '');
  }
}
