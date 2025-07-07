import { useTranslation } from 'react-i18next';
import { Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const { t, i18n } = useTranslation();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gradient-to-b from-brown-800 to-brown-900 text-white pt-16 pb-8 px-6 lg:px-12 mt-auto">
      <div className="container mx-auto">
        {/* Top section with logo, links and contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Logo and about */}
          <div className="space-y-4">
            <Link to="/" className="block">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl inline-block">
                <img
                  src="https://i.ibb.co/8D2qrWnG/logo.png"
                  alt={t('nav.logoAlt')}
                  className="w-[100px] h-[87.5px]"
                />
              </div>
            </Link>
            <p className="text-gray-300 text-sm">
              {t('footer.rights')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-amber-300">{t('footer.quickLinks', 'Quick Links')}</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection('o-nas')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t('nav.about')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('izdelki')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t('nav.products')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('kje-smo')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t('nav.location')}
                </button>
              </li>
              <li>
                <Link to="/cart" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.cart')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-amber-300">{t('footer.contactUs', 'Contact Us')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                <MapPin className="w-5 h-5 text-amber-400" />
                <span>{t('location.address')}</span>
              </li>
              <li>
                <a
                  href="tel:031627364"
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                >
                  <Phone className="w-5 h-5 text-amber-400" />
                  <span>{t('location.phone')}</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:kmetija.marosa@gmail.com"
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                >
                  <Mail className="w-5 h-5 text-amber-400" />
                  <span>{t('location.email')}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Language and Social */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-amber-300">{t('footer.followUs', 'Follow Us')}</h3>
            <div className="flex gap-4 mb-8">
              <a
                href="https://www.facebook.com/p/Kmetija-Maro%C5%A1a-100083322333249/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brown-700 hover:bg-brown-600 p-3 rounded-full transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>

            </div>

            <h3 className="text-xl font-bold mb-4 text-amber-300">{t('footer.language', 'Language')}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => i18n.changeLanguage('sl')}
                className={`px-3 py-1 rounded ${i18n.language === 'sl' ? 'bg-amber-600 text-white' : 'bg-brown-700 text-gray-300 hover:bg-brown-600'}`}
              >
                SL
              </button>
              <button
                onClick={() => i18n.changeLanguage('en')}
                className={`px-3 py-1 rounded ${i18n.language === 'en' ? 'bg-amber-600 text-white' : 'bg-brown-700 text-gray-300 hover:bg-brown-600'}`}
              >
                EN
              </button>
              <button
                onClick={() => i18n.changeLanguage('de')}
                className={`px-3 py-1 rounded ${i18n.language === 'de' ? 'bg-amber-600 text-white' : 'bg-brown-700 text-gray-300 hover:bg-brown-600'}`}
              >
                DE
              </button>
              <button
                onClick={() => i18n.changeLanguage('hr')}
                className={`px-3 py-1 rounded ${i18n.language === 'hr' ? 'bg-amber-600 text-white' : 'bg-brown-700 text-gray-300 hover:bg-brown-600'}`}
              >
                HR
              </button>
            </div>
          </div>
        </div>

        {/* Bottom section with copyright */}
        <div className="pt-8 border-t border-brown-700 text-center">
          <p className="text-gray-400 text-sm">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
