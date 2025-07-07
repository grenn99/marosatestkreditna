import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';

interface AnalyticsData {
  visitors: {
    total: number;
    change: number;
    data: number[];
  };
  pageViews: {
    total: number;
    change: number;
    data: number[];
  };
  bounceRate: {
    rate: number;
    change: number;
  };
  conversionRate: {
    rate: number;
    change: number;
  };
  topPages: Array<{
    path: string;
    title: string;
    views: number;
  }>;
  topReferrers: Array<{
    source: string;
    visits: number;
  }>;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    views: number;
  }>;
  isMockData?: boolean;
}

interface AnalyticsDashboardProps {
  className?: string;
  dateRange?: 'today' | '7days' | '30days' | '90days';
  setDateRange?: (range: 'today' | '7days' | '30days' | '90days') => void;
}

/**
 * Component to display analytics dashboard for admins
 */
export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = '',
  dateRange = '30days',
  setDateRange
}) => {
  const { t } = useTranslation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle displaying error message
  const renderError = () => {
    if (error) {
      return (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
            <p className="font-medium">{error}</p>
          </div>
        </div>
      );
    }
    return null;
    
    // Ensure device breakdown adds up to 100%
    const total = deviceBreakdown.desktop + deviceBreakdown.mobile + deviceBreakdown.tablet;
    deviceBreakdown.desktop = Math.round((deviceBreakdown.desktop / total) * 100);
    deviceBreakdown.mobile = Math.round((deviceBreakdown.mobile / total) * 100);
    deviceBreakdown.tablet = 100 - deviceBreakdown.desktop - deviceBreakdown.mobile;
    
    return {
      visitors: {
        total: totalVisitors,
        change: Math.floor(Math.random() * 20) - 5, // Random change between -5 and 15
        data: visitorData
      },
      pageViews: {
        total: totalPageViews,
        change: Math.floor(Math.random() * 20) - 5,
        data: pageViewData
      },
      bounceRate: {
        rate: Math.floor(Math.random() * 30) + 40, // Random between 40-70%
        change: Math.floor(Math.random() * 10) - 5 // Random between -5 and 5
      },
      conversionRate: {
        rate: Math.floor(Math.random() * 10) + 1, // Random between 1-11%
        change: Math.floor(Math.random() * 6) - 3 // Random between -3 and 3
      },
      topPages,
      topReferrers,
      deviceBreakdown,
      topProducts
    };
  };

  // Fetch analytics data from Supabase
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      
      try {
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
        
        const startDateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Try to fetch from analytics_daily_metrics first (aggregated data)
        const { data: metricsData, error: metricsError } = await supabase
          .from('analytics_daily_metrics')
          .select('*')
          .gte('date', startDateStr);
          
        if (!metricsError && metricsData && metricsData.length > 0) {
          console.log('Found aggregated analytics data:', metricsData.length, 'days');
          
          // Process the aggregated data
          const visitorMap: Record<number, number> = {};
          const pageViewMap: Record<number, number> = {};
          const productViewMap: Record<string, { id: string, name: string, views: number }> = {};
          
          // Calculate totals
          let totalVisitors = 0;
          let totalPageViews = 0;
          
          metricsData.forEach(day => {
            const date = new Date(day.date);
            const dayOfMonth = date.getDate();
            
            // Track visitors and page views by day
            visitorMap[dayOfMonth] = (visitorMap[dayOfMonth] || 0) + day.unique_visitors;
            pageViewMap[dayOfMonth] = (pageViewMap[dayOfMonth] || 0) + day.page_views;
            
            // Add to totals
            totalVisitors += day.unique_visitors;
            totalPageViews += day.page_views;
            
            // Process product views
            if (day.product_views && typeof day.product_views === 'object') {
              // Convert to object if it's a string
              const productViews = typeof day.product_views === 'string' 
                ? JSON.parse(day.product_views) 
                : day.product_views;
              
              // Process each product view
              Object.entries(productViews).forEach(([productId, views]) => {
                if (!productViewMap[productId]) {
                  productViewMap[productId] = {
                    id: productId,
                    name: `Product ${productId}`,
                    views: 0
                  };
                }
                productViewMap[productId].views += Number(views);
              });
            }
          });
          
          // Calculate bounce rate and conversion rate from the most recent day
          const latestDay = metricsData.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];
          
          const bounceRate = latestDay.bounce_rate || 0;
          const conversionRate = latestDay.conversion_rate || 0;
          
          // Format data
          const formattedData: AnalyticsData = {
            visitors: {
              total: totalVisitors,
              change: 0, // We don't have previous period data
              data: Array.from({ length: 7 }, (_, i) => visitorMap[today.getDate() - i] || 0).reverse()
            },
            pageViews: {
              total: totalPageViews,
              change: 0, // We don't have previous period data
              data: Array.from({ length: 7 }, (_, i) => pageViewMap[today.getDate() - i] || 0).reverse()
            },
            bounceRate: {
              rate: bounceRate,
              change: 0
            },
            conversionRate: {
              rate: conversionRate,
              change: 0
            },
            topPages: [], // We don't have page data in the daily metrics
            topReferrers: [], // We don't have referrer data in the daily metrics
            deviceBreakdown: {
              desktop: 70, // Default values
              mobile: 25,
              tablet: 5
            },
            topProducts: Object.values(productViewMap)
              .sort((a, b) => b.views - a.views)
              .slice(0, 5)
          };
          
          setData(formattedData);
          setLoading(false);
          return;
        }
        
        // If no aggregated data, fall back to raw events
        console.log('No aggregated data found, falling back to raw events');
        
        // Check if analytics_events table exists
        const { error: tableError } = await supabase
          .from('analytics_events')
          .select('id')
          .limit(1);
          
        if (tableError) {
          console.error('Error checking analytics tables:', tableError);
          // If table doesn't exist, use mock data
          const mockData = generateMockData();
          setData(mockData);
          setLoading(false);
          return;
        }
        
        // Fetch raw events data
        const { data: analyticsData, error: analyticsError } = await supabase
          .from('analytics_events')
          .select('event_type, session_id, url, referrer, user_agent, label, created_at, metadata')
          .gte('created_at', startDate.toISOString());
        
        if (analyticsError) {
          console.error('Error fetching analytics data:', analyticsError);
          setError(t('analytics.errorFetching', 'Error fetching analytics data'));
          const mockData = generateMockData();
          setData(mockData);
          setLoading(false);
          return;
        }
        
        if (!analyticsData || analyticsData.length === 0) {
          console.log('No analytics data found yet');
          // Use mock data instead of showing an error
          const mockData = generateMockData();
          setData(mockData);
          setLoading(false);
          return;
        }
        
        console.log('Found analytics data:', analyticsData.length, 'events');
        
        // Process analytics data
        const visitorMap: Record<number, number> = {};
        const pageViewMap: Record<number, number> = {};
        const productViewMap: Record<string, { id: string, name: string, views: number }> = {};
        const referrerMap: Record<string, number> = {};
        const deviceMap: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
        const pathMap: Record<string, { path: string, title: string, views: number }> = {};
        
        // Count unique visitors by session ID
        const uniqueVisitors = new Set(analyticsData.map(event => event.session_id)).size;
        
        // Process each event
        analyticsData.forEach(event => {
          const date = new Date(event.created_at);
          const day = date.getDate();
          
          // Track visitors by day
          visitorMap[day] = (visitorMap[day] || 0) + 1;
          
          // Count page views
          if (event.event_type === 'page_view') {
            pageViewMap[day] = (pageViewMap[day] || 0) + 1;
            
            // Track pages
            const path = event.url || 'unknown';
            if (!pathMap[path]) {
              pathMap[path] = { path, title: event.label || path, views: 0 };
            }
            pathMap[path].views += 1;
          }
          
          // Count product views - check both direct product_id and metadata.product_id
          const isProductView = 
            event.event_type === 'product_view' || 
            event.event_type === 'ecommerce' || 
            (event.event_type === 'event' && event.action === 'view_product');
            
          let productId = null;
          let productName = null;
          
          // Try to get product ID from different possible locations
          if ('product_id' in event && event.product_id) {
            productId = event.product_id;
            productName = event.label || event.product_id;
          } else if (event.metadata && typeof event.metadata === 'object') {
            // Try to parse metadata if it's a string
            let metadata = event.metadata;
            if (typeof metadata === 'string') {
              try {
                metadata = JSON.parse(metadata);
              } catch (e) {
                // Ignore parsing errors
              }
            }
            
            // Check if metadata has product_id
            if (metadata && metadata.product_id) {
              productId = metadata.product_id;
              productName = metadata.product_name || event.label || productId;
            }
          }
          
          // If this is a product view and we found a product ID, count it
          if (isProductView && productId) {
            console.log('Found product view:', productId, productName);
            if (!productViewMap[productId]) {
              productViewMap[productId] = { 
                id: productId, 
                name: productName || productId, 
                views: 0 
              };
            }
            productViewMap[productId].views += 1;
          }
          
          // Track referrers
          if (event.referrer) {
            try {
              const referrer = new URL(event.referrer).hostname;
              referrerMap[referrer] = (referrerMap[referrer] || 0) + 1;
            } catch (e) {
              // Invalid URL, skip
            }
          }
          
          // Track devices
          if (event.user_agent) {
            const ua = event.user_agent.toLowerCase();
            if (ua.includes('mobile')) {
              deviceMap.mobile += 1;
            } else if (ua.includes('tablet') || ua.includes('ipad')) {
              deviceMap.tablet += 1;
            } else {
              deviceMap.desktop += 1;
            }
          }
        });
        
        // Calculate totals
        const totalPageViews = Object.values(pageViewMap).reduce((sum, val) => sum + val, 0);
        
        // Calculate bounce rate (sessions with only one page view)
        const sessions: Record<string, number> = {};
        analyticsData
          .filter(event => event.event_type === 'page_view')
          .forEach(event => {
            sessions[event.session_id] = (sessions[event.session_id] || 0) + 1;
          });
        
        const singlePageSessions = Object.values(sessions).filter(count => count === 1).length;
        const totalSessions = Object.keys(sessions).length || 1; // Avoid division by zero
        const bounceRate = Math.round((singlePageSessions / totalSessions) * 100);
        
        // Calculate conversion rate (purchases / visitors)
        const purchaseEvents = analyticsData.filter(event => event.event_type === 'purchase').length;
        const conversionRate = uniqueVisitors > 0 
          ? Math.round((purchaseEvents / uniqueVisitors) * 100) 
          : 0;
        
        // Get previous period data for comparison
        const previousPeriodStart = new Date(startDate);
        if (dateRange === 'today') {
          previousPeriodStart.setDate(previousPeriodStart.getDate() - 1);
        } else if (dateRange === '7days') {
          previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
        } else if (dateRange === '30days') {
          previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);
        } else {
          previousPeriodStart.setDate(previousPeriodStart.getDate() - 90);
        }
        
        const previousPeriodEnd = new Date(startDate);
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
        
        const { data: previousData } = await supabase
          .from('analytics_events')
          .select('event_type, session_id')
          .gte('created_at', previousPeriodStart.toISOString())
          .lte('created_at', previousPeriodEnd.toISOString());
        
        // Calculate change percentages
        const prevUniqueVisitors = previousData ? new Set(previousData.map(event => event.session_id)).size : 0;
        const prevPageViews = previousData ? previousData.filter(event => event.event_type === 'page_view').length : 0;
        const prevPurchases = previousData ? previousData.filter(event => event.event_type === 'purchase').length : 0;
        
        const visitorsChange = calculatePercentChange(uniqueVisitors, prevUniqueVisitors);
        const pageViewsChange = calculatePercentChange(totalPageViews, prevPageViews);
        const conversionRateChange = calculatePercentChange(
          purchaseEvents / (uniqueVisitors || 1), 
          prevPurchases / (prevUniqueVisitors || 1)
        );
        
        // Format data
        const formattedData: AnalyticsData = {
          visitors: {
            total: uniqueVisitors,
            change: visitorsChange,
            data: Array.from({ length: 7 }, (_, i) => visitorMap[today.getDate() - i] || 0).reverse()
          },
          pageViews: {
            total: totalPageViews,
            change: pageViewsChange,
            data: Array.from({ length: 7 }, (_, i) => pageViewMap[today.getDate() - i] || 0).reverse()
          },
          bounceRate: {
            rate: bounceRate,
            change: 0 // We don't have previous bounce rate data yet
          },
          conversionRate: {
            rate: conversionRate,
            change: conversionRateChange
          },
          topPages: Object.values(pathMap)
            .sort((a, b) => b.views - a.views)
            .slice(0, 5),
          topReferrers: Object.entries(referrerMap)
            .map(([source, visits]) => ({ source, visits }))
            .sort((a, b) => b.visits - a.visits)
            .slice(0, 5),
          deviceBreakdown: {
            desktop: Math.round((deviceMap.desktop / (deviceMap.desktop + deviceMap.mobile + deviceMap.tablet || 1)) * 100),
            mobile: Math.round((deviceMap.mobile / (deviceMap.desktop + deviceMap.mobile + deviceMap.tablet || 1)) * 100),
            tablet: Math.round((deviceMap.tablet / (deviceMap.desktop + deviceMap.mobile + deviceMap.tablet || 1)) * 100)
          },
          topProducts: Object.values(productViewMap)
            .sort((a, b) => b.views - a.views)
            .slice(0, 5)
        };
        
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        // Use mock data if there's an error
        const mockData = generateMockData();
        setData(mockData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [dateRange, t]);  // Added t to dependencies

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  // Calculate percent change between current and previous values
  const calculatePercentChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Render change indicator
  const renderChange = (change: number): JSX.Element => {
    const isPositive = change > 0;
    const color = isPositive ? 'text-green-500' : 'text-red-500';
    const icon = isPositive ? '↑' : '↓';
    
    return (
      <span className={`text-sm ${color} ml-1`}>
        {icon} {Math.abs(change)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Generate mock data for the dashboard when real data is not available
  const generateMockData = (): AnalyticsData => {
    const totalVisitors = Math.floor(Math.random() * 1000) + 200;
    const totalPageViews = totalVisitors * (Math.floor(Math.random() * 3) + 2);
    
    // Generate random visitor data for the last 7 days
    const visitorData = Array.from({ length: 7 }, () => 
      Math.floor(Math.random() * (totalVisitors / 5)) + (totalVisitors / 10)
    );
    
    // Generate random page view data for the last 7 days
    const pageViewData = Array.from({ length: 7 }, (_, i) => 
      visitorData[i] * (Math.floor(Math.random() * 3) + 2)
    );
    
    // Generate random top pages
    const topPages = [
      { path: '/', title: 'Home', views: Math.floor(Math.random() * 500) + 100 },
      { path: '/products', title: 'Products', views: Math.floor(Math.random() * 400) + 80 },
      { path: '/about', title: 'About', views: Math.floor(Math.random() * 300) + 50 },
      { path: '/contact', title: 'Contact', views: Math.floor(Math.random() * 200) + 30 },
      { path: '/blog', title: 'Blog', views: Math.floor(Math.random() * 100) + 20 }
    ].sort((a, b) => b.views - a.views);
    
    // Generate random top referrers
    const topReferrers = [
      { source: 'google.com', visits: Math.floor(Math.random() * 300) + 50 },
      { source: 'facebook.com', visits: Math.floor(Math.random() * 200) + 40 },
      { source: 'instagram.com', visits: Math.floor(Math.random() * 150) + 30 },
      { source: 'twitter.com', visits: Math.floor(Math.random() * 100) + 20 },
      { source: 'linkedin.com', visits: Math.floor(Math.random() * 50) + 10 }
    ].sort((a, b) => b.visits - a.visits);
    
    // Generate random device breakdown
    const deviceBreakdown = {
      desktop: Math.floor(Math.random() * 60) + 30,
      mobile: Math.floor(Math.random() * 40) + 20,
      tablet: Math.floor(Math.random() * 20) + 5
    };
    
    // Generate random top products
    const topProducts = [
      { id: 'prod_1', name: 'Product 1', views: Math.floor(Math.random() * 200) + 50 },
      { id: 'prod_2', name: 'Product 2', views: Math.floor(Math.random() * 180) + 40 },
      { id: 'prod_3', name: 'Product 3', views: Math.floor(Math.random() * 160) + 30 },
      { id: 'prod_4', name: 'Product 4', views: Math.floor(Math.random() * 140) + 20 },
      { id: 'prod_5', name: 'Product 5', views: Math.floor(Math.random() * 120) + 10 }
    ].sort((a, b) => b.views - a.views);
    
    // Ensure device breakdown adds up to 100%
    const total = deviceBreakdown.desktop + deviceBreakdown.mobile + deviceBreakdown.tablet;
    deviceBreakdown.desktop = Math.round((deviceBreakdown.desktop / total) * 100);
    deviceBreakdown.mobile = Math.round((deviceBreakdown.mobile / total) * 100);
    deviceBreakdown.tablet = 100 - deviceBreakdown.desktop - deviceBreakdown.mobile;
    
    return {
      visitors: {
        total: totalVisitors,
        change: Math.floor(Math.random() * 20) - 5, // Random change between -5 and 15
        data: visitorData
      },
      pageViews: {
        total: totalPageViews,
        change: Math.floor(Math.random() * 20) - 5,
        data: pageViewData
      },
      bounceRate: {
        rate: Math.floor(Math.random() * 30) + 40, // Random between 40-70%
        change: Math.floor(Math.random() * 10) - 5 // Random between -5 and 5
      },
      conversionRate: {
        rate: Math.floor(Math.random() * 10) + 1, // Random between 1-11%
        change: Math.floor(Math.random() * 6) - 3 // Random between -3 and 3
      },
      topPages,
      topReferrers,
      deviceBreakdown,
      topProducts,
      isMockData: true
    };
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {error && renderError()}
      
      {data?.isMockData && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p className="font-medium">{t('analytics.mockDataWarning', 'Using mock data')}</p>
          <p className="text-sm">{t('analytics.mockDataDescription', 'Real analytics data is not available yet. Please create the analytics tables in Supabase and start collecting data.')}</p>
        </div>
      )}
      
      {/* Header with date range selector */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('analytics.dashboard', 'Analytics Dashboard')}</h2>
        <div className="flex space-x-2">
          {(['today', '7days', '30days', '90days'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange?.(range)}
              className={`px-3 py-1 rounded text-sm ${
                dateRange === range
                  ? 'bg-brown-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t(`analytics.${range}`, range)}
            </button>
          ))}
        </div>
      </div>

      {data && (
        <>
          {/* Key metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Visitors */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-gray-500 text-sm">{t('analytics.visitors', 'Visitors')}</h3>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-bold text-gray-800">{formatNumber(data.visitors.total)}</p>
                {renderChange(data.visitors.change)}
              </div>
            </div>

            {/* Page Views */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-gray-500 text-sm">{t('analytics.pageViews', 'Page Views')}</h3>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-bold text-gray-800">{formatNumber(data.pageViews.total)}</p>
                {renderChange(data.pageViews.change)}
              </div>
            </div>

            {/* Bounce Rate */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-gray-500 text-sm">{t('analytics.bounceRate', 'Bounce Rate')}</h3>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-bold text-gray-800">{data.bounceRate.rate}%</p>
                {renderChange(data.bounceRate.change)}
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-gray-500 text-sm">{t('analytics.conversionRate', 'Conversion Rate')}</h3>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-bold text-gray-800">{data.conversionRate.rate}%</p>
                {renderChange(data.conversionRate.change)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-gray-700 font-medium mb-4">{t('analytics.topPages', 'Top Pages')}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-xs text-gray-500 uppercase tracking-wider py-2">
                        {t('analytics.page', 'Page')}
                      </th>
                      <th className="text-right text-xs text-gray-500 uppercase tracking-wider py-2">
                        {t('analytics.views', 'Views')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topPages.map((page, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="py-2 text-sm text-gray-800 truncate max-w-[200px]" title={page.title}>
                          {page.title}
                        </td>
                        <td className="py-2 text-sm text-gray-600 text-right">{formatNumber(page.views)}</td>
                      </tr>
                    ))}
                    {data.topPages.length === 0 && (
                      <tr>
                        <td colSpan={2} className="py-4 text-center text-gray-500">
                          {t('analytics.noData', 'No data available')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        
        {/* Top Products */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-gray-700 font-medium mb-4">{t('analytics.topProducts', 'Top Products')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left text-xs text-gray-500 uppercase tracking-wider py-2">
                    {t('analytics.product', 'Product')}
                  </th>
                  <th className="text-right text-xs text-gray-500 uppercase tracking-wider py-2">
                    {t('analytics.views', 'Views')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((product, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="py-2 text-sm text-gray-800 truncate max-w-[200px]" title={product.name}>
                      {product.name}
                    </td>
                    <td className="py-2 text-sm text-gray-600 text-right">{formatNumber(product.views)}</td>
                  </tr>
                ))}
                {data.topProducts.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-gray-500">
                      {t('analytics.noData', 'No data available')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Referrers */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-gray-700 font-medium mb-4">{t('analytics.topReferrers', 'Top Referrers')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left text-xs text-gray-500 uppercase tracking-wider py-2">
                    {t('analytics.source', 'Source')}
                  </th>
                  <th className="text-right text-xs text-gray-500 uppercase tracking-wider py-2">
                    {t('analytics.visits', 'Visits')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.topReferrers.map((referrer, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="py-2 text-sm text-gray-800">{referrer.source}</td>
                    <td className="py-2 text-sm text-gray-600 text-right">{formatNumber(referrer.visits)}</td>
                  </tr>
                ))}
                {data.topReferrers.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-gray-500">
                      {t('analytics.noData', 'No data available')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-gray-700 font-medium mb-4">{t('analytics.deviceBreakdown', 'Device Breakdown')}</h3>
          <div className="flex justify-around">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">{data.deviceBreakdown.desktop}%</div>
              <div className="text-sm text-gray-500">{t('analytics.desktop', 'Desktop')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">{data.deviceBreakdown.mobile}%</div>
              <div className="text-sm text-gray-500">{t('analytics.mobile', 'Mobile')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">{data.deviceBreakdown.tablet}%</div>
              <div className="text-sm text-gray-500">{t('analytics.tablet', 'Tablet')}</div>
            </div>
          </div>
        </div>

        {/* Traffic Over Time */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-gray-700 font-medium mb-4">{t('analytics.trafficOverTime', 'Traffic Over Time')}</h3>
          <div className="h-48 flex items-end space-x-1">
            {data.visitors.data.map((value, index) => (
              <div 
                key={index}
                className="bg-brown-500 hover:bg-brown-600 rounded-t w-full"
                style={{ 
                  height: `${Math.max(5, (value / Math.max(...data.visitors.data)) * 100)}%`,
                  minHeight: '4px'
                }}
                title={`${value} ${t('analytics.visitors', 'visitors')}`}
              />
            ))}
          </div>
        </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
