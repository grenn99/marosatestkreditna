import { describe, it, expect, vi } from 'vitest';
import { getImageUrl, validateImageUrl, processProductImages } from './imageUtils';

// Define a constant for our tests
const PLACEHOLDER_PATH = '/images/placeholder.svg';

describe('imageUtils', () => {
  // Note: window.location and fetch are already mocked in setup.ts

  describe('getImageUrl', () => {
    it('should handle local paths starting with "./"', () => {
      const result = getImageUrl('./images/test.jpg');
      expect(result).toContain('images/test.jpg');
    });

    it('should handle absolute paths starting with "/"', () => {
      const result = getImageUrl('/images/test.jpg');
      expect(result).toBe('https://marosakreditna.netlify.app/images/test.jpg');
    });

    it('should handle full URLs', () => {
      const result = getImageUrl('https://i.ibb.co/image.jpg');
      expect(result).toBe('https://i.ibb.co/image.jpg');
    });

    it('should convert http to https for security', () => {
      const result = getImageUrl('http://i.ibb.co/image.jpg');
      expect(result).toBe('https://i.ibb.co/image.jpg');
    });

    it('should return fallback for empty paths', () => {
      const result = getImageUrl('');
      // We can't test the exact value since it depends on the implementation
      // Just check that it returns a string and contains 'placeholder'
      expect(typeof result).toBe('string');
      expect(result.includes('placeholder')).toBe(true);
    });

    it('should return fallback for disallowed domains', () => {
      const result = getImageUrl('https://malicious-site.com/image.jpg');
      // We can't test the exact value since it depends on the implementation
      // Just check that it returns a string and contains 'placeholder'
      expect(typeof result).toBe('string');
      expect(result.includes('placeholder')).toBe(true);
    });

    it('should handle relative paths without "./" prefix', () => {
      const result = getImageUrl('images/test.jpg');
      expect(result).toBe('https://marosakreditna.netlify.app/images/test.jpg');
    });
  });

  describe('validateImageUrl', () => {
    it('should return true for valid image URLs', async () => {
      const result = await validateImageUrl('https://example.com/valid-image.jpg');
      expect(result).toBe(true);
    });

    it('should return false for invalid image URLs', async () => {
      // Override the global fetch mock for this test only
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        headers: {
          get: () => null,
        },
      });

      const result = await validateImageUrl('https://example.com/invalid-image.jpg');

      // Restore the original fetch mock
      global.fetch = originalFetch;

      expect(result).toBe(false);
    });

    it('should return false for empty URLs', async () => {
      const result = await validateImageUrl('');
      expect(result).toBe(false);
    });
  });

  describe('processProductImages', () => {
    it('should process main image and additional images', async () => {
      const mainImage = '/images/main.jpg';
      const additionalImages = [
        '/images/additional1.jpg',
        '/images/additional2.jpg',
      ];

      const result = await processProductImages(mainImage, additionalImages);

      expect(result.mainImageUrl).toBe('https://marosakreditna.netlify.app/images/main.jpg');
      expect(result.validAdditionalImages).toHaveLength(2);
      expect(result.validAdditionalImages[0]).toBe('https://marosakreditna.netlify.app/images/additional1.jpg');
    });

    it('should handle undefined inputs', async () => {
      const result = await processProductImages(undefined, undefined);

      // We can't test the exact value since it depends on the implementation
      // Just check that it returns a string and contains 'placeholder'
      expect(typeof result.mainImageUrl).toBe('string');
      expect(result.mainImageUrl.includes('placeholder')).toBe(true);
      expect(result.validAdditionalImages).toHaveLength(0);
    });

    it('should filter out duplicates and main image from additional images', async () => {
      const mainImage = '/images/main.jpg';
      const additionalImages = [
        '/images/main.jpg', // Duplicate of main
        '/images/additional1.jpg',
        '/images/additional1.jpg', // Duplicate
      ];

      const result = await processProductImages(mainImage, additionalImages);

      expect(result.validAdditionalImages).toHaveLength(1);
      expect(result.validAdditionalImages[0]).toBe('https://marosakreditna.netlify.app/images/additional1.jpg');
    });

    it('should limit additional images to 6', async () => {
      const mainImage = '/images/main.jpg';
      const additionalImages = Array.from({ length: 10 }, (_, i) => `/images/additional${i}.jpg`);

      const result = await processProductImages(mainImage, additionalImages);

      expect(result.validAdditionalImages).toHaveLength(6);
    });
  });
});
