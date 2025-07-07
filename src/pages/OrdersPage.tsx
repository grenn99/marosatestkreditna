import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { formatCurrency } from '../utils/formatters';
import { decryptObject, isEncrypted } from '../utils/encryption';

interface OrderItem {
  product_id: string;
  product_name: string;
  package_option_id?: string;
  package_description?: string;
  quantity: number;
  price_per_unit: number;
  line_total: number;
  image_url?: string; // Added image_url field
  is_gift?: boolean;
  gift_details?: string;
}

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_price: string;
  payment_method: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  notes?: string;
  user_id: string;
  profile_id: string;
  is_guest_order: boolean;
}

export function OrdersPage() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      navigate(`/checkout?lang=${i18n.language}`);
      return;
    }

    // Fetch orders
    const fetchOrders = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // First try to fetch orders by user_id
        let { data: userOrders, error: userOrdersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (userOrdersError) {
          console.error('Error fetching orders by user_id:', userOrdersError);
        }

        // If no orders found by user_id or there was an error, try to fetch by profile_id
        if (!userOrders || userOrders.length === 0) {
          // Get the user's profile ID first
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
          } else if (profileData) {
            // Try to fetch orders by profile_id
            const { data: profileOrders, error: profileOrdersError } = await supabase
              .from('orders')
              .select('*')
              .eq('profile_id', profileData.id)
              .order('created_at', { ascending: false });

            if (profileOrdersError) {
              console.error('Error fetching orders by profile_id:', profileOrdersError);
            } else {
              userOrders = profileOrders;
            }
          }
        }

        // If still no orders found, show an empty list
        if (!userOrders) {
          setOrders([]);
          setLoading(false);
          return;
        }

        // Process orders to parse JSON and decrypt encrypted fields
        const processedOrders = await Promise.all(userOrders.map(async (order) => {
          // Parse items JSON
          let parsedItems: OrderItem[] = [];
          try {
            parsedItems = typeof order.items === 'string'
              ? JSON.parse(order.items)
              : order.items || [];
          } catch (err) {
            console.error('Error parsing order items:', err);
          }

          // Parse shipping address JSON
          let parsedShippingAddress: ShippingAddress = {
            name: '',
            address: '',
            city: '',
            postalCode: '',
            country: 'Slovenija'
          };

          try {
            // First parse the JSON string
            parsedShippingAddress = typeof order.shipping_address === 'string'
              ? JSON.parse(order.shipping_address)
              : order.shipping_address || parsedShippingAddress;

            // Always attempt to decrypt all potentially encrypted fields
            const fieldsToDecrypt = ['name', 'address', 'phone', 'email'];

            // Log the shipping address before decryption (for debugging)
            console.log(`Order ${order.id} shipping address before decryption:`, {
              name: parsedShippingAddress.name?.substring(0, 20) + (parsedShippingAddress.name?.length > 20 ? '...' : ''),
              address: parsedShippingAddress.address?.substring(0, 20) + (parsedShippingAddress.address?.length > 20 ? '...' : ''),
              phone: parsedShippingAddress.phone?.substring(0, 20) + (parsedShippingAddress.phone?.length > 20 ? '...' : '')
            });

            // Decrypt fields
            parsedShippingAddress = await decryptObject(
              parsedShippingAddress,
              fieldsToDecrypt
            );

            // Log the shipping address after decryption (for debugging)
            console.log(`Order ${order.id} shipping address after decryption:`, {
              name: parsedShippingAddress.name,
              address: parsedShippingAddress.address,
              phone: parsedShippingAddress.phone
            });
          } catch (err) {
            console.error('Error processing shipping address:', err);
          }

          return {
            ...order,
            items: parsedItems,
            shipping_address: parsedShippingAddress
          };
        }));

        // Fetch product images and translations for all order items
        const enhancedOrders = await Promise.all(processedOrders.map(async (order) => {
          const itemsWithImages = await Promise.all(order.items.map(async (item) => {
            try {
              // Fetch product details to get the image URL and translations
              const { data: productData, error: productError } = await supabase
                .from('products')
                .select('image_url, name, name_en, name_de, name_hr')
                .eq('id', item.product_id)
                .single();

              if (productError) {
                console.error(`Error fetching product ${item.product_id}:`, productError);
                return item;
              }

              // Get translated product name based on current language
              const getTranslatedName = () => {
                if (!productData) return item.product_name;

                switch (i18n.language) {
                  case 'en':
                    return productData.name_en || productData.name || item.product_name;
                  case 'de':
                    return productData.name_de || productData.name || item.product_name;
                  case 'hr':
                    return productData.name_hr || productData.name || item.product_name;
                  case 'sl':
                  default:
                    return productData.name || item.product_name;
                }
              };

              return {
                ...item,
                image_url: productData?.image_url || undefined,
                translated_product_name: getTranslatedName()
              };
            } catch (err) {
              console.error(`Error processing product ${item.product_id}:`, err);
              return item;
            }
          }));

          return {
            ...order,
            items: itemsWithImages
          };
        }));

        setOrders(enhancedOrders);
      } catch (err) {
        console.error('Error in fetchOrders:', err);
        setError(t('orders.fetchError', 'Failed to load orders'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, authLoading, navigate, i18n.language, t]);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-green-200 text-green-900';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    // Use custom formatting for Slovenian
    if (i18n.language === 'sl') {
      const day = date.getDate();
      const month = date.toLocaleString('sl', { month: 'long' });
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${day}. ${month} ${year} ${t('orders.dateFormat.at')} ${hours}:${minutes}`;
    }

    // Default formatting for other languages
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusTranslation = (status: string) => {
    const statusKey = `orders.statuses.${status.toLowerCase()}`;
    return t(statusKey, status); // Fallback to the original status if translation not found
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('orders.myOrders', 'My Orders')}</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {t('orders.noOrders', 'You have no orders yet.')}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {orders.map(order => (
              <div key={order.id} className="divide-y divide-gray-100">
                <div
                  onClick={() => toggleOrderDetails(order.id)}
                  className="p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {t('orders.orderNumber', 'Order')} #{order.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                        {getStatusTranslation(order.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      {formatCurrency(parseFloat(order.total_price))}
                    </span>
                    <svg
                      className={`h-5 w-5 text-gray-400 transition-transform ${expandedOrderId === order.id ? 'transform rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {expandedOrderId === order.id && (
                  <div className="p-4 bg-gray-50">
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">{t('orders.shippingInfo', 'Shipping Information')}</h3>
                      <div className="text-sm text-gray-600">
                        <p>{order.shipping_address.name}</p>
                        <p>{order.shipping_address.address}</p>
                        <p>{order.shipping_address.postalCode} {order.shipping_address.city}</p>
                        <p>{order.shipping_address.country}</p>
                        {order.shipping_address.phone && <p>{order.shipping_address.phone}</p>}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-medium mb-2">{t('orders.paymentMethod', 'Payment Method')}</h3>
                      <div className="text-sm text-gray-600">
                        {order.payment_method === 'pay_on_delivery' || order.payment_method === 'cod' || order.payment_method === 'cash_on_delivery'
                          ? t('orders.paymentMethods.cash_on_delivery', 'Plačilo po povzetju')
                          : order.payment_method === 'bank_transfer'
                          ? t('orders.paymentMethods.bank_transfer', 'Bančno nakazilo')
                          : order.payment_method}
                      </div>
                    </div>

                    <h3 className="font-medium mb-2">{t('orders.orderItems', 'Order Items')}</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('orders.product', 'Product')}
                            </th>
                            <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('orders.price', 'Price')}
                            </th>
                            <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('orders.quantity', 'Qty')}
                            </th>
                            <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('orders.total', 'Total')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {order.items.map((item, index) => (
                            <tr key={`${order.id}-item-${index}`} className={item.is_gift ? "bg-amber-50" : ""}>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                <div className="flex items-start">
                                  {/* Product Image */}
                                  <div className="flex-shrink-0 h-12 w-12 mr-3 relative">
                                    {item.image_url ? (
                                      <>
                                        <img
                                          src={item.image_url}
                                          alt={item.translated_product_name || item.product_name}
                                          className="h-12 w-12 object-cover rounded-md border border-gray-200"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/images/placeholder-product.svg';
                                          }}
                                        />
                                        {item.is_gift && (
                                          <div className="absolute -top-2 -right-2 bg-amber-500 rounded-full p-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                              <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17A3 3 0 015 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                                              <path d="M9 11H3v5a2 2 0 002 2h4v-7zm2 7h4a2 2 0 002-2v-5h-6v7z" />
                                            </svg>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <div className="h-12 w-12 bg-gray-100 flex items-center justify-center rounded-md border border-gray-200">
                                        <span className="text-xs text-gray-400">No Image</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Product Name and Package */}
                                  <div>
                                    <div className={`font-medium ${item.is_gift ? "text-amber-700" : ""}`}>
                                      {item.translated_product_name || item.product_name}
                                    </div>
                                    {item.package_description && (
                                      <div className={`text-xs mt-1 ${item.is_gift ? "text-amber-600" : "text-gray-500"} whitespace-pre-line`}>
                                        {item.package_description}
                                      </div>
                                    )}
                                    {item.is_gift && item.gift_details && (
                                      <div className="mt-2">
                                        <details className="text-xs">
                                          <summary className="cursor-pointer font-medium text-amber-700 hover:text-amber-800">
                                            {t('orders.viewGiftContents', 'View Gift Contents')}
                                          </summary>
                                          <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded">
                                            {(() => {
                                              try {
                                                const giftDetails = JSON.parse(item.gift_details);
                                                return (
                                                  <div>
                                                    {giftDetails.gift_products && giftDetails.gift_products.length > 0 ? (
                                                      <div>
                                                        <div className="font-medium mb-1">{t('orders.giftContents', 'Gift Contents')}:</div>
                                                        <ul className="list-disc pl-4 space-y-1">
                                                          {giftDetails.gift_products.map((product: any, idx: number) => (
                                                            <li key={idx} className="text-amber-800">
                                                              <span className="font-medium">{product.name}</span>
                                                              <span className="text-amber-600"> × {product.quantity}</span>
                                                            </li>
                                                          ))}
                                                        </ul>
                                                      </div>
                                                    ) : (
                                                      <div className="text-amber-700">{t('orders.noProducts', 'No products in gift')}</div>
                                                    )}

                                                    {giftDetails.recipient_name && (
                                                      <div className="mt-2">
                                                        <span className="font-medium">{t('orders.recipient', 'Recipient')}:</span> {giftDetails.recipient_name}
                                                      </div>
                                                    )}

                                                    {giftDetails.recipient_message && (
                                                      <div className="mt-1">
                                                        <span className="font-medium">{t('orders.message', 'Message')}:</span> {giftDetails.recipient_message}
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              } catch (e) {
                                                console.error("Failed to parse gift details", e);
                                                return <div className="text-red-500">Error parsing gift details</div>;
                                              }
                                            })()}
                                          </div>
                                        </details>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                                {formatCurrency(item.price_per_unit)}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                {formatCurrency(item.line_total)}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-gray-50">
                            <td colSpan={3} className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                              {t('orders.totalAmount', 'Total Amount')}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                              {formatCurrency(parseFloat(order.total_price))}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
