import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { CheckoutStepIndicator } from './CheckoutStepIndicator';
// Temporarily comment out the step imports until we fix the paths
// import { InformationStep } from './steps/InformationStep';
// import { ShippingStep } from './steps/ShippingStep';
// import { PaymentStep } from './steps/PaymentStep';
// import { ReviewStep } from './steps/ReviewStep';
import { CheckoutSummary } from './CheckoutSummary';
import { ShippingCostNotification } from '../ShippingCostNotification';
import { SHIPPING } from '../../config/appConfig';

// Define states for the overall checkout flow
export type CheckoutStep = 'selection' | 'guest_form' | 'auth_form' | 'registration_form';
// Define states for auth flow within checkout (when 'auth_form' is active)
export type AuthSubState = 'initial' | 'login' | 'signup' | 'loggedIn';

export const CheckoutContainer: React.FC = () => {
  const { cart, gifts, clearCart } = useCart();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // State for managing checkout steps
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('selection');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [authSubState, setAuthSubState] = useState<AuthSubState>('initial');
  const [error, setError] = useState<string | null>(null);
  
  // Define the steps for the checkout process
  const checkoutSteps = [
    'checkout.steps.information',
    'checkout.steps.shipping',
    'checkout.steps.payment',
    'checkout.steps.review'
  ];
  
  // Functions for step navigation
  const goToNextStep = () => {
    if (currentStep < checkoutSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Effect to skip selection step if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      console.log('User is logged in, skipping selection step.');
      // Advance to the form step, potentially pre-fill later
      setCheckoutStep('auth_form');
      setAuthSubState('loggedIn'); // Indicate they are logged in within the auth form state
    }
  }, [user, authLoading]); // Rerun when auth state changes

  // Calculate cart total
  const calculateCartTotal = () => {
    let total = 0;
    
    // Add regular cart items
    cart.forEach(item => {
      // Use a default price of 0 if price is not available
      const itemPrice = typeof item.price === 'number' ? item.price : 0;
      total += itemPrice * item.quantity;
    });
    
    // Add gift items
    gifts.forEach(gift => {
      // Use a default price of 0 if price is not available
      const giftPrice = typeof gift.price === 'number' ? gift.price : 0;
      total += giftPrice * gift.quantity;
    });
    
    // Add shipping cost (using the correct property from SHIPPING config)
    total += SHIPPING.cost;
    
    return total;
  };

  // Redirect to cart if empty
  useEffect(() => {
    if (cart.length === 0 && gifts.length === 0) {
      navigate('/cart');
    }
  }, [cart, gifts, navigate]);

  // Render the current step
  const renderCurrentStep = () => {
    // Temporarily return a styled placeholder message until we fix the step components
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t(`checkout.steps.${checkoutSteps[currentStep - 1].split('.').pop()}`, `Step ${currentStep}: ${checkoutSteps[currentStep - 1]}`)}
        </h2>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                {t('checkout.refactoringMessage', 'This step is currently being refactored.')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          {currentStep > 1 && (
            <button 
              onClick={goToPreviousStep}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
            >
              {t('checkout.back', 'Back')}
            </button>
          )}
          
          {currentStep < checkoutSteps.length && (
            <button 
              onClick={goToNextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
            >
              {t('checkout.continue', 'Continue')}
            </button>
          )}
          
          {currentStep === checkoutSteps.length && (
            <button 
              onClick={() => alert(t('checkout.orderPlaced', 'Your order has been placed!'))}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-150"
            >
              {t('checkout.placeOrder', 'Place Order')}
            </button>
          )}
        </div>
      </div>
    );
    
    /* Commented out until we fix the step components
    switch (currentStep) {
      case 1:
        return (
          <InformationStep 
            onNext={goToNextStep}
            setError={setError}
            checkoutStep={checkoutStep}
            setCheckoutStep={setCheckoutStep}
            authSubState={authSubState}
            setAuthSubState={setAuthSubState}
          />
        );
      case 2:
        return (
          <ShippingStep
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            setError={setError}
          />
        );
      case 3:
        return (
          <PaymentStep
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            setError={setError}
          />
        );
      case 4:
        return (
          <ReviewStep
            onBack={goToPreviousStep}
            setError={setError}
          />
        );
      default:
        return null;
    }
    */
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('checkout.title', 'Checkout')}</h1>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          {/* Step indicator */}
          <div className="flex justify-between mb-6">
            {checkoutSteps.map((step, index) => (
              <div 
                key={step} 
                className={`flex-1 text-center pb-2 ${index + 1 === currentStep ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : index + 1 < currentStep ? 'border-b-2 border-blue-500 text-blue-500' : 'border-b border-gray-300 text-gray-500'}`}
              >
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (index + 1 < currentStep) {
                      setCurrentStep(index + 1);
                    }
                  }}
                  className={`text-sm ${index + 1 <= currentStep ? 'hover:text-blue-700' : ''}`}
                >
                  {t(step)}
                </a>
              </div>
            ))}
          </div>
          
          {/* Current step content */}
          <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
            {renderCurrentStep()}
          </div>
        </div>
        
        <div className="md:w-1/3">
          {/* Order summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-800">{t('checkout.orderSummary', 'Povzetek naročila')}</h2>
              </div>
              
              <div className="bg-white p-4">
                {/* Cart items */}
                <div className="space-y-3 mb-4">
                  {cart.map((item) => (
                    <div key={`${item.productId}-${item.packageOptionId}`} className="flex justify-between">
                      <div>
                        <span className="font-medium">{item.productId}</span>
                        <span className="text-sm text-gray-600 ml-1">({item.packageOptionId})</span>
                        <span className="text-sm text-gray-600 ml-1">x {item.quantity}</span>
                      </div>
                      <span className="font-medium">€{((typeof item.price === 'number' ? item.price : 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  
                  {gifts.map((gift) => (
                    <div key={`gift-${gift.id}`} className="flex justify-between">
                      <div>
                        <span className="font-medium">{gift.name || 'Gift'}</span>
                        <span className="text-sm text-gray-600 ml-1">x {gift.quantity}</span>
                      </div>
                      <span className="font-medium">€{((typeof gift.price === 'number' ? gift.price : 0) * gift.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                {/* Subtotal */}
                <div className="flex justify-between py-2 border-t border-gray-200">
                  <span>{t('checkout.subtotal', 'Vmesna vsota')}</span>
                  <span className="font-medium">€{calculateCartTotal().toFixed(2)}</span>
                </div>
                
                {/* Shipping */}
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span>{t('checkout.shipping', 'Poštnina')}</span>
                  <span className="font-medium">
                    {calculateCartTotal() >= SHIPPING.freeThreshold
                      ? t('checkout.freeShipping', 'Brezplačno')
                      : `€${SHIPPING.cost.toFixed(2)}`}
                  </span>
                </div>
                
                {/* Total */}
                <div className="flex justify-between py-3 font-bold text-lg">
                  <span>{t('checkout.total', 'Skupaj')}</span>
                  <span>€{calculateCartTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Shipping notification */}
            <div className="bg-amber-50 rounded-lg p-4 mb-4 border border-amber-100">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="font-medium text-amber-800">
                  {t('cart.shippingCost', 'Strošek dostave')}
                </h3>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-amber-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-amber-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${Math.min(100, (calculateCartTotal() / SHIPPING.freeThreshold) * 100)}%` }}
                ></div>
              </div>
              
              {calculateCartTotal() >= SHIPPING.freeThreshold ? (
                <p className="text-sm text-green-600 font-medium">
                  {t('cart.qualifiedForFreeShipping', 'Vaše naročilo je upravičeno do brezplačne dostave!')}
                </p>
              ) : (
                <p className="text-sm text-amber-700">
                  {t('cart.addMoreForFreeShipping', 'Dodajte še za {{amount}}, da pridobite brezplačno dostavo!', {
                    amount: `€${(SHIPPING.freeThreshold - calculateCartTotal()).toFixed(2)}`
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutContainer;
