import { ChevronDown, Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export function Header() {
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);

  // Function to scroll smoothly to a section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Calculate offset based on potential fixed header height if needed in future
      const offset = 0; // Adjust if you add a fixed nav bar later
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
  };

  useEffect(() => {
    // Set loaded state after a short delay for animation purposes
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    // Using relative positioning for content overlay and nav
    <header className="relative h-screen flex flex-col overflow-hidden">
      {/* Background Image and Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          className="w-full h-full object-cover animate-slow-zoom"
          alt={t('hero.title')}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div> {/* Gradient Overlay */}
      </div>

      {/* Centered Logo */}
      <div
        className={`relative z-20 flex justify-center items-center pt-20 transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-10'}`}
      >
        <Link to="/" className="hover:opacity-90 transition-opacity">
          <div className="relative transform hover:scale-105 transition-transform duration-300">
            <img
              src="/images/logo.png"
              alt="Kmetija Maroša"
              className="w-[180px] h-[160px] sm:w-[220px] sm:h-[190px] lg:w-[260px] lg:h-[225px] relative z-10"
            />
          </div>
        </Link>
      </div>

      {/* Hero Content - Centered */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center flex-grow text-center text-white px-4 transition-all duration-1000 delay-300 ease-out ${isLoaded ? 'opacity-100 transform-none' : 'opacity-0 translate-y-10'}`}
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-shadow-lg">{t('hero.title')}</h1>
        <p className="text-xl md:text-2xl mb-10 max-w-2xl text-shadow-md">{t('hero.subtitle')}</p>

        {/* Button to scroll to products with enhanced styling */}
        <button
          onClick={() => scrollToSection('izdelki')}
          className="group relative overflow-hidden bg-gradient-to-r from-amber-600 to-brown-600 hover:from-amber-500 hover:to-brown-500 text-white px-10 py-4 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Leaf className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
            {t('hero.cta')}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-brown-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </button>

        {/* Animated scroll indicator with enhanced styling */}
        <div className="absolute bottom-12 flex flex-col items-center">
          <span className="text-white/80 text-sm mb-2 animate-pulse">Scroll Down</span>
          <ChevronDown className="w-8 h-8 animate-bounce text-white/90" />
        </div>
      </div>
    </header>
  );
}
