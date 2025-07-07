/**
 * Custom hook for analytics tracking
 * 
 * This hook provides functions for tracking page views, events, and errors
 * It stores analytics data in Supabase database and can also integrate with external services
 */

import { useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Event categories
export enum EventCategory {
  ECOMMERCE = 'ecommerce',
  ENGAGEMENT = 'engagement',
  NAVIGATION = 'navigation',
  SEARCH = 'search',
  ERROR = 'error'
}

// Event actions
export enum EventAction {
  // Ecommerce
  VIEW_PRODUCT = 'view_product',
  ADD_TO_CART = 'add_to_cart',
  REMOVE_FROM_CART = 'remove_from_cart',
  BEGIN_CHECKOUT = 'begin_checkout',
  PURCHASE = 'purchase',
  
  // Engagement
  CLICK = 'click',
  SCROLL = 'scroll',
  VIEW_IMAGE = 'view_image',
  
  // Navigation
  PAGE_VIEW = 'page_view',
  INTERNAL_LINK_CLICK = 'internal_link_click',
  EXTERNAL_LINK_CLICK = 'external_link_click',
  
  // Search
  SEARCH = 'search',
  FILTER = 'filter',
  
  // Error
  ERROR = 'error'
}

// Analytics event interface
export interface AnalyticsEvent {
  category: EventCategory;
  action: EventAction;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

/**
 * Get or create a session ID for tracking
 * This allows us to track unique visitors without storing personal data
 */
const getOrCreateSessionId = (): string => {
  const storageKey = 'kmetija_marosa_session_id';
  let sessionId = localStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
};

/**
 * Get the user ID if the user is logged in
 */
const getUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || null;
};

/**
 * Hook for tracking analytics events
 */
export function useAnalytics() {
  /**
   * Track a page view
   * 
   * @param path The path of the page
   * @param title The title of the page
   * @param metadata Additional metadata about the page view
   */
  const trackPageView = useCallback(async (path: string, title: string, metadata?: Record<string, any>) => {
    try {
      console.log(`[Analytics] Page view: ${path} - ${title}`, metadata);
      
      // Store in Supabase
      const sessionId = getOrCreateSessionId();
      const { error } = await supabase.from('analytics_events').insert({
        event_type: 'page_view',
        category: EventCategory.NAVIGATION,
        action: EventAction.PAGE_VIEW,
        label: title,
        url: path,
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        session_id: sessionId,
        metadata
      });
      
      if (error) {
        console.error('[Analytics] Error saving page view:', error);
      }
      
      // Check if Google Analytics is available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'page_view', {
          page_path: path,
          page_title: title,
          ...metadata
        });
      }
    } catch (error) {
      console.error('[Analytics] Error tracking page view:', error);
    }
  }, []);
  
  /**
   * Track an event
   * 
   * @param event The event to track
   */
  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      const { category, action, label, value, metadata } = event;
      
      console.log(`[Analytics] Event: ${category} - ${action} - ${label} - ${value}`, metadata);
      
      // Store in Supabase
      const sessionId = getOrCreateSessionId();
      const { error } = await supabase.from('analytics_events').insert({
        event_type: 'event',
        category,
        action,
        label,
        value,
        url: typeof window !== 'undefined' ? window.location.href : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        session_id: sessionId,
        metadata
      });
      
      if (error) {
        console.error('[Analytics] Error saving event:', error);
      }
      
      // Check if Google Analytics is available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', action, {
          event_category: category,
          event_label: label,
          value,
          ...metadata
        });
      }
    } catch (error) {
      console.error('[Analytics] Error tracking event:', error);
    }
  }, []);
  
  /**
   * Track an ecommerce event
   * 
   * @param action The ecommerce action
   * @param productId The product ID
   * @param productName The product name
   * @param price The product price
   * @param quantity The quantity
   * @param metadata Additional metadata
   */
  const trackEcommerceEvent = useCallback(async (action: EventAction, productId?: string | number, productName?: string, price?: number, quantity: number = 1, metadata?: Record<string, any>) => {
    try {
      console.log(`[Analytics] Ecommerce: ${action} - ${productId} - ${productName} - ${price} - ${quantity}`, metadata);
      
      // Store in Supabase
      const sessionId = getOrCreateSessionId();
      const { error } = await supabase.from('analytics_events').insert({
        event_type: 'ecommerce',
        category: EventCategory.ECOMMERCE,
        action,
        label: productName,
        value: price,
        url: typeof window !== 'undefined' ? window.location.href : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        session_id: sessionId,
        metadata: {
          ...metadata,
          product_id: productId,
          product_name: productName,
          price,
          quantity
        }
      });
      
      if (error) {
        console.error('[Analytics] Error saving ecommerce event:', error);
      }
      
      // Update daily metrics for product views
      if (action === EventAction.VIEW_PRODUCT && productId) {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // First check if we have a record for today
        const { data: existingData } = await supabase
          .from('analytics_daily_metrics')
          .select('id, product_views')
          .eq('date', today)
          .single();
        
        if (existingData) {
          // Update existing record
          const productViews = existingData.product_views || {};
          const productIdStr = String(productId);
          productViews[productIdStr] = (productViews[productIdStr] || 0) + 1;
          
          await supabase
            .from('analytics_daily_metrics')
            .update({ 
              product_views: productViews,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingData.id);
        } else {
          // Create new record for today
          const productIdStr = String(productId);
          await supabase
            .from('analytics_daily_metrics')
            .insert({
              date: today,
              page_views: 1,
              unique_visitors: 1,
              product_views: { [productIdStr]: 1 },
              add_to_cart_events: 0,
              checkout_starts: 0,
              purchases: 0
            });
        }
      }
      
      // Check if Google Analytics is available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', action, {
          event_category: EventCategory.ECOMMERCE,
          event_label: productName,
          value: price,
          product_id: productId,
          product_name: productName,
          price,
          quantity,
          ...metadata
        });
      }
    } catch (error) {
      console.error('[Analytics] Error tracking ecommerce event:', error);
    }
  }, []);
  
  /**
   * Track an error
   * 
   * @param error The error object or message
   * @param source The source of the error
   * @param metadata Additional metadata about the error
   */
  const trackError = useCallback((
    error: Error | string,
    source: string,
    metadata?: Record<string, any>
  ) => {
    const errorMessage = error instanceof Error ? error.message : error;
    
    trackEvent({
      category: EventCategory.ERROR,
      action: EventAction.ERROR,
      label: `${source}: ${errorMessage}`,
      metadata: {
        ...metadata,
        stack: error instanceof Error ? error.stack : undefined
      }
    });
  }, [trackEvent]);
  
  return {
    trackPageView,
    trackEvent,
    trackEcommerceEvent,
    trackError
  };
}

// Add TypeScript interface for window.gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    toast?: {
      success: (message: string) => void;
      error: (message: string) => void;
      warning: (message: string) => void;
      info: (message: string) => void;
    };
  }
}
