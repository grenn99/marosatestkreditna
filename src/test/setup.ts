import { vi } from 'vitest';

// Mock the i18next library
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      // Return the key as the translation for testing
      if (options) {
        return `${key} ${JSON.stringify(options)}`;
      }
      return key;
    },
    i18n: {
      changeLanguage: vi.fn(),
      language: 'sl'
    }
  }),
  Trans: ({ children }: { children: any }) => children,
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

// Mock Supabase client
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation(cb => cb({ data: [], error: null })),
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn(),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/image.jpg' } }),
      }),
    },
  },
}));

// Mock DOM globals for Node environment
global.window = global.window || {
  location: {
    origin: 'https://marosakreditna.netlify.app',
  },
  matchMedia: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
};

global.document = global.document || {
  createElement: vi.fn(),
  querySelector: vi.fn(),
};

// Mock fetch for validateImageUrl
global.fetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes('valid-image')) {
    return Promise.resolve({
      ok: true,
      headers: {
        get: () => 'image/jpeg',
      },
    });
  }
  if (url.includes('invalid-image')) {
    return Promise.resolve({
      ok: false,
      headers: {
        get: () => null,
      },
    });
  }
  // Default response for other URLs
  return Promise.resolve({
    ok: true,
    headers: {
      get: () => 'image/jpeg',
    },
  });
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback: any) {
    this.callback = callback;
  }

  callback: any;

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock Stripe
vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: any }) => children,
  useStripe: vi.fn().mockReturnValue({
    createPaymentMethod: vi.fn().mockResolvedValue({ paymentMethod: { id: 'pm_123' }, error: null }),
  }),
  useElements: vi.fn().mockReturnValue({
    getElement: vi.fn(),
  }),
  CardElement: () => null,
}));

// Mock environment variables
vi.stubGlobal('import.meta', {
  env: {
    VITE_SUPABASE_URL: 'https://example.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
    DEV: true,
  },
});
