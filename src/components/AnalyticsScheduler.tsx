import { useEffect, useRef } from 'react';
import { aggregateAnalyticsData } from '../utils/analyticsUtils';

/**
 * This component doesn't render anything but runs analytics aggregation
 * in the background when an admin is logged in
 */
export const AnalyticsScheduler: React.FC = () => {
  // Use a ref instead of state to avoid re-renders
  const lastRunRef = useRef<Date | null>(null);

  useEffect(() => {
    // Check if we need to run aggregation
    const checkAndRunAggregation = async () => {
      // Only run once per day
      if (lastRunRef.current) {
        const now = new Date();
        const lastRunDate = new Date(lastRunRef.current);

        // If we've already run today, don't run again
        if (
          now.getDate() === lastRunDate.getDate() &&
          now.getMonth() === lastRunDate.getMonth() &&
          now.getFullYear() === lastRunDate.getFullYear()
        ) {
          return;
        }
      }

      // Run aggregation
      const success = await aggregateAnalyticsData();

      if (success) {
        const now = new Date();
        lastRunRef.current = now;
        // Store last run in localStorage to persist across sessions
        localStorage.setItem('analyticsLastAggregation', now.toISOString());
      }
    };

    // Check if we have a stored last run date
    const storedLastRun = localStorage.getItem('analyticsLastAggregation');
    if (storedLastRun) {
      lastRunRef.current = new Date(storedLastRun);
    }

    // Run immediately when component mounts
    checkAndRunAggregation();

    // Then set up interval to check every hour
    const interval = setInterval(checkAndRunAggregation, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array - only run on mount

  // This component doesn't render anything
  return null;
};

export default AnalyticsScheduler;
