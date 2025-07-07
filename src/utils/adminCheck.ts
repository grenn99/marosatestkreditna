/**
 * Simple Admin Check Utility
 * 
 * This module provides a simplified function for checking if a user is an admin.
 */

import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { ADMIN_EMAILS } from '../config/adminConfig';

/**
 * Checks if a user is an admin based on their email
 * 
 * @param user The user to check
 * @returns True if the user is an admin, false otherwise
 */
export function isAdminByEmail(user: User | null): boolean {
  if (!user) return false;
  
  const isAdmin = ADMIN_EMAILS.includes(user.email || '');
  console.log('Admin check by email:', user.email, isAdmin);
  return isAdmin;
}

/**
 * Checks if a user is an admin based on their metadata
 * 
 * @param user The user to check
 * @returns True if the user is an admin, false otherwise
 */
export function isAdminByMetadata(user: User | null): boolean {
  if (!user) return false;
  
  const isAdmin = user.user_metadata && user.user_metadata.is_admin === true;
  console.log('Admin check by metadata:', user.email, isAdmin, user.user_metadata);
  return isAdmin;
}

/**
 * Checks if a user is an admin based on the profiles table
 * 
 * @param user The user to check
 * @returns A promise that resolves to true if the user is an admin, false otherwise
 */
export async function isAdminByProfilesTable(user: User | null): Promise<boolean> {
  if (!user) return false;
  
  try {
    console.log('Checking admin status in profiles table for user:', user.id);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error checking admin status in profiles table:', error);
      return false;
    }
    
    console.log('Admin check by profiles table:', user.email, data?.is_admin, data);
    return data?.is_admin === true;
  } catch (err) {
    console.error('Exception checking admin status in profiles table:', err);
    return false;
  }
}

/**
 * Checks if a user is an admin using the Edge Function
 * 
 * @param user The user to check
 * @returns A promise that resolves to true if the user is an admin, false otherwise
 */
export async function isAdminByEdgeFunction(user: User | null): Promise<boolean> {
  if (!user) return false;
  
  try {
    console.log('Checking admin status using Edge Function for user:', user.email);
    
    const { data, error } = await supabase.functions.invoke('check-admin-role', {
      method: 'POST',
    });
    
    if (error) {
      console.error('Error checking admin status using Edge Function:', error);
      return false;
    }
    
    console.log('Admin check by Edge Function:', user.email, data?.isAdmin, data);
    return data?.isAdmin === true;
  } catch (err) {
    console.error('Exception checking admin status using Edge Function:', err);
    return false;
  }
}
