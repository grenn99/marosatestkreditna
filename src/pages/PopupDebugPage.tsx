import React from 'react';
import { useFirstTimeVisitorDebug } from '../hooks/useFirstTimeVisitorDebug';
import { FirstTimeVisitorDiscount } from '../components/FirstTimeVisitorDiscount';

export function PopupDebugPage() {
  const { showPopup, closePopup, forceShowPopup, clearAllFlags, debugInfo } = useFirstTimeVisitorDebug(3000);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Popup Debug Page</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Local Storage Flags</h2>
        <div className="space-y-2">
          <p><strong>welcome_discount_shown:</strong> {localStorage.getItem('welcome_discount_shown') || 'not set'}</p>
          <p><strong>welcome_discount_temp_hidden:</strong> {localStorage.getItem('welcome_discount_temp_hidden') || 'not set'}</p>
          <p><strong>welcome_discount_temp_hidden_until:</strong> {localStorage.getItem('welcome_discount_temp_hidden_until') || 'not set'}</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
        <div className="space-y-2">
          <p><strong>Has Subscribed:</strong> {debugInfo.hasSubscribed ? 'Yes' : 'No'}</p>
          <p><strong>Temp Hidden:</strong> {debugInfo.tempHidden ? 'Yes' : 'No'}</p>
          <p><strong>Temp Hidden Until:</strong> {debugInfo.tempHiddenUntil || 'N/A'}</p>
          <p><strong>Is Confirmation Page:</strong> {debugInfo.isConfirmationPage ? 'Yes' : 'No'}</p>
          <p><strong>Should Show Popup:</strong> {debugInfo.shouldShowPopup ? 'Yes' : 'No'}</p>
          <p><strong>Current Popup State:</strong> {showPopup ? 'Showing' : 'Hidden'}</p>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button 
          onClick={forceShowPopup}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Force Show Popup
        </button>
        
        <button 
          onClick={clearAllFlags}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear All Flags
        </button>
        
        <button 
          onClick={() => {
            localStorage.setItem('welcome_discount_shown', 'true');
            window.location.reload();
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Set As Subscribed
        </button>
        
        <button 
          onClick={() => {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 7);
            localStorage.setItem('welcome_discount_temp_hidden', 'true');
            localStorage.setItem('welcome_discount_temp_hidden_until', expiryDate.toISOString());
            window.location.reload();
          }}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Set As Temp Hidden
        </button>
      </div>
      
      {showPopup && <FirstTimeVisitorDiscount onClose={closePopup} />}
    </div>
  );
}
