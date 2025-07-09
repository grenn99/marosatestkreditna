import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { getPhonePlaceholder, formatPhoneNumber } from '../utils/formatters';
import { GDPRDataManagement } from '../components/GDPRDataManagement';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  telephone_nr?: string;
  default_shipping_address?: string;
  username?: string;
  avatar_url?: string;
  website?: string;
  updated_at?: string;
}

interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address: '',
    city: '',
    postalCode: '',
    country: 'Slovenija'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      navigate(`/checkout?lang=${i18n.language}`);
      return;
    }

    // Fetch profile data
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          setError(t('profile.fetchError', 'Failed to load profile data'));
        } else {
          setProfile(data);
          
          // Parse shipping address if available
          if (data.default_shipping_address) {
            try {
              const parsedAddress = typeof data.default_shipping_address === 'string' 
                ? JSON.parse(data.default_shipping_address)
                : data.default_shipping_address;
              
              setShippingAddress({
                address: parsedAddress.address || '',
                city: parsedAddress.city || '',
                postalCode: parsedAddress.postalCode || '',
                country: parsedAddress.country || 'Slovenija'
              });
            } catch (parseErr) {
              console.error('Error parsing shipping address:', parseErr);
            }
          }
        }
      } catch (err) {
        console.error('Exception fetching profile:', err);
        setError(t('profile.fetchError', 'Failed to load profile data'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading, navigate, i18n.language, t]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!profile?.full_name?.trim()) {
      newErrors.full_name = t('validation.required', 'This field is required');
    }
    
    if (!profile?.email?.trim()) {
      newErrors.email = t('validation.required', 'This field is required');
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = t('validation.email', 'Please enter a valid email address');
    }
    
    if (shippingAddress.postalCode && !/^\d{4}$/.test(shippingAddress.postalCode)) {
      newErrors.postal_code = t('validation.postalCode', 'Postal code must be 4 digits');
    }
    
    if (shippingAddress.city && shippingAddress.city.length < 2) {
      newErrors.city = t('validation.cityLength', 'City name must be at least 2 characters');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle profile fields
    if (name === 'full_name' || name === 'email') {
      setProfile(prev => prev ? { ...prev, [name]: value } : null);
    }
    // Handle telephone_nr field with formatting
    else if (name === 'phone') {
      const formatted = formatPhoneNumber(value, shippingAddress.country);
      setProfile(prev => prev ? { ...prev, telephone_nr: formatted } : null);
    }
    // Handle shipping address fields
    else if (['address', 'city', 'postal_code', 'country'].includes(name)) {
      const addressFieldName = name === 'postal_code' ? 'postalCode' : name;
      setShippingAddress(prev => ({ ...prev, [addressFieldName]: value }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Reset success message when form is edited
    if (success) {
      setSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !profile || !user) return;
    
    try {
      setSaving(true);
      setError(null);
      
      // Create shipping address object
      const shippingAddressJson = JSON.stringify(shippingAddress);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          username: profile.full_name,
          email: profile.email,
          telephone_nr: profile.telephone_nr,
          default_shipping_address: shippingAddressJson,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating profile:', error);
        setError(t('profile.updateError', 'Failed to update profile'));
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Exception updating profile:', err);
      setError(t('profile.updateError', 'Failed to update profile'));
    } finally {
      setSaving(false);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">{t('profile.editProfile', 'Edit Profile')}</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {t('profile.updateSuccess', 'Profile updated successfully')}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.fullName', 'Full Name')} *
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={profile?.full_name || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.full_name ? 'border-red-500' : 'border-gray-300'}`}
                disabled={saving}
              />
              {errors.full_name && <p className="mt-1 text-sm text-red-600">{t('profile.required', 'Required field')}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.email', 'Email')} *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile?.email || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                disabled={saving}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{t('profile.required', 'Required field')}</p>}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.phoneNumber', 'Phone Number')}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile?.telephone_nr || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={saving}
                placeholder={getPhonePlaceholder(shippingAddress.country)}
              />
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.address', 'Address')}
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={shippingAddress.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={saving}
              />
            </div>
            
            <div>
              <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.postalCode', 'Postal Code')}
              </label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={shippingAddress.postalCode}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.postal_code ? 'border-red-500' : 'border-gray-300'}`}
                disabled={saving}
                placeholder="1000"
              />
              {errors.postal_code ? (
                <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">{t('profile.postalCodeHint', 'Enter a 4-digit postal code')}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.city', 'City')}
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={shippingAddress.city}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                disabled={saving}
              />
              {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
            </div>
            
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.country', 'Country')}
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={shippingAddress.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                disabled={true}
              />
              <p className="mt-1 text-xs text-gray-500">{t('profile.shippingNote', 'Currently only shipping to Slovenia')}</p>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => navigate(`/?lang=${i18n.language}`)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2"
              disabled={saving}
            >
              {t('profile.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:bg-amber-400"
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common.saving', 'Saving...')}
                </span>
              ) : (
                t('profile.saveChanges', 'Save Changes')
              )}
            </button>
          </div>
        </form>
      </div>

      {/* GDPR Data Management */}
      <div className="mt-8">
        <GDPRDataManagement />
      </div>
    </div>
  );
}
