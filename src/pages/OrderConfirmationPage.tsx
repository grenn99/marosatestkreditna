import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';

interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
  name: string;
  package_name: string;
}

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface Order {
  id: string;
  created_at: string;
  total_price: number;
  status: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  notes?: string;
  payment_method: string;
}

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error) throw error;

        if (data) {
          const parsedOrder = {
            ...data,
            items: JSON.parse(data.items),
            shipping_address: JSON.parse(data.shipping_address)
          };
          setOrder(parsedOrder);
        }
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(t('orders.fetchError', 'Error loading order details'));
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, t]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 text-lg font-semibold mb-2">
            {t('orders.error', 'Error')}
          </h2>
          <p className="text-red-700">{error || t('orders.notFound', 'Order not found')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <div className="flex items-center mb-4">
          <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="text-lg font-semibold text-green-800">
            {t('checkout.orderSuccess', 'Order placed successfully!')}
          </h2>
        </div>

        <div className="mb-6">
          <p className="text-green-700 mb-2">
            {t('orders.orderNumber', 'Order Number')}: <span className="font-medium">{order.id}</span>
          </p>
          <p className="text-green-700">
            {t('orders.totalAmount', 'Total Amount')}: <span className="font-medium">{order.total_price.toFixed(2)} €</span>
          </p>
        </div>

        <div className="border-t border-green-200 pt-4 mb-6">
          <h3 className="font-medium text-green-800 mb-3">{t('orders.items', 'Order Items')}:</h3>
          <ul className="space-y-2">
            {order.items.map((item, index) => (
              <li key={index} className="text-green-700">
                {item.name} - {item.package_name} × {item.quantity}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-green-200 pt-4 mb-6">
          <h3 className="font-medium text-green-800 mb-3">{t('orders.shippingAddress', 'Shipping Address')}:</h3>
          <div className="text-green-700">
            <p>{order.shipping_address.name}</p>
            <p>{order.shipping_address.address}</p>
            <p>{order.shipping_address.postalCode} {order.shipping_address.city}</p>
            <p>{order.shipping_address.country}</p>
          </div>
        </div>

        <div className="border-t border-green-200 pt-4">
          <h3 className="font-medium text-green-800 mb-3">{t('orders.orderDetails', 'Order Details')}:</h3>
          <div className="text-green-700">
            <p>{t('orders.status', 'Status')}: {t(`orders.statuses.${order.status}`, order.status)}</p>
            <p>{t('orders.paymentMethod', 'Payment Method')}: {t(`orders.paymentMethods.${order.payment_method}`, order.payment_method)}</p>
            {(() => {
              // Clean customer notes by removing system-generated brackets
              const cleanNotes = order.notes?.replace(
                /\[(Subtotal|Vmesna vsota): €[0-9.]+\]|\[(Shipping|Poštnina): €[0-9.]+\]|\[(Free Shipping|Brezplačna dostava)\]|\[Gift Option ID: [^\]]+\]|\[Gift Message: [^\]]+\]|\[GIFT_ADDRESS_JSON: [^\]]+\]|\[Stripe Payment ID: [^\]]+\]/g,
                ''
              ).trim();

              return cleanNotes && (
                <p>{t('orders.notes', 'Your Notes')}: {cleanNotes}</p>
              );
            })()}
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brown-600 hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500"
          >
            {t('orders.continueShopping', 'Continue Shopping')}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 border border-brown-600 rounded-md shadow-sm text-sm font-medium text-brown-600 bg-white hover:bg-brown-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500"
          >
            {t('orders.print', 'Print Order')}
          </button>
        </div>
      </div>
    </div>
  );
};
