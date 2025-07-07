/**
 * Logger utility
 * 
 * This module provides a standardized logging interface that respects the current environment.
 * In production, logs are suppressed unless they are critical.
 */

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

// Default minimum log level based on environment
const DEFAULT_MIN_LEVEL = import.meta.env.PROD ? LogLevel.ERROR : LogLevel.DEBUG;

// Get minimum log level from environment or use default
const getMinLogLevel = (): LogLevel => {
  const envLevel = import.meta.env.VITE_LOG_LEVEL;
  if (envLevel !== undefined) {
    const level = parseInt(envLevel, 10);
    if (!isNaN(level) && level >= LogLevel.DEBUG && level <= LogLevel.NONE) {
      return level;
    }
  }
  return DEFAULT_MIN_LEVEL;
};

// Current minimum log level
let minLogLevel = getMinLogLevel();

/**
 * Set the minimum log level
 * 
 * @param level The minimum log level to display
 */
export function setLogLevel(level: LogLevel): void {
  minLogLevel = level;
}

/**
 * Get the current minimum log level
 * 
 * @returns The current minimum log level
 */
export function getLogLevel(): LogLevel {
  return minLogLevel;
}

/**
 * Check if a log level is enabled
 * 
 * @param level The log level to check
 * @returns True if the log level is enabled
 */
export function isLevelEnabled(level: LogLevel): boolean {
  return level >= minLogLevel;
}

/**
 * Log a debug message
 * 
 * @param message The message to log
 * @param args Additional arguments to log
 */
export function debug(message: string, ...args: any[]): void {
  if (isLevelEnabled(LogLevel.DEBUG)) {
    console.debug(`[DEBUG] ${message}`, ...args);
  }
}

/**
 * Log an info message
 * 
 * @param message The message to log
 * @param args Additional arguments to log
 */
export function info(message: string, ...args: any[]): void {
  if (isLevelEnabled(LogLevel.INFO)) {
    console.info(`[INFO] ${message}`, ...args);
  }
}

/**
 * Log a warning message
 * 
 * @param message The message to log
 * @param args Additional arguments to log
 */
export function warn(message: string, ...args: any[]): void {
  if (isLevelEnabled(LogLevel.WARN)) {
    console.warn(`[WARN] ${message}`, ...args);
  }
}

/**
 * Log an error message
 * 
 * @param message The message to log
 * @param args Additional arguments to log
 */
export function error(message: string, ...args: any[]): void {
  if (isLevelEnabled(LogLevel.ERROR)) {
    console.error(`[ERROR] ${message}`, ...args);
  }
}

/**
 * Create a logger for a specific module
 * 
 * @param module The module name
 * @returns A logger object with debug, info, warn, and error methods
 */
export function createLogger(module: string) {
  return {
    debug: (message: string, ...args: any[]) => debug(`[${module}] ${message}`, ...args),
    info: (message: string, ...args: any[]) => info(`[${module}] ${message}`, ...args),
    warn: (message: string, ...args: any[]) => warn(`[${module}] ${message}`, ...args),
    error: (message: string, ...args: any[]) => error(`[${module}] ${message}`, ...args),
  };
}
