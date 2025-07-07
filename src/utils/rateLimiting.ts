/**
 * Rate Limiting Utilities
 * 
 * This module provides functions for implementing client-side rate limiting
 * to prevent brute force attacks and excessive API calls.
 */

interface RateLimitRecord {
  count: number;
  timestamp: number;
}

interface RateLimitOptions {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

const RATE_LIMIT_STORAGE_PREFIX = 'rate_limit_';

/**
 * Checks if an action is rate limited
 * 
 * @param actionKey Unique identifier for the action being rate limited
 * @param options Rate limiting options
 * @returns Object containing isLimited flag and timeRemaining in ms
 */
export function checkRateLimit(
  actionKey: string,
  options: RateLimitOptions = { maxAttempts: 5, windowMs: 60000, blockDurationMs: 300000 }
): { isLimited: boolean; timeRemaining: number } {
  const storageKey = `${RATE_LIMIT_STORAGE_PREFIX}${actionKey}`;
  const now = Date.now();
  
  // Get existing record from localStorage
  const storedRecord = localStorage.getItem(storageKey);
  let record: RateLimitRecord;
  
  if (storedRecord) {
    record = JSON.parse(storedRecord);
    
    // Check if we're in a block period
    if (record.count >= options.maxAttempts && options.blockDurationMs) {
      const blockEndTime = record.timestamp + options.blockDurationMs;
      
      if (now < blockEndTime) {
        // Still in block period
        return {
          isLimited: true,
          timeRemaining: blockEndTime - now
        };
      } else {
        // Block period expired, reset the record
        record = { count: 0, timestamp: now };
      }
    } else if (now - record.timestamp > options.windowMs) {
      // Window expired, reset the record
      record = { count: 0, timestamp: now };
    }
  } else {
    // No record exists, create a new one
    record = { count: 0, timestamp: now };
  }
  
  return {
    isLimited: false,
    timeRemaining: 0
  };
}

/**
 * Increments the rate limit counter for an action
 * 
 * @param actionKey Unique identifier for the action being rate limited
 * @param options Rate limiting options
 * @returns Object containing isLimited flag and timeRemaining in ms
 */
export function incrementRateLimit(
  actionKey: string,
  options: RateLimitOptions = { maxAttempts: 5, windowMs: 60000, blockDurationMs: 300000 }
): { isLimited: boolean; timeRemaining: number } {
  const storageKey = `${RATE_LIMIT_STORAGE_PREFIX}${actionKey}`;
  const now = Date.now();
  
  // Get existing record from localStorage
  const storedRecord = localStorage.getItem(storageKey);
  let record: RateLimitRecord;
  
  if (storedRecord) {
    record = JSON.parse(storedRecord);
    
    // Check if we're in a block period
    if (record.count >= options.maxAttempts && options.blockDurationMs) {
      const blockEndTime = record.timestamp + options.blockDurationMs;
      
      if (now < blockEndTime) {
        // Still in block period
        return {
          isLimited: true,
          timeRemaining: blockEndTime - now
        };
      } else {
        // Block period expired, reset the record
        record = { count: 1, timestamp: now };
      }
    } else if (now - record.timestamp > options.windowMs) {
      // Window expired, reset the record
      record = { count: 1, timestamp: now };
    } else {
      // Increment the counter
      record.count += 1;
    }
  } else {
    // No record exists, create a new one
    record = { count: 1, timestamp: now };
  }
  
  // Save the updated record
  localStorage.setItem(storageKey, JSON.stringify(record));
  
  // Check if we've hit the limit
  if (record.count >= options.maxAttempts) {
    const blockEndTime = record.timestamp + (options.blockDurationMs || 0);
    return {
      isLimited: true,
      timeRemaining: blockEndTime - now
    };
  }
  
  return {
    isLimited: false,
    timeRemaining: 0
  };
}

/**
 * Resets the rate limit counter for an action
 * 
 * @param actionKey Unique identifier for the action being rate limited
 */
export function resetRateLimit(actionKey: string): void {
  const storageKey = `${RATE_LIMIT_STORAGE_PREFIX}${actionKey}`;
  localStorage.removeItem(storageKey);
}

/**
 * Formats the remaining time in a human-readable format
 * 
 * @param timeRemainingMs Time remaining in milliseconds
 * @returns Formatted time string (e.g., "2m 30s")
 */
export function formatTimeRemaining(timeRemainingMs: number): string {
  if (timeRemainingMs <= 0) return '0s';
  
  const seconds = Math.floor((timeRemainingMs / 1000) % 60);
  const minutes = Math.floor((timeRemainingMs / (1000 * 60)) % 60);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}
