import { PackageOption } from '../types';

/**
 * Utility functions for handling package options
 * Consolidates repeated JSON parsing logic across components
 */

/**
 * Parse package options from string or return as-is if already parsed
 */
export function parsePackageOptions(packageOptions: any): PackageOption[] {
  // If it's already an array, return it
  if (Array.isArray(packageOptions)) {
    return packageOptions;
  }

  // If it's a string, try to parse it
  if (typeof packageOptions === 'string') {
    try {
      const parsed = JSON.parse(packageOptions);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing package options:', error);
      return [];
    }
  }

  // If it's null, undefined, or any other type, return empty array
  return [];
}

/**
 * Stringify package options for database storage
 */
export function stringifyPackageOptions(packageOptions: PackageOption[]): string {
  try {
    return JSON.stringify(packageOptions);
  } catch (error) {
    console.error('Error stringifying package options:', error);
    return '[]';
  }
}

/**
 * Validate package option structure
 */
export function validatePackageOption(option: any): option is PackageOption {
  return (
    option &&
    typeof option === 'object' &&
    typeof option.description === 'string' &&
    typeof option.price === 'number' &&
    typeof option.weight === 'string' &&
    typeof option.unit === 'string' &&
    typeof option.uniq_id === 'string'
  );
}

/**
 * Create a new package option with default values
 */
export function createDefaultPackageOption(): PackageOption {
  return {
    description: '',
    price: 0,
    weight: '',
    unit: 'g',
    uniq_id: `option_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
}

/**
 * Clean and validate package options array
 */
export function cleanPackageOptions(options: any[]): PackageOption[] {
  if (!Array.isArray(options)) {
    return [];
  }

  return options
    .filter(validatePackageOption)
    .map(option => ({
      ...option,
      price: Number(option.price) || 0,
      description: String(option.description || ''),
      weight: String(option.weight || ''),
      unit: String(option.unit || 'g')
    }));
}

/**
 * Find package option by unique ID
 */
export function findPackageOptionById(options: PackageOption[], id: string): PackageOption | undefined {
  return options.find(option => option.uniq_id === id);
}

/**
 * Get the cheapest package option
 */
export function getCheapestOption(options: PackageOption[]): PackageOption | null {
  if (!options.length) return null;
  
  return options.reduce((cheapest, current) => 
    current.price < cheapest.price ? current : cheapest
  );
}

/**
 * Format package option display text
 */
export function formatPackageOptionDisplay(option: PackageOption): string {
  const weight = option.weight && option.unit ? `${option.weight}${option.unit}` : '';
  const price = `€${option.price.toFixed(2)}`;
  
  if (weight) {
    return `${option.description} (${weight}) - ${price}`;
  }
  
  return `${option.description} - ${price}`;
}
