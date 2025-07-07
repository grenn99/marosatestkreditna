import { useState, useEffect } from 'react';

/**
 * Hook to manage welcome discount popup
 * @param delayMs Delay in milliseconds before showing the popup
 * @returns Object containing showPopup state and setShowPopup function
 */
export function useFirstTimeVisitor(delayMs: number = 5000) {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Function to check if popup should be shown
    const checkPopupConditions = () => {
      // Check if we're on the confirmation page - if so, don't show popup
      const isConfirmationPage = window.location.pathname.includes('confirm-subscription');
      if (isConfirmationPage) {
        console.log('On confirmation page, not showing welcome popup');
        return false;
      }

      // Check if the user has already subscribed
      const hasSubscribed = localStorage.getItem('welcome_discount_shown') === 'true';
      if (hasSubscribed) {
        console.log('User already subscribed, not showing welcome popup');
        return false;
      }

      // Check if the popup is temporarily hidden
      const tempHidden = localStorage.getItem('welcome_discount_temp_hidden') === 'true';
      const tempHiddenUntil = localStorage.getItem('welcome_discount_temp_hidden_until');
      if (tempHidden && tempHiddenUntil) {
        const hiddenUntilDate = new Date(tempHiddenUntil);
        const now = new Date();

        if (now < hiddenUntilDate) {
          console.log('Welcome popup temporarily hidden until', tempHiddenUntil);
          return false;
        } else {
          // If the hiding period has expired, remove the temporary hiding flags
          localStorage.removeItem('welcome_discount_temp_hidden');
          localStorage.removeItem('welcome_discount_temp_hidden_until');
        }
      }

      // All conditions passed, show the popup
      return true;
    };

    // Check if popup should be shown
    if (checkPopupConditions()) {
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
    // Reload the page to apply changes
    window.location.reload();
  };

  return { showPopup, closePopup, forceShowPopup, clearAllFlags };
}
