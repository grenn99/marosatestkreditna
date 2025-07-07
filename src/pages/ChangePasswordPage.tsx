import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { isValidPassword } from '../utils/validation';

export function ChangePasswordPage() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Initialize with empty strings to prevent any pre-filled values
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Security check to prevent API keys from being displayed in password fields
  const isEnvironmentVariable = (value: string): boolean => {
    // If value is empty or not a string, it's not an API key
    if (!value || typeof value !== 'string') {
      return false;
    }

    // Check if the value looks like an API key or sensitive token
    // Stripe API keys start with sk_ or pk_ and are typically long
    const stripeKeyPattern = /^(sk|pk)_(test|live)_[A-Za-z0-9]{24,}$/;

    // JWT tokens have a specific format with three base64 sections separated by dots
    const jwtPattern = /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

    // Supabase anon keys typically start with eyJ and are quite long
    const supabaseKeyPattern = /^eyJ[A-Za-z0-9-_]{80,}$/;

    // Check if the value matches any of our sensitive patterns
    return stripeKeyPattern.test(value) ||
           jwtPattern.test(value) ||
           supabaseKeyPattern.test(value);
  };

  // Clear any pre-filled passwords and check for environment variables on component mount
  useEffect(() => {
    // Always clear password fields on component mount to prevent any pre-filled values
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    // Add a MutationObserver to detect if browser auto-fill or other scripts
    // might be setting values in the password fields
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
          const target = mutation.target as HTMLInputElement;
          const value = target.value;

          if (value && isEnvironmentVariable(value)) {
            console.error(`Detected environment variable in ${target.id} field. Clearing for security.`);
            target.value = '';

            // Update the corresponding state
            if (target.id === 'currentPassword') setCurrentPassword('');
            if (target.id === 'newPassword') setNewPassword('');
            if (target.id === 'confirmPassword') setConfirmPassword('');
          }
        }
      });
    });

    // Observe value changes on password fields
    if (currentPasswordInput) {
      observer.observe(currentPasswordInput, { attributes: true });
    }
    if (newPasswordInput) {
      observer.observe(newPasswordInput, { attributes: true });
    }
    if (confirmPasswordInput) {
      observer.observe(confirmPasswordInput, { attributes: true });
    }

    // Clean up observer on component unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  // Redirect if not logged in
  if (!authLoading && !user) {
    navigate(`/checkout?lang=${i18n.language}`);
    return null;
  }

  // We'll use the isValidPassword function from utils/validation.ts instead
  // This ensures consistent password requirements across the application

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.currentPassword = t('validation.required', 'This field is required');
    }

    if (!newPassword) {
      newErrors.newPassword = t('validation.required', 'This field is required');
    } else {
      // Check password strength using the isValidPassword function
      if (!isValidPassword(newPassword)) {
        newErrors.newPassword = t(
          'validation.passwordStrength',
          'Geslo mora vsebovati vsaj 10 znakov, vključno z veliko črko, malo črko, številko in posebnim znakom'
        );
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('validation.required', 'This field is required');
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordMatch', 'Passwords do not match');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    try {
      setLoading(true);
      setError(null);

      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: currentPassword
      });

      if (signInError) {
        setError(t('profile.password.passwordError', 'Error updating password'));
        setLoading(false);
        return;
      }

      // Then update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('Error updating password:', updateError);
        setError(t('profile.password.passwordError', 'Error updating password'));
      } else {
        setSuccess(true);
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error('Exception updating password:', err);
      setError(t('profile.passwordUpdateError', 'Failed to update password'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Enhanced security check for sensitive data
    if (value && value.length > 20) {
      // Check for environment variables or API keys
      if (isEnvironmentVariable(value)) {
        console.error('Attempted to set a password field to what appears to be an API key or token. This has been blocked for security reasons.');

        // Clear the input field value directly
        e.target.value = '';

        // Report the security incident (in a real app, this might log to a security monitoring system)
        console.warn('SECURITY: Attempted to use sensitive data in password field');

        return;
      }

      // Additional check for database connection strings
      if (value.includes('@') && value.includes(':') && (value.includes('postgres') || value.includes('mysql'))) {
        console.error('Attempted to set a password field to what appears to be a database connection string. This has been blocked for security reasons.');
        e.target.value = '';
        return;
      }
    }

    setter(value);

    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Reset success message when form is edited
    if (success) {
      setSuccess(false);
    }
  };

  if (authLoading) {
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
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">{t('profile.password.changePassword', 'Change Password')}</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {t('profile.password.passwordUpdated', 'Password updated successfully')}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.password.currentPassword', 'Current Password')} *
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="currentPassword"
                value={currentPassword}
                onChange={handleInputChange(setCurrentPassword, 'currentPassword')}
                className={`w-full px-3 py-2 border rounded-md ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loading}
                autoComplete="new-password" // Prevent browser from suggesting stored passwords
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-lpignore="true" // LastPass ignore
                data-form-type="other" // Additional hint for password managers
                aria-autocomplete="none" // Accessibility hint
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.password.newPassword', 'New Password')} *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={handleInputChange(setNewPassword, 'newPassword')}
                className={`w-full px-3 py-2 border rounded-md ${errors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}

            {/* Password Strength Meter */}
            {newPassword && (
              <div className="mt-2">
                <PasswordStrengthMeter password={newPassword} />
                {showNewPassword && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    <p className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      {t('auth.passwordVisibilityWarning', 'Geslo je trenutno vidno. Prepričajte se, da vas nihče ne opazuje.')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.password.confirmPassword', 'Confirm New Password')} *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleInputChange(setConfirmPassword, 'confirmPassword')}
                className={`w-full px-3 py-2 border rounded-md ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(`/?lang=${i18n.language}`)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2"
              disabled={loading}
            >
              {t('profile.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:bg-amber-400"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common.updating', 'Updating...')}
                </span>
              ) : (
                t('profile.password.updatePassword', 'Update Password')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
