import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { encryptObject } from '../../../utils/encryption';
import { sendOrderConfirmationEmail } from '../../../utils/emailService';
import { generateUUID } from '../../../utils/formatters';

interface ReviewStepProps {
  onBack: () => void;
  setError: (error: string | null) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  onBack,
  setError
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart, gifts, clearCart, shippingAddress, cartTotal } = useCart();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Get payment method from session storage
  const paymentMethod = sessionStorage.getItem('payment_method') || 'pay_on_delivery';
  const stripePaymentId = sessionStorage.getItem('stripe_payment_id') || null;

  // Format payment method for display
  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'credit_card':
        return t('checkout.paymentMethods.creditCard', 'Credit Card');
      case 'bank_transfer':
        return t('checkout.paymentMethods.bankTransfer', 'Bank Transfer');
      case 'pay_on_delivery':
        return t('checkout.paymentMethods.payOnDelivery', 'Pay on Delivery');
      default:
        return method;
    }
  };

  // Handle order submission
  const handlePlaceOrder = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare order items
      const orderItems = cart.map(item => ({
        product_id: item.productId,
        product_name: item.name,
        package_description: item.packageDescription,
        quantity: item.quantity,
        price_per_unit: item.price,
        line_total: item.price * item.quantity
      }));

      // Add gift items if any
      if (gifts.length > 0) {
        gifts.forEach(gift => {
          orderItems.push({
            product_id: gift.product_id || 'gift-' + gift.id,
            product_name: gift.name,
            package_description: t('checkout.giftPackage', 'Darilni paket'),
            quantity: gift.quantity,
            price_per_unit: gift.price,
            line_total: gift.price * gift.quantity
          });
        });
      }

      // Encrypt sensitive shipping address fields
      const encryptedAddress = await encryptObject(shippingAddress, ['name', 'address', 'phone']);

      // Create order in database
      const orderId = generateUUID();
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            id: orderId,
            user_id: user?.id || null,
            items: JSON.stringify(orderItems),
            total_price: cartTotal,
            status: paymentMethod === 'credit_card' ? 'paid' : 'pending',
            shipping_address: JSON.stringify(encryptedAddress),
            payment_method: paymentMethod,
            payment_id: stripePaymentId,
            notes: shippingAddress.notes || null
          }
        ])
        .select()
        .single();

      if (orderError) {
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      // Store order ID in session storage for order confirmation page
      sessionStorage.setItem('lastSuccessfulOrder', orderId);
      sessionStorage.setItem('clearCartAfterOrder', 'true');

      // Email sending is now handled in MultiStepCheckoutPage
      console.log('Email sending disabled in ReviewStep - emails are now sent from MultiStepCheckoutPage');

      // Navigate to order success page
      navigate(`/order-success?order_id=${orderId}`);
    } catch (error) {
      console.error('Error placing order:', error);
      setError(t('checkout.errors.orderFailed', 'Failed to place order. Please try again.'));
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {t('checkout.steps.review', 'Review and Place Order')}
      </h2>

      <div className="space-y-6">
        {/* Order Items */}
        <div className="border-b pb-4">
          <h3 className="font-medium mb-3">{t('checkout.orderItems', 'Order Items')}</h3>

          <div className="space-y-2">
            {cart.map((item, index) => (
              <div key={`${item.productId}-${item.packageOptionId}-${index}`} className="flex justify-between">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600 ml-2">({item.packageDescription})</span>
                  <span className="text-gray-500 ml-2">x{item.quantity}</span>
                </div>
                <div className="font-medium">
                  {(item.price * item.quantity).toFixed(2)} {t('common.currency', 'EUR')}
                </div>
              </div>
            ))}

            {gifts.map((gift, index) => (
              <div key={`gift-${gift.id}-${index}`} className="flex justify-between">
                <div>
                  <span className="font-medium">{gift.name}</span>
                  <span className="text-gray-600 ml-2">({t('checkout.giftPackage', 'Darilni paket')})</span>
                  <span className="text-gray-500 ml-2">x{gift.quantity}</span>
                </div>
                <div className="font-medium">
                  {(gift.price * gift.quantity).toFixed(2)} {t('common.currency', 'EUR')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="border-b pb-4">
          <h3 className="font-medium mb-3">{t('checkout.shippingAddress', 'Shipping Address')}</h3>

          <div className="text-gray-700">
            <p>{shippingAddress.name}</p>
            <p>{shippingAddress.address}</p>
            <p>{shippingAddress.postalCode} {shippingAddress.city}</p>
            <p>{shippingAddress.country}</p>
            {shippingAddress.phone && <p>{t('checkout.phone', 'Phone')}: {shippingAddress.phone}</p>}
            {shippingAddress.email && <p>{t('checkout.email', 'Email')}: {shippingAddress.email}</p>}
          </div>

          {shippingAddress.notes && (
            <div className="mt-2">
              <h4 className="font-medium">{t('checkout.orderNotes', 'Order Notes')}:</h4>
              <p className="text-gray-700">{shippingAddress.notes}</p>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="border-b pb-4">
          <h3 className="font-medium mb-3">{t('checkout.paymentMethod', 'Payment Method')}</h3>

          <p className="text-gray-700">
            {getPaymentMethodDisplay(paymentMethod)}
            {paymentMethod === 'credit_card' && stripePaymentId && (
              <span className="text-green-600 ml-2">
                ({t('checkout.paymentAuthorized', 'Payment authorized')})
              </span>
            )}
          </p>
        </div>

        {/* Order Total */}
        <div className="border-b pb-4">
          <div className="flex justify-between font-medium text-lg">
            <span>{t('checkout.total', 'Total')}:</span>
            <span>{cartTotal.toFixed(2)} {t('common.currency', 'EUR')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSubmitting}
          >
            {t('checkout.back', 'Back')}
          </button>

          <button
            type="button"
            onClick={handlePlaceOrder}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('checkout.processing', 'Processing...')}
              </span>
            ) : (
              t('checkout.placeOrder', 'Place Order')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
