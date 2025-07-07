import { PackageOption } from '../types';

// Define RecipientAddress interface
export interface RecipientAddress {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

// Define checkout form data interface
export interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes: string;
  password: string;
  confirmPassword: string;
}

// Define checkout display item interface
export interface CheckoutDisplayItem {
  id: string;
  created_at: string;
  name: string;
  name_en: string;
  name_de: string;
  name_hr: string;
  description: string;
  description_en: string;
  description_de: string;
  description_hr: string;
  image_url: string;
  stock_quantity: number;
  category: string;
  package_options: PackageOption[];
  packageOption: PackageOption;
  quantity: number;
  isGift?: boolean;
  giftDetails?: any;
}

// Define postal code suggestion interface
export interface PostalCodeSuggestion {
  code: string;
  city: string;
}

// Define states for the overall checkout flow
export type CheckoutStep = 'selection' | 'guest_form' | 'auth_form' | 'registration_form';

// Define states for auth flow within checkout (when 'auth_form' is active)
export type AuthSubState = 'initial' | 'login' | 'signup' | 'loggedIn';

// Define order item interface
export interface OrderItem {
  product_id: string;
  product_name: string;
  package_option_id: string;
  package_description: string;
  quantity: number;
  price_per_unit: number;
  line_total: number;
  is_gift: boolean;
  gift_details: string | null;
}

// Define discount interface
export interface Discount {
  type: 'percentage' | 'fixed';
  value: number;
  code: string;
}
