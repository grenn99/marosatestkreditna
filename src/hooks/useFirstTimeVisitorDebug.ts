import { useState, useEffect } from 'react';

/**
 * Debug version of the hook to manage welcome discount popup
 * @param delayMs Delay in milliseconds before showing the popup
 * @returns Object containing showPopup state and setShowPopup function
 */
export function useFirstTimeVisitorDebug(delayMs: number = 5000) {
  const [showPopup, setShowPopup] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    hasSubscribed: boolean;
    tempHidden: boolean;
    tempHiddenUntil: string | null;
    isConfirmationPage: boolean;
    shouldShowPopup: boolean;
  }>({
    hasSubscribed: false,
    tempHidden: false,
    tempHiddenUntil: null,
    isConfirmationPage: false,
    shouldShowPopup: false,
  });

  useEffect(() => {
    // Check if we're on the confirmation page - if so, don't show popup
    const isConfirmationPage = window.location.pathname.includes('confirm-subscription');
    
    // Check if the user has already subscribed
    const hasSubscribed = localStorage.getItem('welcome_discount_shown') === 'true';
    
    // Check if the popup is temporarily hidden
    const tempHidden = localStorage.getItem('welcome_discount_temp_hidden') === 'true';
    const tempHiddenUntil = localStorage.getItem('welcome_discount_temp_hidden_until');
    
    let shouldShowPopup = true;
    
    if (isConfirmationPage) {
      console.log('On confirmation page, not showing welcome popup');
      shouldShowPopup = false;
    } else if (hasSubscribed) {
      console.log('User already subscribed, not showing welcome popup');
      shouldShowPopup = false;
    } else if (tempHidden && tempHiddenUntil) {
      const hiddenUntilDate = new Date(tempHiddenUntil);
      const now = new Date();
      
      if (now < hiddenUntilDate) {
        console.log('Welcome popup temporarily hidden until', tempHiddenUntil);
        shouldShowPopup = false;
      } else {
        // If the hiding period has expired, remove the temporary hiding flags
        localStorage.removeItem('welcome_discount_temp_hidden');
        localStorage.removeItem('welcome_discount_temp_hidden_until');
        shouldShowPopup = true;
      }
    }
    
    // Update debug info
    setDebugInfo({
      hasSubscribed,
      tempHidden,
      tempHiddenUntil,
      isConfirmationPage,
      shouldShowPopup,
    });
    
    // For new visitors or if temporary hiding has expired, show the popup after delay
    if (shouldShowPopup) {
      console.log('Showing welcome popup after delay...');
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, delayMs);
      
      return () => clearTimeout(timer);
    }
  }, [delayMs]);

  // Function to close the popup and remember the user's choice
  const closePopup = () => {
    setShowPopup(false);

    // If user closes without subscribing, remember for 7 days
    if (localStorage.getItem('welcome_discount_shown') !== 'true') {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      localStorage.setItem('welcome_discount_temp_hidden', 'true');
      localStorage.setItem('welcome_discount_temp_hidden_until', expiryDate.toISOString());
    }
  };

  // Function to force show the popup (for testing)
  const forceShowPopup = () => {
    localStorage.removeItem('welcome_discount_shown');
    localStorage.removeItem('welcome_discount_temp_hidden');
    localStorage.removeItem('welcome_discount_temp_hidden_until');
    setShowPopup(true);
  };

  // Function to clear all flags (for testing)
  const clearAllFlags = () => {
    localStorage.removeItem('welcome_discount_shown');
    localStorage.removeItem('welcome_discount_temp_hidden');
    localStorage.removeItem('welcome_discount_temp_hidden_until');
    console.log('All popup flags cleared');
  };

  return { showPopup, closePopup, forceShowPopup, clearAllFlags, debugInfo };
}
