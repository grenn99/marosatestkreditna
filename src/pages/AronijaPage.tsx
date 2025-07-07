import { Footer } from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { Leaf, Award, Sun, Droplets } from 'lucide-react';

export function AronijaPage() {
  const navigate = useNavigate();

  const handleNavigation = (section: string | null = null) => {
    navigate('/', { replace: true });
    if (section) {
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-brown-900">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center px-6 py-4 lg:px-12">
          <button 
            onClick={() => handleNavigation()} 
            className="hover:opacity-90 transition-opacity"
          >
            <img 
              src="https://i.ibb.co/8D2qrWnG/logo.png" 
              alt="Kmetija Maroša" 
              className="w-[120px] h-[105px] sm:w-[160px] sm:h-[140px] lg:w-[200px] lg:h-[175px]" 
            />
          </button>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-white font-medium mt-4 sm:mt-0 text-sm sm:text-base">
            <button 
              onClick={() => handleNavigation()} 
              className="hover:text-amber-200 whitespace-nowrap"
            >
              Domov
            </button>
            <button 
              onClick={() => handleNavigation('izdelki')} 
              className="hover:text-amber-200 whitespace-nowrap"
            >
              Izdelki
            </button>
            <button 
              onClick={() => handleNavigation('kje-smo')} 
              className="hover:text-amber-200 whitespace-nowrap"
            >
              Kje smo
            </button>
            <button 
              onClick={() => handleNavigation('kontakt')} 
              className="hover:text-amber-200 whitespace-nowrap"
            >
              Kontakt
            </button>
          </div>
        </div>
      </div>

      <main className="py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="aspect-video w-full">
                <img 
                  src="https://i.ibb.co/DDnHs4nj/aronija.jpg"
                  alt="Aronija na naši kmetiji"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8">
                <h1 className="text-4xl font-bold mb-6 text-brown-800">Aronija</h1>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <p className="mb-6">
                    Aronija je izjemno hranljiva jagodičasta sadna vrsta, ki jo na naši kmetiji gojimo z veliko predanostjo. 
                    Znana je po visoki vsebnosti antioksidantov in drugih koristnih snovi, ki podpirajo zdravje in dobro počutje.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                    <div className="bg-stone-50 p-6 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <Leaf className="w-6 h-6 text-green-600" />
                        <h3 className="text-xl font-semibold">Ekološka pridelava</h3>
                      </div>
                      <p>Naša aronija je pridelana po strogih ekoloških standardih, brez uporabe pesticidov in umetnih gnojil.</p>
                    </div>
                    
                    <div className="bg-stone-50 p-6 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <Award className="w-6 h-6 text-amber-600" />
                        <h3 className="text-xl font-semibold">Vrhunska kakovost</h3>
                      </div>
                      <p>Plodovi so ročno obrani v optimalni zrelosti, kar zagotavlja najvišjo kakovost in hranilno vrednost.</p>
                    </div>
                    
                    <div className="bg-stone-50 p-6 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <Sun className="w-6 h-6 text-yellow-600" />
                        <h3 className="text-xl font-semibold">Naravno zorenje</h3>
                      </div>
                      <p>Rastline zorijo na prekmurskem soncu, kar jim daje posebno aromo in intenziven okus.</p>
                    </div>
                    
                    <div className="bg-stone-50 p-6 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <Droplets className="w-6 h-6 text-blue-600" />
                        <h3 className="text-xl font-semibold">Sveže stisnjeni sokovi</h3>
                      </div>
                      <p>Iz svežih plodov stiskamo sokove, ki ohranijo vse dragocene lastnosti aronije.</p>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold mb-4">Zdravilne lastnosti aronije</h2>
                  <ul className="list-disc list-inside mb-6 space-y-2">
                    <li>Visoka vsebnost antioksidantov</li>
                    <li>Bogat vir vitaminov (C, K, B)</li>
                    <li>Vsebuje pomembne minerale</li>
                    <li>Podpora imunskemu sistemu</li>
                    <li>Pozitiven vpliv na kardiovaskularni sistem</li>
                  </ul>

                  <h2 className="text-2xl font-bold mb-4">Naši izdelki iz aronije</h2>
                  <p className="mb-4">
                    V naši ponudbi najdete sveže stisnjene sokove aronije v različnih pakiranjih:
                  </p>
                  <ul className="list-disc list-inside mb-6 space-y-2">
                    <li>Sok aronije 0,5l - 5,00 €</li>
                    <li>Sok aronije 1l - 8,00 €</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
