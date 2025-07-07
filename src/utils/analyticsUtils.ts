import { supabase } from '../lib/supabaseClient';

/**
 * Aggregates raw analytics events into daily metrics
 * This function can be called periodically to update the analytics_daily_metrics table
 */
export async function aggregateAnalyticsData() {
  try {
    // Get the date for yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    
    // Check if we already have metrics for this date
    const { data: existingMetrics, error: checkError } = await supabase
      .from('analytics_daily_metrics')
      .select('*')
      .eq('date', dateStr);
      
    if (checkError) {
      console.error('Error checking existing metrics:', checkError);
      return false;
    }
    
    if (existingMetrics && existingMetrics.length > 0) {
      console.log(`Metrics for ${dateStr} already exist, skipping aggregation`);
      return true;
    }
    
    // Get start and end of the day
    const startOfDay = new Date(dateStr);
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Fetch all events for the day
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());
    
    if (error) throw error;
    
    if (!events || events.length === 0) {
      console.log(`No events found for ${dateStr}, skipping aggregation`);
      return;
    }
    
    // Count unique visitors (unique session IDs)
    const uniqueVisitors = new Set(events.map(event => event.session_id)).size;
    
    // Count page views
    const pageViews = events.filter(event => event.event_type === 'page_view').length;
    
    // Count product views
    const productViews = events.filter(event => event.event_type === 'product_view').length;
    
    // Count add to cart events
    const addToCartEvents = events.filter(event => event.event_type === 'add_to_cart').length;
    
    // Count checkout events
    const checkoutEvents = events.filter(event => event.event_type === 'checkout').length;
    
    // Count purchase events
    const purchaseEvents = events.filter(event => event.event_type === 'purchase').length;
    
    // Calculate bounce rate (single page visits / total visits)
    const sessions: Record<string, number> = {};
    events.filter(event => event.event_type === 'page_view').forEach(event => {
      const sessionId = event.session_id;
      sessions[sessionId] = (sessions[sessionId] || 0) + 1;
    });
    
    const singlePageSessions = Object.values(sessions).filter(pageCount => pageCount === 1).length;
    const totalSessions = Object.keys(sessions).length || 1; // Avoid division by zero
    const bounceRate = Math.round((singlePageSessions / totalSessions) * 100);
    
    // Calculate conversion rate (purchases / unique visitors)
    const conversionRate = uniqueVisitors > 0 
      ? Math.round((purchaseEvents / uniqueVisitors) * 100) 
      : 0;
    
    // Insert aggregated metrics
    const { error: insertError } = await supabase
      .from('analytics_daily_metrics')
      .insert({
        date: dateStr,
        unique_visitors: uniqueVisitors,
        page_views: pageViews,
        product_views: productViews,
        add_to_cart_events: addToCartEvents,
        checkout_events: checkoutEvents,
        purchase_events: purchaseEvents,
        bounce_rate: bounceRate,
        conversion_rate: conversionRate
      });
    
    if (insertError) throw insertError;
    
    console.log(`Successfully aggregated metrics for ${dateStr}`);
    return true;
  } catch (error) {
    console.error('Error aggregating analytics data:', error);
    return false;
  }
}

/**
 * Calculates the change percentage between two numbers
 */
export function calculateChangePercentage(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Gets analytics data for a specific date range
 */
export async function getAnalyticsData(dateRange: 'today' | '7days' | '30days' | '90days') {
  // Get date range
  const today = new Date();
  let startDate = new Date();
  
  if (dateRange === '7days') {
    startDate.setDate(today.getDate() - 7);
  } else if (dateRange === '30days') {
    startDate.setDate(today.getDate() - 30);
  } else if (dateRange === '90days') {
    startDate.setDate(today.getDate() - 90);
  } else {
    // Today
    startDate = new Date(today.setHours(0, 0, 0, 0));
  }
  
  const startDateStr = startDate.toISOString().split('T')[0];
  
  // Fetch daily metrics
  const { data: metrics, error } = await supabase
    .from('analytics_daily_metrics')
    .select('*')
    .gte('date', startDateStr)
    .order('date', { ascending: true });
    
  if (error) {
    console.error('Error fetching analytics metrics:', error);
    return [];
  }
  
  return metrics || [];
}

/**
 * Gets real-time analytics data for today
 * This is used when daily metrics for today haven't been aggregated yet
 */
export async function getRealTimeAnalytics() {
  // Get start of today
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  
  // Fetch all events for today
  const { data: events, error } = await supabase
    .from('analytics_events')
    .select('*')
    .gte('created_at', startOfDay.toISOString());
  
  if (error) throw error;
  
  if (!events || events.length === 0) {
    return {
      unique_visitors: 0,
      page_views: 0,
      product_views: 0,
      add_to_cart_events: 0,
      checkout_events: 0,
      purchase_events: 0,
      bounce_rate: 0,
      conversion_rate: 0
    };
  }
  
  // Count unique visitors (unique session IDs)
  const uniqueVisitors = new Set(events.map(event => event.session_id)).size;
  
  // Count page views
  const pageViews = events.filter(event => event.event_type === 'page_view').length;
  
  // Count product views
  const productViews = events.filter(event => event.event_type === 'product_view').length;
  
  // Count add to cart events
  const addToCartEvents = events.filter(event => event.event_type === 'add_to_cart').length;
  
  // Count checkout events
  const checkoutEvents = events.filter(event => event.event_type === 'checkout').length;
  
  // Count purchase events
  const purchaseEvents = events.filter(event => event.event_type === 'purchase').length;
  
  // Calculate bounce rate (single page visits / total visits)
  const sessions: Record<string, number> = {};
  events.filter(event => event.event_type === 'page_view').forEach(event => {
    const sessionId = event.session_id;
    sessions[sessionId] = (sessions[sessionId] || 0) + 1;
  });
  
  const singlePageSessions = Object.values(sessions).filter(pageCount => pageCount === 1).length;
  const totalSessions = Object.keys(sessions).length || 1; // Avoid division by zero
  const bounceRate = Math.round((singlePageSessions / totalSessions) * 100);
  
  // Calculate conversion rate (purchases / unique visitors)
  const conversionRate = uniqueVisitors > 0 
    ? Math.round((purchaseEvents / uniqueVisitors) * 100) 
    : 0;
  
  return {
    unique_visitors: uniqueVisitors,
    page_views: pageViews,
    product_views: productViews,
    add_to_cart_events: addToCartEvents,
    checkout_events: checkoutEvents,
    purchase_events: purchaseEvents,
    bounce_rate: bounceRate,
    conversion_rate: conversionRate
  };
}
