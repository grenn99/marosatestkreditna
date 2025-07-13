import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Clock, Calendar, Navigation } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

export const LocationSection = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      id="kje-smo"
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-white to-brown-50"
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center justify-center gap-3 bg-brown-100 text-brown-800 px-4 py-2 rounded-full mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-4'}`}>
            <Navigation className="w-5 h-5" />
            <span className="text-sm font-medium">{t('location.visitUs')}</span>
          </div>

          <h2 className={`text-4xl lg:text-5xl font-bold text-brown-800 mb-4 transition-all duration-1000 ${isVisible ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-6'}`}>
            {t('location.title')}
          </h2>

          <div className={`h-1 w-24 bg-amber-500 mx-auto transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 w-24' : 'opacity-0 w-0'}`}></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left Column - Contact Info */}
          <div className={`space-y-6 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 transform-none' : 'opacity-0 -translate-x-10'}`}>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-full">
                  <MapPin className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-brown-800">{t('location.ourLocation')}</h3>
              </div>

              <p className="text-gray-700 mb-3 text-center">{t('location.address')}</p>

              <a
                href="https://maps.google.com/?q=Melinci+80,+9231+Beltinci,+Slovenia"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-amber-600 hover:text-amber-700 font-medium mx-auto"
              >
                <span>{t('location.getDirections')}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-brown-800">{t('location.hoursTitle')}</h3>
              </div>

              <div className="space-y-3 max-w-xs mx-auto">
                <div className="flex flex-col items-center pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-1">
                    <Calendar className="w-5 h-5 text-brown-400" />
                    <span className="text-gray-700">{t('location.weekdays')}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-1">
                    <Calendar className="w-5 h-5 text-brown-400" />
                    <span className="text-gray-700">{t('location.saturday')}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-3 mb-1">
                    <Calendar className="w-5 h-5 text-brown-400" />
                    <span className="text-gray-700">{t('location.sunday')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-brown-800">{t('location.contactTitle')}</h3>
              </div>

              <div className="space-y-3 flex flex-col items-center">
                <div className="flex items-center gap-3 group">
                  <Phone className="w-5 h-5 text-brown-500 group-hover:text-amber-600 transition-colors" />
                  <a
                    href="tel:031627364"
                    className="text-gray-700 group-hover:text-amber-600 transition-colors"
                  >
                    {t('location.phone')}
                  </a>
                </div>

                <div className="flex items-center gap-3 group">
                  <Mail className="w-5 h-5 text-brown-500 group-hover:text-amber-600 transition-colors" />
                  <a
                    href="mailto:kmetija.marosa@gmail.com"
                    className="text-gray-700 group-hover:text-amber-600 transition-colors"
                  >
                    {t('location.email')}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Map */}
          <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 transform-none' : 'opacity-0 translate-x-10'}`}>
            <div className="relative">
              <div className="h-[550px] rounded-xl overflow-hidden shadow-lg bg-stone-100 relative">
                {/* Simple, reliable map solution */}
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-stone-50 to-stone-100">
                  <div className="bg-white rounded-lg p-6 shadow-md max-w-sm">
                    <MapPin className="w-12 h-12 text-brown-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-brown-800 mb-2">Kmetija Maroša</h3>
                    <p className="text-gray-700 mb-4 text-sm">{t('location.address')}</p>
                    <div className="space-y-3">
                      <a
                        href="https://maps.google.com/?q=Melinci+80,+9231+Beltinci,+Slovenia"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-brown-600 hover:bg-brown-700 text-white px-4 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-5 h-5" />
                        {t('location.getDirections')}
                      </a>
                      <a
                        href="https://www.google.com/maps/place/Melinci+80,+9231+Beltinci,+Slovenia/@46.6082479,16.2358258,17z"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
                      >
                        <MapPin className="w-5 h-5" />
                        {t('location.viewOnMaps')}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map overlay with contact info */}
              <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md max-w-xs">
                <h3 className="text-lg font-bold text-brown-800 mb-1">Kmetija Maroša</h3>
                <p className="text-gray-700 mb-3 text-sm">{t('location.address')}</p>
                <a
                  href="https://maps.google.com/?q=Melinci+80,+9231+Beltinci,+Slovenia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-brown-600 hover:bg-brown-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{t('location.navigate')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
