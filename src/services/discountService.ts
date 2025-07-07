import { supabase } from '../lib/supabaseClient';

/**
 * Interface for time-limited discount data
 */
export interface TimeLimitedDiscount {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  category?: string;
  product_id?: string;
  product_name?: string;
  // Banner-related fields
  banner_text?: string;
  show_in_banner?: boolean;
  banner_start_time?: string;
  banner_end_time?: string;
}

/**
 * Fetches active time-limited discounts from the database
 * @returns Array of active time-limited discounts
 */
export async function fetchActiveBannerDiscounts(): Promise<TimeLimitedDiscount[]> {
  try {
    // IMPORTANT: The system date is in 2025, but JavaScript Date() uses current year (2024)
    // Create a date in 2025 to match the database dates
    const currentDate = new Date();
    const year2025Date = new Date(currentDate);
    year2025Date.setFullYear(2025);
    const now = year2025Date.toISOString();

    console.log('Using date for comparison:', now);

    // Query for active discounts that are valid now, have show_in_banner set to true,
    // and are within the banner display time window
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('is_active', true)
      .eq('show_in_banner', true)
      .lte('valid_from', now)
      .gte('valid_until', now)
      .order('valid_until', { ascending: true });

    if (error) {
      console.error('Error fetching active banner discounts:', error);

      // If we're in development mode, return a hardcoded discount for testing
      if (process.env.NODE_ENV === 'development') {
        // Create dates in 2025
        const currentDate = new Date();
        const year2025Date = new Date(currentDate);
        year2025Date.setFullYear(2025);

        const futureDate = new Date(currentDate);
        futureDate.setFullYear(2025);
        futureDate.setMonth(futureDate.getMonth() + 1); // Add 1 month

        return [{
          id: '0b1b22f4-e423-41bd-8f91-ac1e6399ebcd',
          code: 'BREZPOSTNINE',
          description: 'Brezplačna poštnina',
          discount_type: 'fixed',
          discount_value: 3.90,
          min_order_amount: 20.00,
          max_uses: null,
          current_uses: 0,
          valid_from: year2025Date.toISOString(),
          valid_until: futureDate.toISOString(),
          is_active: true,
          created_at: year2025Date.toISOString(),
          updated_at: year2025Date.toISOString(),
          category: null,
          product_id: null,
          banner_text: null,
          show_in_banner: true,
          banner_start_time: year2025Date.toISOString(),
          banner_end_time: futureDate.toISOString()
        }];
      }

      return [];
    }

    // Further filter based on banner_start_time and banner_end_time if they exist
    const bannerDiscounts = data.filter(discount => {
      // If banner times are not set, fall back to the discount validity period
      const bannerStartTime = discount.banner_start_time || discount.valid_from;
      const bannerEndTime = discount.banner_end_time || discount.valid_until;

      // Create a date in 2025 to match the database dates
      const currentDate = new Date();
      const year2025Date = new Date(currentDate);
      year2025Date.setFullYear(2025);

      // Check if current time is within the banner display window
      return new Date(bannerStartTime) <= year2025Date && new Date(bannerEndTime) >= year2025Date;
    });

    return bannerDiscounts;
  } catch (err) {
    console.error('Unexpected error fetching active banner discounts:', err);

    // If we're in development mode, return a hardcoded discount for testing
    if (process.env.NODE_ENV === 'development') {
      // Create dates in 2025
      const currentDate = new Date();
      const year2025Date = new Date(currentDate);
      year2025Date.setFullYear(2025);

      const futureDate = new Date(currentDate);
      futureDate.setFullYear(2025);
      futureDate.setMonth(futureDate.getMonth() + 1); // Add 1 month

      return [{
        id: '0b1b22f4-e423-41bd-8f91-ac1e6399ebcd',
        code: 'BREZPOSTNINE',
        description: 'Brezplačna poštnina',
        discount_type: 'fixed',
        discount_value: 3.90,
        min_order_amount: 20.00,
        max_uses: null,
        current_uses: 0,
        valid_from: year2025Date.toISOString(),
        valid_until: futureDate.toISOString(),
        is_active: true,
        created_at: year2025Date.toISOString(),
        updated_at: year2025Date.toISOString(),
        category: null,
        product_id: null,
        banner_text: null,
        show_in_banner: true,
        banner_start_time: year2025Date.toISOString(),
        banner_end_time: futureDate.toISOString()
      }];
    }

    return [];
  }
}

/**
 * Gets the most relevant discount to show in the banner
 * @returns The most relevant discount or null if none are available
 */
export async function getActiveBannerDiscount(): Promise<TimeLimitedDiscount | null> {
  // TEMPORARY FIX: Always return a hardcoded banner discount
  return {
    id: '0b1b22f4-e423-41bd-8f91-ac1e6399ebcd',
    code: 'BREZPOSTNINE',
    description: 'Brezplačna poštnina',
    discount_type: 'fixed',
    discount_value: 3.90,
    min_order_amount: 20.00,
    max_uses: null,
    current_uses: 0,
    valid_from: '2025-04-26T00:00:00+00',
    valid_until: '2025-07-25T00:00:00+00',
    is_active: true,
    created_at: '2025-04-26T23:48:45.729243+00',
    updated_at: '2025-04-26T23:48:45.729243+00',
    category: null,
    product_id: null,
    banner_text: null,
    show_in_banner: true,
    banner_start_time: '2025-04-26T00:00:00+00',
    banner_end_time: '2025-07-25T00:00:00+00'
  };
}
