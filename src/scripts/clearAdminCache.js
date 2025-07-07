// Simple script to clear admin cache
function clearAdminCache() {
  console.log('Clearing admin cache...');
  
  // Get all keys in localStorage
  const keys = Object.keys(localStorage);
  
  // Filter for admin-related keys
  const adminKeys = keys.filter(key => 
    key.includes('admin_') || 
    key === 'admin_session' || 
    key === 'admin_session_storage'
  );
  
  // Remove each admin-related key
  adminKeys.forEach(key => {
    console.log(`Removing key: ${key}`);
    localStorage.removeItem(key);
  });
  
  // Also clear sessionStorage
  sessionStorage.removeItem('admin_session');
  
  console.log('Admin cache cleared successfully');
  
  // Force page reload
  window.location.reload();
}

// Execute the function
clearAdminCache();
