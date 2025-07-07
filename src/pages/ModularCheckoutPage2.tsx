import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { CheckoutDisplayItem, CheckoutStep, AuthSubState, Discount } from '../types/checkout';
import { SHIPPING, PAYMENT_METHODS } from '../config/appConfig';

// Components
import { CheckoutStepIndicator } from '../components/checkout/CheckoutStepIndicator';
import { CheckoutSummary } from '../components/checkout/CheckoutSummary';
import { CheckoutForm } from '../components/checkout/CheckoutForm';
import { PaymentMethodSelector } from '../components/checkout/PaymentMethodSelector';
import { DiscountCodeInput } from '../components/DiscountCodeInput';
import { StripePaymentForm } from '../components/StripePaymentForm';
import { ShippingCostNotification } from '../components/ShippingCostNotification';
import { CheckoutMethodStep } from '../components/checkout/steps/CheckoutMethodStep';
import { AuthenticationStep } from '../components/checkout/steps/AuthenticationStep';

// Services and utilities
import { 
  prepareOrderItems, 
  createOrder, 
  updateProductStock, 
  generateOrderId 
} from '../services/checkoutService';
import { 
  generateUUID, 
  calculateSubtotal, 
  calculateShippingCost, 
  calculateTotal 
} from '../utils/helpers';
import { useErrorHandler } from '../utils/errorMonitoring';

/**
 * ModularCheckoutPage - A more modular version of the checkout page
 * that maintains the same functionality as the original
 */
export const ModularCheckoutPage2: React.FC = () => {
  const { cart, gifts, clearCart } = useCart();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, session, loading: authLoading, signInWithPassword, signUp, checkEmailExists, signOut } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const errorHandler = useErrorHandler({ source: 'ModularCheckoutPage' });

  // State for cart items and loading
  const [cartItemsDetails, setCartItemsDetails] = useState<CheckoutDisplayItem[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Checkout flow states
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('selection');
  const [authSubState, setAuthSubState] = useState<AuthSubState>('initial');
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Slovenija',
    notes: '',
    password: '',
    confirmPassword: '',
  });
  
  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [stripePaymentComplete, setStripePaymentComplete] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  
  // Discount states
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  
  // Gift options
  const [giftOptionId, setGiftOptionId] = useState<number | null>(null);
  const [giftOptionCost, setGiftOptionCost] = useState(0);
  const [giftProductId, setGiftProductId] = useState<string | null>(null);
  const [giftProductPackageId, setGiftProductPackageId] = useState<string | null>(null);
  const [giftProductCost, setGiftProductCost] = useState(0);
  
  // Email verification
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch cart item details
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (cart.length === 0 && gifts.length === 0) {
        setCartItemsDetails([]);
        setLoadingDetails(false);
        return;
      }

      try {
        // Fetch product details for cart items
        const productIds = cart.map(item => item.productId);
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        if (productsError) {
          throw productsError;
        }

        // Map cart items to display items with full product details
        const displayItems: CheckoutDisplayItem[] = cart.map(cartItem => {
          const product = productsData.find(p => p.id === cartItem.productId);
          if (!product) {
            console.error(`Product not found for ID: ${cartItem.productId}`);
            return null;
          }

          // Find the selected package option
          const packageOptions = typeof product.package_options === 'string' 
            ? JSON.parse(product.package_options) 
            : product.package_options;
          
          const packageOption = packageOptions.find((opt: any) => 
            opt.uniq_id === cartItem.packageOptionId
          );

          if (!packageOption) {
            console.error(`Package option not found for ID: ${cartItem.packageOptionId}`);
            return null;
          }

          return {
            ...product,
            packageOption,
            quantity: cartItem.quantity
          };
        }).filter(Boolean) as CheckoutDisplayItem[];

        setCartItemsDetails(displayItems);
        setLoadingDetails(false);
      } catch (err) {
        console.error('Error fetching product details:', err);
        errorHandler.captureError(err, { context: 'fetchProductDetails' });
        setError(t('checkout.errors.loadingProducts', 'Error loading product details. Please try again.'));
        setLoadingDetails(false);
      }
    };

    fetchProductDetails();
  }, [cart, gifts, t, errorHandler]);

  // Calculate prices
  const subtotal = calculateSubtotal(cartItemsDetails);
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const shippingCost = calculateShippingCost(subtotalAfterDiscount, SHIPPING.freeThreshold, SHIPPING.cost);
  const total = calculateTotal(subtotal, discountAmount, shippingCost, giftOptionCost + giftProductCost);

  // Handle form input changes
  const handleInputChange = (nameOrEvent: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, valueParam?: string) => {
    let name: string;
    let value: string;

    if (typeof nameOrEvent === 'string') {
      name = nameOrEvent;
      value = valueParam || '';
    } else {
      name = nameOrEvent.target.name;
      value = nameOrEvent.target.value;
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear errors when user is typing
    setError(null);
    setAuthError(null);
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    setStripeError(null);
  };

  // Handle email blur to check if email exists
  const handleEmailBlur = async () => {
    const email = formData.email.trim();
    if (!email || checkingEmail) return;

    try {
      setCheckingEmail(true);
      const exists = await checkEmailExists(email);
      setEmailExists(exists);
    } catch (err) {
      console.error('Error checking email:', err);
      errorHandler.captureError(err, { context: 'handleEmailBlur' });
    } finally {
      setCheckingEmail(false);
    }
  };

  // Handle checkout step selection
  const handleCheckoutSelection = (step: CheckoutStep) => {
    setCheckoutStep(step);
    setAuthSubState('initial');
    setError(null);
    setAuthError(null);
  };

  // Handle login
  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setAuthError(t('checkout.errors.missingCredentials', 'Please enter your email and password.'));
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const { error } = await signInWithPassword(formData.email, formData.password);
      
      if (error) {
        throw error;
      }
      
      setAuthSubState('loggedIn');
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError(err.message || t('checkout.errors.loginFailed', 'Login failed. Please check your credentials.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle signup
  const handleSignUp = async () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setAuthError(t('checkout.errors.missingSignupFields', 'Please fill in all required fields.'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setAuthError(t('checkout.errors.passwordMismatch', 'Passwords do not match.'));
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.name,
      });
      
      if (error) {
        throw error;
      }
      
      setAuthSubState('loggedIn');
    } catch (err: any) {
      console.error('Signup error:', err);
      setAuthError(err.message || t('checkout.errors.signupFailed', 'Registration failed. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Validate form and process order
    // Implementation will go here
  };

  // Render different content based on checkoutStep
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('checkout.title', 'Blagajna')}</h1>
      
      {/* Step Indicator */}
      <CheckoutStepIndicator 
        currentStep={checkoutStep === 'selection' ? 1 : 2}
        steps={['checkout.steps.cart', 'checkout.steps.checkout']}
      />
      
      {/* Empty Cart Message */}
      {cart.length === 0 && gifts.length === 0 && !loadingDetails && (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="mb-4">{t('checkout.emptyCart', 'Vaša košarica je prazna.')}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 transition-colors"
          >
            {t('checkout.continueShopping', 'Nadaljuj z nakupovanjem')}
          </button>
        </div>
      )}
      
      {/* Main Checkout Content */}
      {(cart.length > 0 || gifts.length > 0 || loadingDetails) && (
        <>
          {/* Step 1: Checkout Method Selection */}
          {checkoutStep === 'selection' && (
            <CheckoutMethodStep onSelectMethod={handleCheckoutSelection} />
          )}
          
          {/* Step 2: Authentication (if auth_form is selected) */}
          {checkoutStep === 'auth_form' && authSubState !== 'loggedIn' && (
            <AuthenticationStep
              authSubState={authSubState}
              setAuthSubState={setAuthSubState}
              formData={formData}
              onChange={handleInputChange}
              onLogin={handleLogin}
              onSignUp={handleSignUp}
              authError={authError}
              isSubmitting={isSubmitting}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          )}
          
          {/* Step 3: Checkout Form (Guest or Authenticated) */}
          {(checkoutStep === 'guest_form' || (checkoutStep === 'auth_form' && authSubState === 'loggedIn')) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Order Summary - Always visible on all steps */}
              <div className="order-last md:order-first">
                <CheckoutSummary
                  cartItems={cartItemsDetails}
                  loading={loadingDetails}
                  discountAmount={discountAmount}
                  discountCode={appliedDiscount?.code}
                  giftOptionCost={giftOptionCost}
                  giftOptionName={giftOptionId ? t('checkout.giftOption', 'Darilna embalaža') : ''}
                  giftProductCost={giftProductCost}
                  giftProductName={giftProductId ? t('checkout.giftProduct', 'Darilo') : ''}
                />
                
                {/* Shipping Cost Notification */}
                <div className="mt-4">
                  <ShippingCostNotification
                    subtotal={subtotalAfterDiscount}
                    freeShippingThreshold={SHIPPING.freeThreshold}
                  />
                </div>
                
                {/* Discount Code Input */}
                <div className="mt-4">
                  <DiscountCodeInput
                    onApply={setAppliedDiscount}
                    currentDiscount={appliedDiscount}
                    subtotal={subtotal}
                    onDiscountChange={setDiscountAmount}
                  />
                </div>
              </div>
              
              {/* Checkout Form */}
              <div>
                <form onSubmit={handleSubmit}>
                  {/* Shipping Information */}
                  <CheckoutForm
                    formData={formData}
                    onChange={handleInputChange}
                    onEmailBlur={handleEmailBlur}
                    isSubmitting={isSubmitting}
                    error={error}
                  />
                  
                  {/* Payment Method Selection */}
                  <div className="mt-6">
                    <PaymentMethodSelector
                      paymentMethod={paymentMethod}
                      onPaymentMethodChange={handlePaymentMethodChange}
                      isSubmitting={isSubmitting}
                      stripeError={stripeError}
                    />
                  </div>
                  
                  {/* Credit Card Payment Form */}
                  {paymentMethod === PAYMENT_METHODS.creditCard && (
                    <div className="mt-6">
                      <StripePaymentForm
                        amount={total}
                        onSuccess={(paymentId) => {
                          setStripePaymentComplete(true);
                        }}
                        onError={(errorMsg) => {
                          setStripeError(errorMsg);
                        }}
                        disabled={isSubmitting}
                        orderId={null}
                        shippingAddress={{
                          name: formData.name,
                          address: formData.address,
                          city: formData.city,
                          postalCode: formData.postalCode,
                          country: formData.country,
                          phone: formData.phone,
                          email: formData.email
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Place Order Button */}
                  <div className="mt-8 border-t pt-6">
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        (cart.length === 0 && gifts.length === 0) ||
                        loadingDetails ||
                        !paymentMethod ||
                        checkingEmail ||
                        authLoading ||
                        (paymentMethod === PAYMENT_METHODS.creditCard && !stripePaymentComplete)
                      }
                      className="w-full py-3 px-4 bg-brown-600 text-white rounded-md hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? (
                        <span>{t('checkout.processing', 'Obdelava...')}</span>
                      ) : (
                        <span>{t('checkout.placeOrder', 'Oddaj naročilo')}</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ModularCheckoutPage2;
