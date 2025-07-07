import React, { useState } from 'react';
import { sendOrderConfirmationEmail } from '../utils/emailService';
import { useTranslation } from 'react-i18next';

export const EmailTestPage: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

  // Generate a mock order ID
  const generateOrderId = () => {
    return 'test-' + Math.random().toString(36).substring(2, 10);
  };

  // Generate mock order items
  const generateMockItems = () => {
    return [
      {
        product_name: 'Jabolčni sok',
        package_description: '1L steklenica',
        quantity: 2,
        price_per_unit: 3.5,
        line_total: 7.0
      },
      {
        product_name: 'Domači med',
        package_description: '500g kozarec',
        quantity: 1,
        price_per_unit: 8.9,
        line_total: 8.9
      },
      {
        product_name: 'Suhe hruške',
        package_description: '250g vrečka',
        quantity: 3,
        price_per_unit: 4.2,
        line_total: 12.6
      }
    ];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      setResult({
        success: false,
        message: 'Prosimo, vnesite ime in e-poštni naslov.'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Create mock order details
      const mockOrderId = generateOrderId();
      const mockItems = generateMockItems();
      const mockTotal = mockItems.reduce((sum, item) => sum + item.line_total, 0);
      
      // Create mock shipping address
      const mockShippingAddress = {
        name: name,
        address: 'Testna ulica 123',
        city: 'Ljubljana',
        postalCode: '1000',
        country: 'Slovenija',
        phone: '041 123 456',
        email: email
      };

      // Send test email
      const result = await sendOrderConfirmationEmail(
        mockOrderId,
        email,
        name,
        {
          items: mockItems,
          total: mockTotal,
          shippingAddress: mockShippingAddress,
          paymentMethod: paymentMethod
        }
      );

      setResult(result);
    } catch (error) {
      console.error('Error sending test email:', error);
      setResult({
        success: false,
        message: `Napaka pri pošiljanju: ${error instanceof Error ? error.message : 'Neznana napaka'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Test pošiljanja e-pošte</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Ime prejemnika
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              placeholder="Vnesite ime"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              E-poštni naslov
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              placeholder="Vnesite e-poštni naslov"
              required
            />
          </div>

          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-brown-600 hover:text-brown-800 text-sm font-medium"
            >
              {showAdvanced ? '- Skrij napredne nastavitve' : '+ Prikaži napredne nastavitve'}
            </button>
            
            {showAdvanced && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Način plačila
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="bank_transfer"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={() => setPaymentMethod('bank_transfer')}
                        className="mr-2"
                      />
                      <label htmlFor="bank_transfer">Bančno nakazilo</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="pay_on_delivery"
                        name="paymentMethod"
                        value="pay_on_delivery"
                        checked={paymentMethod === 'pay_on_delivery'}
                        onChange={() => setPaymentMethod('pay_on_delivery')}
                        className="mr-2"
                      />
                      <label htmlFor="pay_on_delivery">Plačilo po povzetju</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="credit_card"
                        name="paymentMethod"
                        value="credit_card"
                        checked={paymentMethod === 'credit_card'}
                        onChange={() => setPaymentMethod('credit_card')}
                        className="mr-2"
                      />
                      <label htmlFor="credit_card">Kreditna kartica</label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 bg-brown-600 text-white rounded-md font-medium ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brown-700'
              }`}
            >
              {loading ? 'Pošiljanje...' : 'Pošlji testno e-pošto'}
            </button>
          </div>
        </form>

        {result && (
          <div className={`mt-6 p-4 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p className="font-medium">{result.success ? 'Uspeh!' : 'Napaka!'}</p>
            <p>{result.message}</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-4">O tej strani</h2>
          <p className="text-gray-700">
            Ta stran je namenjena testiranju pošiljanja e-poštnih sporočil za potrditev naročila. 
            Vnesite e-poštni naslov in ime, da prejmete testno e-pošto s potrditvijo naročila.
            Testno naročilo bo vsebovalo naključne izdelke in podatke.
          </p>
          <p className="text-gray-700 mt-2">
            E-poštno sporočilo bo poslano na vneseni e-poštni naslov in na e-poštni naslov administratorja.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailTestPage;
