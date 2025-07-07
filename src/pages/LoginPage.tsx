import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { isValidPassword } from '../utils/validation';
import { generateCsrfToken, validateCsrfToken } from '../utils/csrfProtection';
import { checkRateLimit, incrementRateLimit, formatTimeRemaining } from '../utils/rateLimiting';
import { handleAuthError, ErrorCategory, ErrorSeverity } from '../utils/errorHandling';
import { logSecurityEvent, SecurityEventType } from '../utils/securityMonitoring';

export function LoginPage() {
  const { t, i18n } = useTranslation();
  const { signInWithPassword, signUp, checkEmailExists, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [rateLimitInfo, setRateLimitInfo] = useState<{ isLimited: boolean; timeRemaining: number }>({
    isLimited: false,
    timeRemaining: 0
  });

  // Generate CSRF token on component mount
  useEffect(() => {
    setCsrfToken(generateCsrfToken());
  }, []);

  // Check rate limiting on component mount
  useEffect(() => {
    const result = checkRateLimit('auth_attempts', {
      maxAttempts: 5,
      windowMs: 60000, // 1 minute
      blockDurationMs: 300000 // 5 minutes
    });
    setRateLimitInfo(result);

    // Set up interval to update remaining time
    if (result.isLimited && result.timeRemaining > 0) {
      const interval = setInterval(() => {
        setRateLimitInfo(prev => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1000)
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // Get the redirect URL from query parameters or default to home
      const params = new URLSearchParams(location.search);
      const redirectTo = params.get('redirectTo') || '/';
      navigate(redirectTo + (redirectTo.includes('?') ? '&' : '?') + `lang=${i18n.language}`);
    }
  }, [user, navigate, location.search, i18n.language]);

  // Check for mode parameter to switch between login and register
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    if (mode === 'register') {
      setIsLogin(false);
    }
  }, [location.search]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = t('validation.required', 'To polje je obvezno');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('validation.email', 'Vnesite veljaven e-poštni naslov');
    }

    if (!password) {
      newErrors.password = t('validation.required', 'To polje je obvezno');
    } else if (isLogin) {
      // For login, just check if password is provided
      if (password.length < 1) {
        newErrors.password = t('validation.required', 'To polje je obvezno');
      }
    } else {
      // For registration, use our enhanced password validation
      if (!isValidPassword(password)) {
        newErrors.password = t(
          'validation.passwordStrength',
          'Geslo mora vsebovati vsaj 10 znakov, vključno z veliko črko, malo črko, številko in posebnim znakom'
        );
      }
    }

    if (!isLogin) {
      if (!confirmPassword) {
        newErrors.confirmPassword = t('validation.required', 'To polje je obvezno');
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = t('validation.passwordMatch', 'Gesli se ne ujemata');
      }

      if (!fullName.trim()) {
        newErrors.fullName = t('validation.required', 'To polje je obvezno');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailBlur = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;

    try {
      setCheckingEmail(true);
      const exists = await checkEmailExists(email);

      // Automatically switch mode based on email existence
      // For now, we'll just keep the current mode since our checkEmailExists is simplified
      setIsLogin(true);
    } catch (err) {
      console.error('Error checking email:', err);
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Check rate limiting
    if (rateLimitInfo.isLimited) {
      // Log security event for rate limit exceeded
      logSecurityEvent(SecurityEventType.RATE_LIMIT_EXCEEDED, {
        formType: isLogin ? 'login' : 'signup',
        timeRemaining: rateLimitInfo.timeRemaining
      });

      setError(t('auth.rateLimitError', 'Preveč poskusov prijave. Poskusite znova čez {{time}}.', {
        time: formatTimeRemaining(rateLimitInfo.timeRemaining)
      }));
      return;
    }

    // Validate CSRF token
    if (!validateCsrfToken(csrfToken)) {
      // Log security event for potential CSRF attack
      logSecurityEvent(SecurityEventType.CSRF_ATTACK_ATTEMPT, {
        formType: isLogin ? 'login' : 'signup',
        providedToken: csrfToken
      });

      setError(t('auth.csrfError', 'Varnostna napaka. Prosimo, osvežite stran in poskusite znova.'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Login
        const { error: signInError } = await signInWithPassword({
          email,
          password
        });

        if (signInError) {
          // Use centralized error handling
          const userMessage = t('auth.loginError', 'Napačen e-poštni naslov ali geslo');
          handleAuthError(signInError, userMessage);

          // Log security event for authentication failure
          logSecurityEvent(SecurityEventType.AUTHENTICATION_FAILURE, {
            email: email,
            reason: signInError.message || 'Invalid credentials'
          });

          // Increment rate limit counter on failed login
          const result = incrementRateLimit('auth_attempts', {
            maxAttempts: 5,
            windowMs: 60000, // 1 minute
            blockDurationMs: 300000 // 5 minutes
          });
          setRateLimitInfo(result);

          if (result.isLimited) {
            setError(t('auth.rateLimitError', 'Preveč poskusov prijave. Poskusite znova čez {{time}}.', {
              time: formatTimeRemaining(result.timeRemaining)
            }));
          } else {
            setError(userMessage);
          }
        } else {
          // Log security event for successful authentication
          logSecurityEvent(SecurityEventType.AUTHENTICATION_SUCCESS, {
            email: email
          });

          // Redirect to home page after successful login
          navigate(`/?lang=${i18n.language}`);
        }
      } else {
        // Register
        const { error: signUpError } = await signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              default_shipping_address: JSON.stringify({
                address: '',
                city: '',
                postalCode: '',
                country: 'Slovenija'
              })
            }
          }
        });

        if (signUpError) {
          // Use centralized error handling
          const userMessage = t('auth.signupError', 'Registracija ni uspela. Poskusite znova.');
          handleAuthError(signUpError, userMessage);

          // Log security event for signup failure
          logSecurityEvent(SecurityEventType.AUTHENTICATION_FAILURE, {
            email: email,
            action: 'signup',
            reason: signUpError.message || 'Registration failed'
          });

          setError(userMessage);
        } else {
          // Log security event for successful signup
          logSecurityEvent(SecurityEventType.AUTHENTICATION_SUCCESS, {
            email: email,
            action: 'signup'
          });

          // Show success message and switch to login mode
          setError(null);
          setIsLogin(true);
          // Clear registration fields
          setConfirmPassword('');
          setFullName('');
          // Show success message
          alert(t('auth.signupSuccess', 'Registracija uspešna! Preverite svoj e-poštni naslov za potrditev računa.'));
        }
      }
    } catch (err) {
      // Use centralized error handling
      const userMessage = t('auth.generalError', 'Prišlo je do napake. Poskusite znova.');
      handleAuthError(err instanceof Error ? err : new Error(String(err)), userMessage);
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isLogin
            ? t('auth.loginTitle', 'Prijava')
            : t('auth.registerTitle', 'Registracija')}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Hidden CSRF token */}
          <input type="hidden" name="csrf_token" value={csrfToken} />

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.email', 'E-pošta')} *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              disabled={loading}
              required
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            {checkingEmail && (
              <p className="mt-1 text-xs text-gray-500">{t('auth.checkingEmail', 'Preverjanje e-pošte...')}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.password', 'Geslo')} *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => {
                  // Enhanced security check to prevent sensitive data in password fields
                  const value = e.target.value;

                  // Check for API keys
                  const apiKeyPattern = /^(sk|pk)_(test|live)_[A-Za-z0-9]+$/;
                  // Check for JWT tokens
                  const jwtPattern = /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
                  // Check for database connection strings
                  const dbConnPattern = /postgres(ql)?:\/\/[^:]+:[^@]+@.+/;
                  // Check for environment variable format
                  const envVarPattern = /^[A-Z_]+=[A-Za-z0-9_\-\.\/]+$/;

                  if (apiKeyPattern.test(value) ||
                      jwtPattern.test(value) ||
                      dbConnPattern.test(value) ||
                      envVarPattern.test(value)) {
                    console.error('Attempted to set a password field to what appears to be sensitive data. This has been blocked for security reasons.');
                    e.target.value = ''; // Clear the input field directly
                    return;
                  }

                  setPassword(value);
                }}
                className={`w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loading}
                required
                autoComplete="new-password" // Prevent browser from suggesting stored passwords
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-lpignore="true" // LastPass ignore
                data-form-type="password" // Additional hint for password managers
                aria-autocomplete="none" // Accessibility hint
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                aria-label={showPassword ? t('auth.hidePassword', 'Hide password') : t('auth.showPassword', 'Show password')}
                title={showPassword ? t('auth.hidePassword', 'Hide password') : t('auth.showPassword', 'Show password')}
              >
                {showPassword ? (
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
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}

            {/* Show password strength meter only during registration */}
            {!isLogin && password && (
              <div className="mt-2">
                <PasswordStrengthMeter password={password} />
                {showPassword && (
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

          {!isLogin && (
            <>
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.confirmPassword', 'Ponovite geslo')} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => {
                      // Enhanced security check to prevent sensitive data in password fields
                      const value = e.target.value;

                      // Check for API keys
                      const apiKeyPattern = /^(sk|pk)_(test|live)_[A-Za-z0-9]+$/;
                      // Check for JWT tokens
                      const jwtPattern = /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
                      // Check for database connection strings
                      const dbConnPattern = /postgres(ql)?:\/\/[^:]+:[^@]+@.+/;
                      // Check for environment variable format
                      const envVarPattern = /^[A-Z_]+=[A-Za-z0-9_\-\.\/]+$/;

                      if (apiKeyPattern.test(value) ||
                          jwtPattern.test(value) ||
                          dbConnPattern.test(value) ||
                          envVarPattern.test(value)) {
                        console.error('Attempted to set a password field to what appears to be sensitive data. This has been blocked for security reasons.');
                        e.target.value = ''; // Clear the input field directly
                        return;
                      }

                      setConfirmPassword(value);
                    }}
                    className={`w-full px-3 py-2 border rounded-md ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={loading}
                    required
                    autoComplete="new-password" // Prevent browser from suggesting stored passwords
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-lpignore="true" // LastPass ignore
                    data-form-type="password" // Additional hint for password managers
                    aria-autocomplete="none" // Accessibility hint
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                  >
                    {showPassword ? (
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

              <div className="mb-4">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.fullName', 'Polno ime')} *
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={loading}
                  required
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
              </div>
            </>
          )}

          <div className="mt-6">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:bg-amber-400"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin
                    ? t('auth.loggingIn', 'Prijavljanje...')
                    : t('auth.registering', 'Registracija...')}
                </span>
              ) : (
                isLogin
                  ? t('auth.login', 'Prijava')
                  : t('auth.register', 'Registracija')
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-amber-600 hover:text-amber-700 text-sm"
            >
              {isLogin
                ? t('auth.needAccount', 'Nimate računa? Registrirajte se')
                : t('auth.haveAccount', 'Že imate račun? Prijavite se')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
