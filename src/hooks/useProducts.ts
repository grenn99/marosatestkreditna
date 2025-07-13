import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';

interface UseProductsOptions {
  categoryFilter?: string;
  activeOnly?: boolean;
  includeInactive?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Shared hook for fetching products with common filtering options
 * Reduces code duplication across AdminProductsPage, GiftBuilderPage, etc.
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { categoryFilter = 'all', activeOnly = false, includeInactive = true } = options;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query
      let query = supabase.from('products').select('*');

      // Apply category filter if not 'all'
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      // Apply active filter if specified
      if (activeOnly) {
        query = query.eq('isActive', true);
      }

      // Execute query
      const { data, error: fetchError } = await query.order('id');

      if (fetchError) {
        throw fetchError;
      }

      // Process the data - parse package_options if it's a string
      const processedProducts = (data || []).map((product: any) => {
        // Parse package_options if it's a string
        if (typeof product.package_options === 'string') {
          try {
            product.package_options = JSON.parse(product.package_options);
          } catch (e) {
            console.error('Error parsing package_options for product', product.id, ':', e);
            product.package_options = [];
          }
        }

        // Ensure package_options is an array
        if (!Array.isArray(product.package_options)) {
          product.package_options = [];
        }

        // Ensure stock_quantity is a number
        product.stock_quantity = product.stock_quantity || 0;

        return product as Product;
      });

      setProducts(processedProducts);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, activeOnly]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
}

/**
 * Hook for fetching a single product by ID
 */
export function useProduct(id: string | number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        // Process package_options
        if (data && typeof data.package_options === 'string') {
          try {
            data.package_options = JSON.parse(data.package_options);
          } catch (e) {
            console.error('Error parsing package_options:', e);
            data.package_options = [];
          }
        }

        setProduct(data as Product);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return { product, loading, error };
}
