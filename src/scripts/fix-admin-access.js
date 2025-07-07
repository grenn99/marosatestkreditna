// Script to fix admin access issues
import { clearAdminCache } from '../utils/userManagement';

function fixAdminAccess() {
  try {
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
    
    console.log('Clearing admin cache for user:', userId);
    
    // Clear all admin-related cache
    clearAdminCache(userId);
    
    // Force a page reload to re-authenticate
    window.location.reload();
    
    console.log('Admin cache cleared and page reloaded.');
  } catch (error) {
    console.error('Error fixing admin access:', error);
  }
}

// Execute the function
fixAdminAccess();
