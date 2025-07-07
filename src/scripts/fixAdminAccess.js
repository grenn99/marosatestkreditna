/**
 * Script to fix admin access issues
 * 
 * This script ensures that admin sessions are properly stored in both
 * sessionStorage and localStorage for persistence across browser tabs
 */

// Admin session keys
const ADMIN_SESSION_KEY = 'admin_session';
const ADMIN_SESSION_STORAGE_KEY = 'admin_session_storage';

function fixAdminAccess() {
  try {
    console.log('Starting admin access fix...');
    
    // Check if we have an admin session in sessionStorage
    const sessionData = sessionStorage.getItem(ADMIN_SESSION_KEY);
    
    if (sessionData) {
      console.log('Found admin session in sessionStorage, copying to localStorage');
      
      // Copy to localStorage for persistence
      localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, sessionData);
      console.log('Admin session copied to localStorage');
    } else {
      // Check if we have an admin session in localStorage
      const storageData = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
      
      if (storageData) {
        console.log('Found admin session in localStorage, copying to sessionStorage');
        
        // Copy to sessionStorage
        sessionStorage.setItem(ADMIN_SESSION_KEY, storageData);
        console.log('Admin session copied to sessionStorage');
      } else {
        console.log('No admin session found in either storage');
      }
    }
    
    // Get the current user ID from localStorage
    const session = localStorage.getItem('supabase.auth.token');
    if (!session) {
      console.log('No active session found.');
      return;
    }
    
    // Parse the session to get the user ID
    const parsedSession = JSON.parse(session);
    const userId = parsedSession?.currentSession?.user?.id;
    
    if (!userId) {
      console.log('No user ID found in session.');
      return;
    }
    
    console.log('Current user ID:', userId);
    
    // Check if we have admin status cached
    const adminStatus = localStorage.getItem(`admin_status_${userId}`);
    
    if (adminStatus === 'true') {
      console.log('User is an admin according to cached status');
      
      // Create a new admin session if none exists
      if (!sessionData && !localStorage.getItem(ADMIN_SESSION_STORAGE_KEY)) {
        console.log('Creating new admin session');
        
        const now = Date.now();
        const session = {
          timestamp: now,
          verified: true
        };
        
        // Store in both storages
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
        localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
        
        console.log('New admin session created');
      }
    } else {
      console.log('User is not an admin according to cached status');
    }
    
    console.log('Admin access fix completed');
  } catch (error) {
    console.error('Error fixing admin access:', error);
  }
}

// Execute the function
fixAdminAccess();
