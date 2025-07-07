export interface Recipe {
  productId: number;
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  difficulty: 'Lahko' | 'Srednje' | 'Zahtevno';
  ingredients: string[];
  instructions: string[];
  image: string;
  translations?: {
    hr?: {
      title: string;
      description: string;
      ingredients: string[];
      instructions: string[];
      difficulty: 'Lako' | 'Srednje' | 'Zahtjevno';
    };
    de?: {
      title: string;
      description: string;
      ingredients: string[];
      instructions: string[];
      difficulty: 'Einfach' | 'Mittel' | 'Schwierig';
    };
    en?: {
      title: string;
      description: string;
      ingredients: string[];
      instructions: string[];
      difficulty: 'Easy' | 'Medium' | 'Hard';
    };
  };
}

export const recipes: Recipe[] = [
  {
    productId: 1, // Bučno olje
    title: 'Prekmurska gibanica z bučnim oljem',
    description: 'Tradicionalna prekmurska gibanica z dodatkom bučnega olja za bogatejši okus.',
    prepTime: '45 min',
    cookTime: '60 min',
    difficulty: 'Zahtevno',
    ingredients: [
      '500g vlečenega testa',
      '150ml bučnega olja',
      '500g skute',
      '300g mletih orehov',
      '300g mletega maka',
      '4 jabolka',
      '500ml sladke smetane',
      '6 jajc',
      'sladkor po okusu'
    ],
    instructions: [
      'Pripravite vse nadeve: skuto, orehe, mak in naribana jabolka.',
      'Vsak nadev posebej zmešajte s stepenim jajcem in sladkorjem.',
      'Pekač namažite z bučnim oljem.',
      'Položite prvi sloj testa in ga namažite z bučnim oljem.',
      'Nadaljujte z izmenjavanjem plasti testa in nadevov v vrstnem redu: skuta, orehi, mak, jabolka.',
      'Na vrhu prelijte s smetano in bučnim oljem.',
      'Pecite 60 minut pri 180°C.'
    ],
    image: 'https://images.unsplash.com/photo-1621994153189-6223b41f7912?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    translations: {
      hr: {
        title: 'Prekmurska gibanica s bučinim uljem',
        description: 'Tradicionalna prekmurska gibanica s dodatkom bučinog ulja za bogatiji okus.',
        difficulty: 'Zahtjevno',
        ingredients: [
          '500g vučenog tijesta',
          '150ml bučinog ulja',
          '500g svježeg sira',
          '300g mljevenih oraha',
          '300g mljevenog maka',
          '4 jabuke',
          '500ml slatkog vrhnja',
          '6 jaja',
          'šećer po ukusu'
        ],
        instructions: [
          'Pripremite sve nadjeve: svježi sir, orahe, mak i ribane jabuke.',
          'Svaki nadjev posebno pomiješajte s tučenim jajem i šećerom.',
          'Pleh namažite bučinim uljem.',
          'Postavite prvi sloj tijesta i namažite ga bučinim uljem.',
          'Nastavite s izmjenjivanjem slojeva tijesta i nadjeva redoslijedom: sir, orasi, mak, jabuke.',
          'Na vrhu prelijte vrhnjem i bučinim uljem.',
          'Pecite 60 minuta na 180°C.'
        ]
      },
      de: {
        title: 'Prekmurska Gibanica mit Kürbiskernöl',
        description: 'Traditionelle Prekmurska Gibanica mit Kürbiskernöl für einen reicheren Geschmack.',
        difficulty: 'Schwierig',
        ingredients: [
          '500g Strudelteig',
          '150ml Kürbiskernöl',
          '500g Quark',
          '300g gemahlene Walnüsse',
          '300g gemahlener Mohn',
          '4 Äpfel',
          '500ml süße Sahne',
          '6 Eier',
          'Zucker nach Geschmack'
        ],
        instructions: [
          'Bereiten Sie alle Füllungen vor: Quark, Walnüsse, Mohn und geriebene Äpfel.',
          'Mischen Sie jede Füllung separat mit geschlagenem Ei und Zucker.',
          'Fetten Sie die Backform mit Kürbiskernöl ein.',
          'Legen Sie die erste Teigschicht ein und bestreichen Sie sie mit Kürbiskernöl.',
          'Fahren Sie fort mit dem Schichten von Teig und Füllungen in der Reihenfolge: Quark, Walnüsse, Mohn, Äpfel.',
          'Übergießen Sie das Ganze mit Sahne und Kürbiskernöl.',
          'Backen Sie 60 Minuten bei 180°C.'
        ]
      },
      en: {
        title: 'Prekmurje Layer Cake with Pumpkin Seed Oil',
        description: 'Traditional Prekmurje layer cake with pumpkin seed oil for a richer taste.',
        difficulty: 'Hard',
        ingredients: [
          '500g filo pastry',
          '150ml pumpkin seed oil',
          '500g cottage cheese',
          '300g ground walnuts',
          '300g ground poppy seeds',
          '4 apples',
          '500ml sweet cream',
          '6 eggs',
          'sugar to taste'
        ],
        instructions: [
          'Prepare all fillings: cottage cheese, walnuts, poppy seeds, and grated apples.',
          'Mix each filling separately with beaten egg and sugar.',
          'Grease the baking pan with pumpkin seed oil.',
          'Place the first layer of pastry and brush it with pumpkin seed oil.',
          'Continue alternating layers of pastry and fillings in order: cottage cheese, walnuts, poppy seeds, apples.',
          'Pour cream and pumpkin seed oil on top.',
          'Bake for 60 minutes at 180°C.'
        ]
      }
    }
  },
  // Continue with other recipes...
  // I'll continue with more translations if you'd like, but this gives you an idea of the structure
];
