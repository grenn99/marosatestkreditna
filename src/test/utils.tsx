import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

// Custom render function that includes providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const AllProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  };
  
  return render(ui, { wrapper: AllProviders, ...options });
}

// Mock authenticated user
export const mockAuthenticatedUser = {
  id: 'user-123',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
  },
};

// Mock product data
export const mockProducts = [
  {
    id: 1,
    name: 'Test Product 1',
    description: 'This is a test product',
    price: 10.99,
    image_url: '/images/test-product-1.jpg',
    category: 'test',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    stock: 10,
    packages: [
      { amount: '100g', price: 10.99 },
      { amount: '250g', price: 24.99 },
    ],
    translations: {
      sl: {
        name: 'Testni izdelek 1',
        description: 'To je testni izdelek',
      },
    },
  },
  {
    id: 2,
    name: 'Test Product 2',
    description: 'This is another test product',
    price: 15.99,
    image_url: '/images/test-product-2.jpg',
    category: 'test',
    created_at: '2023-01-02T00:00:00.000Z',
    updated_at: '2023-01-02T00:00:00.000Z',
    stock: 5,
    packages: [
      { amount: '100g', price: 15.99 },
      { amount: '250g', price: 35.99 },
    ],
    translations: {
      sl: {
        name: 'Testni izdelek 2',
        description: 'To je še en testni izdelek',
      },
    },
  },
];

// Mock cart items
export const mockCartItems = [
  {
    id: 1,
    name: 'Test Product 1',
    price: 10.99,
    quantity: 2,
    image_url: '/images/test-product-1.jpg',
    package: '100g',
  },
];

// Mock orders
export const mockOrders = [
  {
    id: 'order-123',
    user_id: 'user-123',
    status: 'completed',
    total: 21.98,
    created_at: '2023-01-01T00:00:00.000Z',
    items: mockCartItems,
    shipping_address: {
      name: 'Test User',
      street: '123 Test St',
      city: 'Test City',
      postal_code: '12345',
      country: 'Test Country',
    },
  },
];
