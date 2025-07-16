import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Menu, X, User as UserIcon, LogOut, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { ADMIN_EMAILS, isAdminEmail } from '../config/adminConfig';
import { isAdminUserClientSideOnly } from '../utils/userManagement';

export function Navigation() {
  const { t, i18n } = useTranslation();
  const { cart, gifts } = useCart();
  const { user, signOut, loading: authLoading, isAdmin: serverIsAdmin, isAdminLoading, checkAdminRole } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [clientIsAdmin, setClientIsAdmin] = useState(false);

  // Use both server-side and client-side admin checks
  // This ensures admin functionality works even if the Edge Function isn't deployed yet
  const isAdmin = serverIsAdmin || clientIsAdmin;

  // Client-side admin check as fallback
  useEffect(() => {
    if (user) {
      // Use the optimized client-side-only admin check that uses cached data
      // This avoids unnecessary edge function calls for UI elements
      setClientIsAdmin(isAdminUserClientSideOnly(user));

      // Also try the server-side check, but only if we don't already know the user is an admin
      // This further reduces edge function calls
      if (!clientIsAdmin) {
        checkAdminRole().catch(err => {
          console.warn('Server-side admin check failed, using client-side fallback', err);
        });
      }
    } else {
      setClientIsAdmin(false);
    }
  }, [user, checkAdminRole, clientIsAdmin]);

  // Calculate total cart items (regular items + gift items)
  const regularItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const giftItemCount = gifts.length; // Each gift counts as 1 item
  const cartItemCount = regularItemCount + giftItemCount;

  const handleSignOut = async () => {
    await signOut();
    navigate(`/?lang=${i18n.language}`); // Redirect to home after sign out
  };

  // Function to scroll smoothly to a section (if on homepage)
  const scrollToSection = (sectionId: string) => {
    // Check if we are on the homepage before scrolling
    if (window.location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        const offset = 80; // Adjust based on nav height
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else {
        console.warn(`Element with ID "${sectionId}" not found for scrolling.`);
      }
    } else {
      // If not on homepage, navigate to homepage with hash
      navigate(`/?lang=${i18n.language}#${sectionId}`);
      // Note: Scrolling after navigation might need additional logic if direct hash link doesn't work smoothly
    }
    setIsMobileMenuOpen(false); // Close mobile menu after clicking a link
  };

  const NavLinks = () => (
    <>
      <button onClick={() => scrollToSection('o-nas')} className="hover:text-amber-600 transition-colors">{t('nav.about')}</button>
      <button onClick={() => scrollToSection('izdelki')} className="hover:text-amber-600 transition-colors">{t('nav.products')}</button>
      <button onClick={() => scrollToSection('kje-smo')} className="hover:text-amber-600 transition-colors">{t('nav.location')}</button>
    </>
  );

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-md px-4 sm:px-6 py-3">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo - Link to Homepage */}
        <Link to={`/?lang=${i18n.language}`} className="flex-shrink-0 group">
          <div className="relative overflow-hidden rounded-full p-1 bg-gradient-to-r from-amber-100 to-brown-100 group-hover:from-amber-200 group-hover:to-brown-200 transition-all duration-300">
            <img
              src="/images/logo.png"
              alt={t('nav.logoAlt')}
              className="h-10 w-auto relative z-10 transform group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>

        {/* Desktop Navigation Links with Language Switcher */}
        <div className="hidden md:flex items-center gap-8 font-medium text-gray-700">
          <button
            onClick={() => scrollToSection('o-nas')}
            className="relative overflow-hidden group py-2"
          >
            <span className="relative z-10 text-brown-800 group-hover:text-amber-600 transition-colors duration-300">
              {t('nav.about')}
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
          </button>

          <button
            onClick={() => scrollToSection('izdelki')}
            className="relative overflow-hidden group py-2"
          >
            <span className="relative z-10 text-brown-800 group-hover:text-amber-600 transition-colors duration-300">
              {t('nav.products')}
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
          </button>

          <button
            onClick={() => scrollToSection('kje-smo')}
            className="relative overflow-hidden group py-2"
          >
            <span className="relative z-10 text-brown-800 group-hover:text-amber-600 transition-colors duration-300">
              {t('nav.location')}
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
          </button>

          <Link
            to={`/recipes?lang=${i18n.language}`}
            className="relative overflow-hidden group py-2"
          >
            <span className="relative z-10 text-brown-800 group-hover:text-amber-600 transition-colors duration-300">
              {t('nav.recipes', 'Recipes')}
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
          </Link>

          <Link
            to={`/darilo?lang=${i18n.language}`}
            className="relative overflow-hidden group py-2"
          >
            <span className="relative z-10 text-brown-800 group-hover:text-amber-600 transition-colors duration-300">
              {t('nav.gifts', 'Darilo')}
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
          </Link>

          <div className="border-l pl-6 border-gray-200">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Right side icons & actions */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Cart Icon */}
          <Link
            to={`/cart?lang=${i18n.language}`}
            className="relative p-2 text-brown-700 hover:text-amber-600 transition-colors hover:bg-amber-50 rounded-full"
            aria-label="Shopping Cart"
          >
            <ShoppingCart size={22} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white shadow-md">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* Auth Status/Actions */}
          <div className="flex items-center">
            {authLoading ? (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-amber-600 rounded-full animate-spin"></div>
            ) : user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 text-brown-700 hover:text-amber-600 transition-colors p-2 hover:bg-amber-50 rounded-full">
                  <UserIcon size={22} />
                  <span className="text-sm font-medium hidden lg:inline max-w-[120px] truncate">
                    {user.email?.split('@')[0]}
                  </span>
                </button>
                {/* Dropdown for user menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out transform group-hover:translate-y-0 translate-y-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-500">{t('profile.loggedInAs', 'Logged in as:')}</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                  </div>

                  {/* User account options */}
                  <div className="py-1">
                    <Link
                      to={`/profile?lang=${i18n.language}`}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                    >
                      <UserIcon size={16} className="text-amber-600" />
                      {t('profile.editProfile', 'Edit Profile')}
                    </Link>

                    <Link
                      to={`/change-password?lang=${i18n.language}`}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      {t('profile.password.changePassword', 'Change Password')}
                    </Link>

                    <Link
                      to={`/orders?lang=${i18n.language}`}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                      {t('orders.title', 'My Orders')}
                    </Link>
                  </div>

                  {/* Admin section */}
                  {isAdmin && (
                    <>
                      <div className="border-t border-gray-100 my-1"></div>
                      <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('nav.admin', 'Admin')}</p>
                      </div>

                      <Link
                        to={`/admin/orders?lang=${i18n.language}`}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                      >
                        <Package size={16} className="text-amber-600" />
                        {t('admin.orderManagement.title', 'Order Management')}
                      </Link>

                      <Link
                        to={`/admin/products?lang=${i18n.language}`}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                          <path d="M20.91 8.84L8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.51a2.12 2.12 0 0 0-.09-3.67Z"></path>
                          <path d="m3.09 8.84 12.35-6.61a1.93 1.93 0 0 1 1.81 0l3.65 1.9a2.12 2.12 0 0 1 .1 3.69L8.73 14.75a2 2 0 0 1-1.94 0L3 12.51a2.12 2.12 0 0 1 .09-3.67Z"></path>
                        </svg>
                        {t('admin.products.manage', 'Product Management')}
                      </Link>
                    </>
                  )}

                  {/* Logout */}
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut size={16} />
                    {t('auth.logout', 'Logout')}
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to={`/login?lang=${i18n.language}`}
                className="flex items-center gap-2 text-brown-700 hover:text-amber-600 transition-colors p-2 hover:bg-amber-50 rounded-full"
                title={t('auth.login', 'Login')}
              >
                <UserIcon size={22} />
                <span className="text-sm font-medium hidden md:inline">
                  {t('auth.login', 'Login')}
                </span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-brown-700 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-6 px-6 z-50 border-t border-gray-100">
          <div className="flex flex-col gap-3 items-start text-gray-700 font-medium">
            <button
              onClick={() => scrollToSection('o-nas')}
              className="w-full text-left py-3 px-4 hover:bg-amber-50 active:bg-amber-100 transition-colors flex items-center gap-2 border-b border-gray-100 rounded-lg"
            >
              <span className="text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
              </span>
              <span className="text-brown-800">{t('nav.about')}</span>
            </button>

            <button
              onClick={() => scrollToSection('izdelki')}
              className="w-full text-left py-3 px-4 hover:bg-amber-50 active:bg-amber-100 transition-colors flex items-center gap-2 border-b border-gray-100 rounded-lg"
            >
              <span className="text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </span>
              <span className="text-brown-800">{t('nav.products')}</span>
            </button>

            <button
              onClick={() => scrollToSection('kje-smo')}
              className="w-full text-left py-3 px-4 hover:bg-amber-50 active:bg-amber-100 transition-colors flex items-center gap-2 border-b border-gray-100 rounded-lg"
            >
              <span className="text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </span>
              <span className="text-brown-800">{t('nav.location')}</span>
            </button>

            <Link
              to={`/recipes?lang=${i18n.language}`}
              className="w-full text-left py-3 px-4 hover:bg-amber-50 active:bg-amber-100 transition-colors flex items-center gap-2 border-b border-gray-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19h16"></path>
                  <path d="M4 5h16"></path>
                  <path d="M4 12h16"></path>
                  <path d="M9 9l3 3-3 3"></path>
                </svg>
              </span>
              <span className="text-brown-800">{t('nav.recipes', 'Recipes')}</span>
            </Link>

            <Link
              to={`/darilo?lang=${i18n.language}`}
              className="w-full text-left py-3 px-4 hover:bg-amber-50 active:bg-amber-100 transition-colors flex items-center gap-2 border-b border-gray-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12v10H4V12"></path>
                  <path d="M2 7h20v5H2z"></path>
                  <path d="M12 22V7"></path>
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                </svg>
              </span>
              <span className="text-brown-800">{t('nav.gifts', 'Darilo')}</span>
            </Link>

            <div className="w-full pt-3 flex justify-start">
              <div className="flex gap-2">
                <button
                  onClick={() => i18n.changeLanguage('sl')}
                  className={`px-3 py-1 rounded ${i18n.language === 'sl' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  SL
                </button>
                <button
                  onClick={() => i18n.changeLanguage('en')}
                  className={`px-3 py-1 rounded ${i18n.language === 'en' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => i18n.changeLanguage('de')}
                  className={`px-3 py-1 rounded ${i18n.language === 'de' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  DE
                </button>
                <button
                  onClick={() => i18n.changeLanguage('hr')}
                  className={`px-3 py-1 rounded ${i18n.language === 'hr' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  HR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
