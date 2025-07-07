/**
 * Utility functions for creating links to various pages
 */

/**
 * Creates a link to the Darilo page with a specific package ID
 * 
 * @param packageId The ID of the gift package to link to
 * @param language The language code (optional)
 * @returns A URL string for the Darilo page with the specified package ID
 */
export function createDariloPackageLink(packageId: number | string, language?: string): string {
  const baseUrl = '/darilo';
  const langParam = language ? `&lang=${language}` : '';
  
  return `${baseUrl}?packageId=${packageId}${langParam}`;
}

/**
 * Creates a direct link to the gift builder page with a specific package ID
 * 
 * @param packageId The ID of the gift package to link to
 * @param language The language code (optional)
 * @returns A URL string for the gift builder page with the specified package ID
 */
export function createGiftBuilderLink(packageId: number | string, language?: string): string {
  const baseUrl = `/darilo/builder/${packageId}`;
  const langParam = language ? `?lang=${language}` : '';
  
  return `${baseUrl}${langParam}`;
}
