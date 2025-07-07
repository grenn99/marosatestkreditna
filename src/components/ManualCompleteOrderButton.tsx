import React, { useEffect, useState } from 'react';
import { TFunction } from 'i18next';

interface ManualCompleteOrderButtonProps {
  placeOrder: () => Promise<void>;
  t: TFunction;
}

export const ManualCompleteOrderButton: React.FC<ManualCompleteOrderButtonProps> = ({ placeOrder, t }) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Show the button after 5 seconds
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!showButton) {
    return null;
  }

  return (
    <div className="mt-4">
      <p className="text-sm text-amber-600 mb-2">
        {t('checkout.manualCompleteNeeded', 'It seems the automatic process is taking longer than expected.')}
      </p>
      <button
        type="button"
        onClick={() => placeOrder()}
        className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md"
      >
        {t('checkout.manuallyCompleteOrder', 'Complete Order Manually')}
      </button>
    </div>
  );
};
