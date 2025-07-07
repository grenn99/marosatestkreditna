import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { isAdminByEmail, isAdminByMetadata, isAdminByProfilesTable, isAdminByEdgeFunction } from '../utils/adminCheck';
import { supabase } from '../lib/supabaseClient';
import { useFirstTimeVisitor } from '../hooks/useFirstTimeVisitor';

export function AdminDebugPage() {
  const { user, loading: authLoading } = useAuth();
  const { forceShowPopup } = useFirstTimeVisitor();
  const [adminByEmail, setAdminByEmail] = useState<boolean>(false);
  const [adminByMetadata, setAdminByMetadata] = useState<boolean>(false);
  const [adminByProfilesTable, setAdminByProfilesTable] = useState<boolean>(false);
  const [adminByEdgeFunction, setAdminByEdgeFunction] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fixingAdmin, setFixingAdmin] = useState<boolean>(false);
  const [fixingImages, setFixingImages] = useState<boolean>(false);
  const [clearingCache, setClearingCache] = useState<boolean>(false);
  const [showingPopup, setShowingPopup] = useState<boolean>(false);
  const [fixMessage, setFixMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    const checkAdminStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check admin status by email
        const isAdminEmail = isAdminByEmail(user);
        setAdminByEmail(isAdminEmail);

        // Check admin status by metadata
        const isAdminMetadata = isAdminByMetadata(user);
        setAdminByMetadata(isAdminMetadata);

        // Check admin status by profiles table
        const isAdminProfiles = await isAdminByProfilesTable(user);
        setAdminByProfilesTable(isAdminProfiles);

        // Check admin status by Edge Function
        const isAdminEdgeFunction = await isAdminByEdgeFunction(user);
        setAdminByEdgeFunction(isAdminEdgeFunction);
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Error checking admin status');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, authLoading]);

  // Function to clear admin cache
  const clearAdminCache = () => {
    try {
      setClearingCache(true);
      setFixMessage('Clearing admin cache...');
      setError(null);

      // Get all keys in localStorage
      const keys = Object.keys(localStorage);

      // Filter for admin-related keys
      const adminKeys = keys.filter(key =>
        key.includes('admin_') ||
        key === 'admin_session' ||
        key === 'admin_session_storage'
      );

      // Remove each admin-related key
      adminKeys.forEach(key => {
        console.log(`Removing key: ${key}`);
        localStorage.removeItem(key);
      });

      // Also clear sessionStorage
      sessionStorage.removeItem('admin_session');

      setFixMessage('Admin cache cleared successfully. Please refresh the page.');
    } catch (error) {
      console.error('Error clearing admin cache:', error);
      setError('Error clearing admin cache: ' + (error as Error).message);
    } finally {
      setClearingCache(false);
    }
  };

  // Function to fix admin access issues
  const fixAdminAccess = async () => {
    try {
      setFixingAdmin(true);
      setFixMessage('Fixing admin access...');
      setError(null);

      // Admin session keys
      const ADMIN_SESSION_KEY = 'admin_session';
      const ADMIN_SESSION_STORAGE_KEY = 'admin_session_storage';

      // Check if we have an admin session in sessionStorage
      const sessionData = sessionStorage.getItem(ADMIN_SESSION_KEY);

      if (sessionData) {
        console.log('Found admin session in sessionStorage, copying to localStorage');

        // Copy to localStorage for persistence
        localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, sessionData);
        console.log('Admin session copied to localStorage');
      } else {
        // Check if we have an admin session in localStorage
        const storageData = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);

        if (storageData) {
          console.log('Found admin session in localStorage, copying to sessionStorage');

          // Copy to sessionStorage
          sessionStorage.setItem(ADMIN_SESSION_KEY, storageData);
          console.log('Admin session copied to sessionStorage');
        } else {
          console.log('No admin session found in either storage');
        }
      }

      if (user) {
        // Check if we have admin status cached
        const adminStatus = localStorage.getItem(`admin_status_${user.id}`);

        if (adminStatus === 'true') {
          console.log('User is an admin according to cached status');

          // Create a new admin session if none exists
          if (!sessionData && !localStorage.getItem(ADMIN_SESSION_STORAGE_KEY)) {
            console.log('Creating new admin session');

            const now = Date.now();
            const session = {
              timestamp: now,
              verified: true
            };

            // Store in both storages
            sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
            localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));

            console.log('New admin session created');
          }
        } else {
          console.log('User is not an admin according to cached status');
        }
      }

      setFixMessage('Admin access fix completed. Please refresh the page.');
    } catch (error) {
      console.error('Error fixing admin access:', error);
      setError('Error fixing admin access: ' + (error as Error).message);
    } finally {
      setFixingAdmin(false);
    }
  };

  // Function to fix Darilni paket image issues
  const fixDarilniPaketImages = async () => {
    try {
      setFixingImages(true);
      setFixMessage('Fixing Darilni paket images...');
      setError(null);

      // Find all Darilni paket products
      const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .ilike('name', '%Darilni paket%');

      if (fetchError) {
        throw new Error('Error fetching Darilni paket products: ' + fetchError.message);
      }

      console.log(`Found ${products.length} Darilni paket products`);

      // Update each product
      for (const product of products) {
        console.log(`Processing product ID ${product.id}: ${product.name}`);

        // Get current additional images
        let additionalImages = product.additional_images || [];

        // Check if the product already has the paket 3.jpg image
        const hasPacket3Image = additionalImages.some(img =>
          img.includes('paket 3.jpg') || img.includes('paket%203.jpg')
        );

        if (!hasPacket3Image) {
          console.log(`Adding paket 3.jpg to product ID ${product.id}`);

          // Add the image with the correct path
          additionalImages.push('./images/paket 3.jpg');

          // Update the product
          const { error: updateError } = await supabase
            .from('products')
            .update({
              additional_images: additionalImages,
              // Also ensure these are set correctly
              image_url: './images/darilni_paket/gift_package.jpg',
              category: 'gift'
            })
            .eq('id', product.id);

          if (updateError) {
            console.error(`Error updating product ${product.id}:`, updateError);
          } else {
            console.log(`Successfully updated product ${product.id}`);
          }
        } else {
          console.log(`Product ID ${product.id} already has paket 3.jpg image`);
        }
      }

      setFixMessage('Darilni paket image fix completed. Please refresh the page.');
    } catch (error) {
      console.error('Error fixing Darilni paket images:', error);
      setError('Error fixing Darilni paket images: ' + (error as Error).message);
    } finally {
      setFixingImages(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          You must be logged in to view this page.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Debug Page</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {fixMessage && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          {fixMessage}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        <div className="mb-4">
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Metadata:</strong> {JSON.stringify(user.user_metadata, null, 2)}</p>
        </div>

        <h2 className="text-xl font-semibold mb-4">Admin Status</h2>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="w-48">Admin by Email:</span>
            <span className={`px-2 py-1 rounded-full text-xs ${adminByEmail ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {adminByEmail ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-48">Admin by Metadata:</span>
            <span className={`px-2 py-1 rounded-full text-xs ${adminByMetadata ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {adminByMetadata ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-48">Admin by Profiles Table:</span>
            <span className={`px-2 py-1 rounded-full text-xs ${adminByProfilesTable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {adminByProfilesTable ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-48">Admin by Edge Function:</span>
            <span className={`px-2 py-1 rounded-full text-xs ${adminByEdgeFunction ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {adminByEdgeFunction ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden p-6">
        <h2 className="text-xl font-semibold mb-4">Fix Tools</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Admin Access Fix</h3>
            <p className="text-gray-600 mb-4">
              Fixes the issue where admin access is lost when switching between apps or tabs.
              This ensures admin sessions are properly stored in both sessionStorage and localStorage.
            </p>
            <button
              onClick={fixAdminAccess}
              disabled={fixingAdmin}
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
            >
              {fixingAdmin ? 'Fixing...' : 'Fix Admin Access'}
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Darilni Paket Image Fix</h3>
            <p className="text-gray-600 mb-4">
              Fixes the issue where Darilni paket products show a placeholder image instead of the correct image.
              Ensures all Darilni paket products have the correct image paths.
            </p>
            <button
              onClick={fixDarilniPaketImages}
              disabled={fixingImages}
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
            >
              {fixingImages ? 'Fixing...' : 'Fix Darilni Paket Images'}
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Clear Admin Cache</h3>
            <p className="text-gray-600 mb-4">
              Clears all admin-related cache from localStorage and sessionStorage.
              Use this if you're still experiencing admin access issues after trying the other fixes.
            </p>
            <button
              onClick={clearAdminCache}
              disabled={clearingCache}
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
            >
              {clearingCache ? 'Clearing...' : 'Clear Admin Cache'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
