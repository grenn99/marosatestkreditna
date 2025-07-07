import { Recipe } from '../types';

export const sampleRecipes: Recipe[] = [
  {
    id: 1,
    title: "Bučna juha s kapljicami olja",
    title_en: "Creamy Pumpkin Soup with Pumpkin Seed Oil",
    title_sl: "Bučna juha s kapljicami olja",
    image_url: "https://www.vibrantplate.com/wp-content/uploads/2016/10/Pumpkin-soup-08.jpg",
    prepTime: "10 min",
    cookTime: "15 min",
    difficulty: "Easy",
    ingredients: [
      "1 rdeča hokaido buča (okoli 600 g)",
      "1 velika čebula",
      "3 stroki česna",
      "1 žlica oljčnega olja",
      "500 ml zelenjavne jušne osnove",
      "sol in črni poper po okusu",
      "ščepec muškatnega oreščka",
      "sesekljana bučna semena za postrežbo",
      "sesekljan drobnjak in peteršilj za postrežbo",
      "1 žlica bučnega olja za postrežbo",
      "2 žlički veganske kisle smetane za postrežbo",
      "peščica kruhovih kock"
    ],
    ingredients_en: [
      "1 Red kuri pumpkin, about 600 g (or butternut)",
      "1 large onion",
      "3 cloves garlic",
      "1 tbsp olive oil",
      "2 cups vegetable stock",
      "salt, black pepper to taste",
      "pinch of nutmeg",
      "chopped pumpkin seeds for serving",
      "chopped chives & parsley for serving",
      "1 tbsp pumpkin seed oil for serving",
      "2 tsp vegan sour cream for serving",
      "a handful of bread croutons"
    ],
    instructions: [
      "Bučo operite in osušite. Razrežite na polovico, odstranite semena, olupite in narežite na manjše koščke. Manjši kot so koščki, hitreje se bo skuhala. Olupite čebulo in česen ter oba narežite.",
      "V lonec vlijte 1 žlico olivnega olja in segrejte na srednji temperaturi. Dodajte narezano čebulo in pražite, dokler ne postane mehka in prosojna. Nato dodajte česen in koščke buče. Dobro premešajte za približno minuto in pustite, da se praži, občasno premešajte. Ko se začne prijemati na dno, vlijte malo jušne osnove, premešajte in pustite, da se kuha s pokrovom še minuto.",
      "Vlijte preostalo jušno osnovo. Če buča ni popolnoma prekrita s tekočino, dodajte več vode. Solite in poprajte po okusu ter privedite do vretja. Kuhajte na srednji ali nizki temperaturi (počasi), dokler buča ne postane mehka.",
      "Odstranite z ognja in zmešajte s paličnim mešalnikom, dokler ni gladko. Če je juha pregosta, razredčite z več vode.",
      "Postrežite v skodelicah, dokler je vroča. Rahlo potresite z muškatnim oreščkom, ščepcem sesekljanih svežih zelišč, dodajte žličko kisle smetane, pokapljajte z bučnim oljem in potresite s sesekljanimi bučnimi semeni."
    ],
    instructions_en: [
      "Wash and dry your pumpkin. Cut in half, remove seeds, remove peel and cut into smaller pieces. The smaller the pieces, the sooner it will cook. Peel onion and garlic and slice both.",
      "Pour 1 tbsp of olive oil in a pot and heat on medium. Add onion slices and sautee until tender and translucent. Then, add garlic, and pumpkin pieces. Give it a good stir for about a minute and let it sautee, giving it a stir every once in a while. When it starts to stick to the bottom, pour in a bit of stock, stir and let it cook with lid on top for another minute.",
      "Pour in the rest of the stock. If the pumpkin is not fully covered in liquid, add in more water. Salt & pepper to taste and bring to a boil. Let it cook on medium or low (simmering), until the pumpkin becomes soft.",
      "Remove from heat and blend with a stick blender until smooth. If your soup is too thick, reduce with more water.",
      "Serve in bowls while hot. Dust lightly with nutmeg, a pinch of chopped fresh herbs, add a teaspoon of sourcream, drizzle with pumpkin seed oil and sprinkle chopped pumpkin seed on top."
    ],
    relatedProductIds: [1, 2] // Pumpkin oil and pumpkin seeds
  },
  {
    id: 2,
    title: "Paradižnikova solata z bučnim oljem",
    title_en: "Tomato Salad with Pumpkin Seed Oil",
    title_sl: "Paradižnikova solata z bučnim oljem",
    image_url: "https://images.squarespace-cdn.com/content/v1/627e6f63f043c2329357bda6/35d8b1de-6b2b-4911-912b-8859011c0cff/tomato_pumpkin_seed_oil_salad.jpg",
    prepTime: "10 min",
    cookTime: "0 min",
    difficulty: "Easy",
    ingredients: [
      "2-3 zreli paradižniki",
      "1 mlada čebula",
      "150 g belega sira (podobnega feti)",
      "bučno olje",
      "bučna semena",
      "groba sol"
    ],
    ingredients_en: [
      "2-3 ripe tomatoes",
      "1 spring onion",
      "150 g white cheese (similar to feta)",
      "pumpkin seed oil",
      "pumpkin seeds",
      "coarse salt"
    ],
    instructions: [
      "Odstranite sredico paradižnikov in jih narežite na polmesece. Narežite beli sir. Sesekljajte mlado čebulo.",
      "Vse sestavine dajte v veliko skledo. Dodajte bučno olje in grobo sol po okusu. Potresite z bučnimi semeni in postrežite s toplim kruhom."
    ],
    instructions_en: [
      "Core the tomatoes and slice them into half-moons. Slice the white cheese. Chop the spring onion.",
      "Place everything in a large bowl. Add the pumpkin seed oil, coarse salt to taste. Sprinkle with pumpkin seeds and serve with warm bread."
    ],
    relatedProductIds: [1, 2] // Pumpkin oil and pumpkin seeds
  },
  {
    id: 3,
    title: "Sladoled z bučnim oljem in bučnimi semeni",
    title_en: "Vanilla Ice Cream with Pumpkin Seed Oil and Brittle",
    title_sl: "Sladoled z bučnim oljem in bučnimi semeni",
    image_url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEivywL7NCLJaApemBy_Bx_uujseSuScRxfyOHjuv9uNaYqZA-r4VwmQVivsNHS197SK2xXibenv708epejp2rqphEVmy7tb5vHH_bKdcLWfTfW4KKjNTjqIUemxqzGSMKsUg-GBMp50uwZp/s1600/pumpkinseedicecream.jpg",
    prepTime: "15 min",
    cookTime: "4 h (zamrzovanje)",
    difficulty: "Easy",
    ingredients: [
      "500 ml vaniljevega sladoleda",
      "100 g bučnih semen",
      "100 g sladkorja",
      "50 ml vode",
      "bučno olje za pokapljanje"
    ],
    ingredients_en: [
      "500 ml vanilla ice cream",
      "100 g pumpkin seeds",
      "100 g sugar",
      "50 ml water",
      "pumpkin seed oil for drizzling"
    ],
    instructions: [
      "Pripravite krhko bučno seme: v ponvi segrejte sladkor in vodo, dokler se sladkor ne raztopi in mešanica ne začne vreti.",
      "Dodajte bučna semena in kuhajte, dokler sirup ne postane zlato rjav in se začne zgoščati.",
      "Mešanico razporedite na peki papir in pustite, da se ohladi in strdi.",
      "Ko je krhko bučno seme ohlajeno, ga grobo zdrobite.",
      "Vaniljev sladoled postrežite v skodelicah, potresite z zdrobljenim krhkim bučnim semenom in pokapljajte z bučnim oljem."
    ],
    instructions_en: [
      "Prepare the pumpkin seed brittle: heat sugar and water in a pan until the sugar dissolves and the mixture starts to boil.",
      "Add the pumpkin seeds and cook until the syrup turns golden brown and starts to thicken.",
      "Spread the mixture onto parchment paper and let it cool and harden.",
      "Once the brittle is cooled, roughly crush it.",
      "Serve vanilla ice cream in bowls, sprinkle with the crushed pumpkin seed brittle, and drizzle with pumpkin seed oil."
    ],
    relatedProductIds: [1, 2] // Pumpkin oil and pumpkin seeds
  },
  {
    id: 4,
    title: "Ajdova kaša z gobami",
    title_en: "Buckwheat Kasha with Mushrooms",
    title_sl: "Ajdova kaša z gobami",
    image_url: "https://www.vibrantplate.com/wp-content/uploads/2024/09/Buckwheat-Kasha-with-Mushrooms-03.jpg",
    prepTime: "10 min",
    cookTime: "20 min",
    difficulty: "Easy",
    ingredients: [
      "250 g ajdove kaše",
      "280 g vloženih šampinjonov",
      "1 čebula",
      "2 stroka česna",
      "280 g paradižnikove omake z baziliko",
      "1 žlica oljčnega olja",
      "1/2 žličke sladke paprike",
      "1/2 žličke origana",
      "1/2 žličke timijana",
      "sol in poper po okusu"
    ],
    ingredients_en: [
      "250 grams of buckwheat groats",
      "280 grams of pickled mushrooms",
      "1 onion",
      "2 cloves of garlic",
      "280 grams of basil tomato sauce",
      "1 tablespoon olive oil",
      "1/2 teaspoon sweet paprika",
      "1/2 teaspoon oregano",
      "1/2 teaspoon thyme",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Priprava ajdove kaše: Ajdovo kašo sperite pod tekočo vodo, da priteče bistra voda. Odcedite. V večji lonec nalijte 400 ml vode, jo zavrite, rahlo posolite in nato dodajte ajdovo kašo. Kuhajte na zmernem ognju približno 10 minut oziroma dokler kaša ni mehka – najbolje, da kuhate par minut manj, ker se bo kaša kuhala še v omaki. Kuhano kašo odcedite in postavite na stran.",
      "Pripravite zelenjavo: Čebulo in česen olupite in sesekljajte. Šampinjone v kisu odcedite, rahlo splaknite pod tekočo vodo in nato narežite na koščke ali rezine.",
      "Pripravite omako: V ponvi segrejte oljčno olje na srednji temperaturi. Dodajte sesekljano čebulo in jo pražite, dokler se ne zmehča in se obarva zlato rjavo, približno 5 minut. Dodajte sesekljan česen in pražite še 1-2 minuti, da česen zadiši.",
      "Dodajte šampinjone: V ponev primešamo odcejene in narezane šampinjone v kisu. Pražimo jih 3-4 minute, da se rahlo popečejo in zmehčajo. Dodamo sladko papriko, origano, timijan, sol in poper ter dobro premešamo.",
      "Dodajte paradižnikovo omako: V ponev prilijemo paradižnikovo omako z baziliko. Premešamo in kuhamo na nizkem ognju 10 minut, da se okusi premešajo in omaka zgosti.",
      "Dodajte kuhano ajdovo kašo: Kuhano ajdovo kašo dodamo v ponev s paradižnikovo omako in šampinjoni. Dobro premešamo, da se kaša enakomerno prepoji z omako.",
      "Postrežemo: Odstavimo z ognja in še toplo postrežemo. Pred serviranjem lahko krožnike dekoriramo s popečenimi šampinjoni in svežim sesekljanim peteršiljem."
    ],
    instructions_en: [
      "Prepare the buckwheat: Rinse the buckwheat groats under running water until the water runs clear. Drain. In a large pot, pour 400 ml of water, bring it to a boil, lightly salt it, and then add the buckwheat groats. Cook on medium heat for about 10 minutes or until the groats are tender – it's best to cook them a few minutes less as they will continue to cook in the sauce. Drain the cooked groats and set them aside.",
      "Prepare the vegetables: Peel and chop the onion and garlic. Drain the pickled mushrooms, rinse them lightly under running water, then chop them into pieces or slices.",
      "Prepare the sauce: Heat the olive oil in a pan over medium heat. Add the chopped onion and sauté until softened and golden brown, about 5 minutes. Add the chopped garlic and sauté for another 1-2 minutes until fragrant.",
      "Add the mushrooms: Stir in the drained and chopped pickled mushrooms. Sauté for 3-4 minutes until they are slightly browned and softened. Mix well with sweet paprika, oregano, thyme, salt, and pepper.",
      "Add the tomato sauce: Pour the basil tomato sauce into the pan. Stir and simmer on low heat for 10 minutes to blend the flavors and thicken the sauce.",
      "Add the cooked buckwheat groats: Add the cooked buckwheat groats to the pan with the tomato sauce and mushrooms. Stir well to coat the groats with the sauce evenly.",
      "Serve: Remove from heat and serve warm. You can garnish the plates with sautéed mushrooms and freshly chopped parsley before serving."
    ],
    relatedProductIds: [10, 11] // Buckwheat and millet kasha
  },
  {
    id: 5,
    title: "Imunski čaj z ameriškim slamnikom",
    title_en: "Immune-Boosting Echinacea Tea",
    title_sl: "Imunski čaj z ameriškim slamnikom",
    image_url: "https://cdn.pixabay.com/photo/2015/07/02/20/37/cup-829527_1280.jpg",
    prepTime: "5 min",
    cookTime: "15 min",
    difficulty: "Easy",
    ingredients: [
      "2 žlici posušenega ameriškega slamnika (Echinacea)",
      "1 žlica svežega naribanega ingverja",
      "1 žlica medu",
      "1/2 limone, sok",
      "500 ml vode",
      "1 cimetova palčka (opcijsko)",
      "2-3 klinčki (opcijsko)"
    ],
    ingredients_en: [
      "2 tablespoons dried echinacea",
      "1 tablespoon fresh grated ginger",
      "1 tablespoon honey",
      "Juice of 1/2 lemon",
      "500 ml water",
      "1 cinnamon stick (optional)",
      "2-3 cloves (optional)"
    ],
    instructions: [
      "V loncu zavrite vodo.",
      "V čajnik ali večjo skodelico dajte ameriški slamnik in nariban ingver.",
      "Dodajte cimetovo palčko in klinčke, če jih uporabljate.",
      "Prelijte z vrelo vodo in pokrijte.",
      "Pustite stati 10-15 minut.",
      "Precedite in dodajte med ter limonin sok.",
      "Dobro premešajte in takoj postrezite.",
      "Za najboljše rezultate pijte 2-3 skodelice dnevno, ko čutite, da prihaja prehlad."
    ],
    instructions_en: [
      "Bring water to a boil in a pot.",
      "Place the echinacea and grated ginger in a teapot or large mug.",
      "Add cinnamon stick and cloves if using.",
      "Pour boiling water over the herbs and cover.",
      "Let steep for 10-15 minutes.",
      "Strain and add honey and lemon juice.",
      "Stir well and serve immediately.",
      "For best results, drink 2-3 cups daily when you feel a cold coming on."
    ],
    relatedProductIds: [7] // Ameriški slamnik (Echinacea)
  },
  {
    id: 6,
    title: "Pomirjujoči čaj iz poprove mete za prebavo",
    title_en: "Soothing Peppermint Digestive Tea",
    title_sl: "Pomirjujoči čaj iz poprove mete za prebavo",
    image_url: "https://www.verywellhealth.com/thmb/cXjl8I4hU0981Xh5T3zH-5NEgzU=/750x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-875564250-71ac1872b5834cb1be102ddc11b01d93.jpg",
    prepTime: "5 min",
    cookTime: "10 min",
    difficulty: "Easy",
    ingredients: [
      "2 žlici svežih listov poprove mete (ali 1 žlica posušenih)",
      "1 žlička medu",
      "1 rezina limone",
      "250 ml vode",
      "ščepec cimeta (opcijsko)"
    ],
    ingredients_en: [
      "2 tablespoons fresh peppermint leaves (or 1 tablespoon dried)",
      "1 teaspoon honey",
      "1 slice of lemon",
      "250 ml water",
      "pinch of cinnamon (optional)"
    ],
    instructions: [
      "V loncu zavrite vodo.",
      "Sveže liste poprove mete rahlo zmnečite med prsti, da sprostite etična olja.",
      "Meto dajte v skodelico ali čajnik.",
      "Prelijte z vrelo vodo in pokrijte.",
      "Pustite stati 5-7 minut (dlje za močnejši okus).",
      "Precedite čaj, če ste uporabili sveže liste.",
      "Dodajte med in rezino limone.",
      "Po želji potresite s ščepcem cimeta.",
      "Ta čaj je odličen za pomirjanje prebavnih težav, napenjanja in slabosti."
    ],
    instructions_en: [
      "Bring water to a boil in a pot.",
      "Gently crush the fresh peppermint leaves between your fingers to release the essential oils.",
      "Place the peppermint in a cup or teapot.",
      "Pour boiling water over the leaves and cover.",
      "Let steep for 5-7 minutes (longer for a stronger flavor).",
      "Strain the tea if you used fresh leaves.",
      "Add honey and a slice of lemon.",
      "Sprinkle with a pinch of cinnamon if desired.",
      "This tea is excellent for soothing digestive issues, bloating, and nausea."
    ],
    relatedProductIds: [6] // Poprova meta (Peppermint)
  },
  {
    id: 7,
    title: "Pomirjujoči kamilni čaj z medom",
    title_en: "Soothing Chamomile Tea with Honey",
    title_sl: "Pomirjujoči kamilni čaj z medom",
    image_url: "https://sakiproducts.com/cdn/shop/articles/20230327153528-chamomile-20tea-20recipe-20blog_1920x1080.webp",
    prepTime: "5 min",
    cookTime: "5 min",
    difficulty: "Easy",
    ingredients: [
      "2 žlici posušenih kamilic",
      "500 ml vode",
      "1-2 žlički medu (po okusu)",
      "rezina limone (opcijsko)",
      "ščepec cimeta (opcijsko)",
      "1 zvežek sivke (opcijsko, za dodatno sprostitev)"
    ],
    ingredients_en: [
      "2 tablespoons dried chamomile flowers",
      "500 ml water",
      "1-2 teaspoons honey (to taste)",
      "slice of lemon (optional)",
      "pinch of cinnamon (optional)",
      "1 sprig of lavender (optional, for extra relaxation)"
    ],
    instructions: [
      "V loncu zavrite vodo.",
      "V čajnik ali skodelico dajte posušene kamilice.",
      "Prelijte z vrelo vodo in pokrijte.",
      "Pustite stati 5 minut.",
      "Precedite čaj v skodelico.",
      "Dodajte med in po želji rezino limone ali ščepec cimeta.",
      "Pijte 30-60 minut pred spanjem za boljši spanec in sprostitev.",
      "Ta čaj je odličen za pomirjanje živčnega sistema, zmanjševanje stresa in izboljšanje kakovosti spanca."
    ],
    instructions_en: [
      "Bring water to a boil in a pot.",
      "Place the dried chamomile flowers in a teapot or cup.",
      "Pour boiling water over the flowers and cover.",
      "Let steep for 5 minutes.",
      "Strain the tea into a cup.",
      "Add honey and optionally a slice of lemon or a pinch of cinnamon.",
      "Drink 30-60 minutes before bedtime for better sleep and relaxation.",
      "This tea is excellent for calming the nervous system, reducing stress, and improving sleep quality."
    ],
    relatedProductIds: [8] // Kamilice (Chamomile)
  },
  {
    id: 9,
    title: "Pomirjujoči čaj iz melise za sprostitev",
    title_en: "Calming Lemon Balm Tea for Relaxation",
    title_sl: "Pomirjujoči čaj iz melise za sprostitev",
    image_url: "https://simplybeyondherbs.com/wp-content/uploads/2022/11/Lemon-balm-tea1.jpg",
    prepTime: "5 min",
    cookTime: "10 min",
    difficulty: "Easy",
    ingredients: [
      "2 žlici svežih listov melise (ali 1 žlica posušenih)",
      "500 ml vode",
      "1 žlička medu",
      "1 rezina limone",
      "ščepec cimeta (opcijsko)",
      "1 zvežek sivke (opcijsko, za dodatno sprostitev)"
    ],
    ingredients_en: [
      "2 tablespoons fresh lemon balm leaves (or 1 tablespoon dried)",
      "500 ml water",
      "1 teaspoon honey",
      "1 slice of lemon",
      "pinch of cinnamon (optional)",
      "1 sprig of lavender (optional, for extra relaxation)"
    ],
    instructions: [
      "V loncu zavrite vodo.",
      "Sveže liste melise rahlo zmnečite med prsti, da sprostite etična olja.",
      "Meliso dajte v čajnik ali skodelico.",
      "Prelijte z vrelo vodo in pokrijte.",
      "Pustite stati 5-10 minut.",
      "Precedite čaj v skodelico.",
      "Dodajte med in rezino limone.",
      "Po želji potresite s ščepcem cimeta.",
      "Pijte 30-60 minut pred spanjem za zmanjšanje stresa in tesnobe ter boljši spanec."
    ],
    instructions_en: [
      "Bring water to a boil in a pot.",
      "Gently crush the fresh lemon balm leaves between your fingers to release the essential oils.",
      "Place the lemon balm in a teapot or cup.",
      "Pour boiling water over the leaves and cover.",
      "Let steep for 5-10 minutes.",
      "Strain the tea into a cup.",
      "Add honey and a slice of lemon.",
      "Sprinkle with a pinch of cinnamon if desired.",
      "Drink 30-60 minutes before bedtime to reduce stress and anxiety and improve sleep quality."
    ],
    relatedProductIds: [5] // Melisa (Lemon Balm)
  },
  {
    id: 10,
    title: "Styrian Pumpkin Seed Oil Cake",
    title_en: "Styrian Pumpkin Seed Oil Cake",
    title_sl: "Štajerska torta z bučnim oljem",
    image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Flh3.googleusercontent.com%2Fpw%2FAIL4fc-Ni8klVlh4_CbaA_bAqNTheDTQLbym03NnY2VWdi-xXD_8Vcf82d62FskisxQk7s2wqtAeXJ6NhXwtVYtw6kVWDEkGmySnzT5PhdeKjnB9970fuwYfGgy7g8htZMcTgORUBsMu3h539loRoktMO49tIQ%3Dw1020-h680-s-no%3Fauthuser%3D0&f=1&nofb=1&ipt=a76a483af0431931bf4c11d22a13b1d7127180d5fab38747942fd53552bf258d",
    prepTime: "20 min",
    cookTime: "60 min",
    difficulty: "Medium",
    ingredients: [
      "100 g bučnih semen",
      "150 g masla, mehkega",
      "2-3 žlice drobtin (ali moke ali fino sesekljanih bučnih semen)",
      "4 jajca",
      "250 g sladkorja",
      "ščepec fine morske soli",
      "100 g bučnega olja",
      "250 g moke za vse namene",
      "2 žlički pecilnega praška",
      "za zaključek: potresite s sladkorjem v prahu ali glazirajte z belo čokolado"
    ],
    ingredients_en: [
      "100g pumpkin seeds",
      "150g soft butter, plus 1 tbsp extra for greasing",
      "2-3 tbsp breadcrumbs (or flour or finely chopped pumpkin seeds)",
      "4 eggs (M)",
      "250g sugar",
      "a pinch of fine sea salt",
      "100g pumpkin seed oil",
      "250g all-purpose flour",
      "2 tsp baking powder",
      "finish: dust with powdered sugar or glaze with melted white chocolate"
    ],
    instructions: [
      "Ta torta je sodobna interpretacija klasične štajerske sladice.",
      "Segrejte pečico na 180 °C. Suho pražite bučna semena v veliki ponvi na srednji temperaturi, dokler ne začnejo pokati in dobijo zlato barvo. Prelijte v skledo in pustite, da se ohladijo, nato jih fino zmeljite v kuhinjskem robotu.",
      "Pripravite model za kruh (ali druge modele za torte): Namastite model z 1 žlico masla, nato ga potresite z drobtinami, moko ali fino sesekljanimi bučnimi semeni. Postavite na stran.",
      "V veliki skledi stepite skupaj mehko maslo, sladkor in ščepec soli, nato dodajte bučno olje in nadaljujte nekaj minut. Ločite rumenjake in beljake (beljake postavite na stran za poznejšo uporabo), nato dodajte rumenjake v testo in stepajte še dve minuti ali dokler se večina sladkorja ne raztopi.",
      "Dodajte zmlete bučne semena v skledo, nato presejte moko in pecilni prašek ter mešajte na nizki hitrosti, dokler ni vse enakomerno zmešano (testo bo precej gosto).",
      "V ločeni skledi stepite beljake do trdega snega, nato dodajte tretjino v testo in premešajte z gumijasto lopatico (testo je še vedno pretrdo, da bi ga pravilno pregibali). Zdaj previdno pregibajte preostale beljake, dokler niso ravno vmešani.",
      "Napolnite testo v pripravljen model za kruh in pecite v predogreti pečici (srednja raven) 50 do 60 minut. Torta je pečena, ko vstavljen lesen nabožec pride ven čist. Vzemite iz pečice in pustite, da se ohladi 10 minut, preden jo sprostite iz modela. Potresite s sladkorjem v prahu ali glazirajte z belo čokolado, ko se torta popolnoma ohladi."
    ],
    instructions_en: [
      "This cake is a modern interpretation of a classic Styrian dessert.",
      "Preheat the oven to 180 °C (355 °F). Dry-roast pumpkin seeds in a large pan over medium heat until they start to make cracking sounds and gain some golden color. Pour into a bowl and let cool down, then grind them finely in a food processor.",
      "Prepare the loaf pan (or any other cake molds): Grease the pan with 1 tbsp butter, then dust it with either breadcrumbs, flour or finely chopped pumpkin seeds. Set aside.",
      "Beat together soft butter, sugar and the pinch of salt in a large bowl, then add the pumpkin seed oil and continue for some minutes. Separate the egg yolks and whites (set aside the whites for later use), then add the egg yolks to the batter and beat for two more minutes or until most of the sugar has dissolved.",
      "Add the ground pumpkin seeds to the bowl, then sift in the flour and baking powder and mix together on low speed just until evenly combined (the batter will be rather thick).",
      "In a separate bowl beat the egg whites until stiff, then add one third of it to the batter and stir it in with a rubber spatula (the batter is still too thick to fold it in properly). Now carefully fold in the rest of the egg whites until just incorporated.",
      "Fill the batter into the prepared loaf pan and bake in the preheated oven (middle level) for 50 to 60 minutes. The cake is done when an inserted wooden skewer comes out clean. Take out of the oven and let cool for 10 minutes before releasing it from the pan. Dust with powdered sugar or glaze with white chocolate once the cake has cooled down completely."
    ],
    relatedProductIds: [1, 2] // Pumpkin oil and pumpkin seeds
  },
  {
    id: 11,
    title: "Kamilični panna cotta z medom in bučnimi semeni",
    title_en: "Chamomile Panna Cotta with Honey and Pumpkin Seeds",
    title_sl: "Kamilični panna cotta z medom in bučnimi semeni",
    image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fdata.thefeedfeed.com%2Fstatic%2F2020%2F03%2F17%2F15844707305e711aca00865.png&f=1&nofb=1&ipt=ab829d2a363052294c1d517ae3b1bf9d7a316311e7417b3b15c803481f093a47",
    prepTime: "15 min",
    cookTime: "4 h (hlajenje)",
    difficulty: "Medium",
    ingredients: [
      "500 ml sladke smetane",
      "100 ml mleka",
      "80 g sladkorja",
      "3 žlice posušenih kamiličnih cvetov",
      "7 g želatine v lističih (4 lističi)",
      "1 vanilijev strok",
      "Za preliv:",
      "100 g kakovostnega akacijevega medu",
      "50 g praženih bučnih semen",
      "1 žlica bučnega olja"
    ],
    ingredients_en: [
      "500 ml heavy cream",
      "100 ml milk",
      "80 g sugar",
      "3 tablespoons dried chamomile flowers",
      "7 g gelatin sheets (4 sheets)",
      "1 vanilla pod",
      "For the topping:",
      "100 g high-quality acacia honey",
      "50 g roasted pumpkin seeds",
      "1 tablespoon pumpkin seed oil"
    ],
    instructions: [
      "Ta elegantna sladica predstavlja ustvarjalni pristop k tradicionalnim slovenskim okusom.",
      "Želatino namočite v mrzli vodi za 5-10 minut, da se zmehča.",
      "V kozici segrejte smetano, mleko in sladkor. Dodajte kamilične cvetove in prerezani vanilijev strok (semena postrgajte v mešanico). Segrejte do vretja, nato odstavite s štedilnika in pokrijte. Pustite stati 15 minut, da se kamilični okus prenese v smetano.",
      "Precedite mešanico skozi fino cedilo, da odstranite kamilične cvetove in vanilijev strok. Vrnite tekočino v kozico in ponovno segrejte, vendar ne do vretja.",
      "Ožemite namočeno želatino in jo dodajte v vročo smetano. Mešajte, dokler se želatina popolnoma ne raztopi.",
      "Razdelite mešanico v 6 kozarcev ali skodelic za serviranje. Ohladite vsaj 4 ure ali čez noč.",
      "Tik pred serviranjem pripravite preliv: v majhni ponvi nežno segrejte med. Dodajte pražena bučna semena in mešajte, da se obložijo z medom.",
      "Na vsako panna cotto položite žlico medene mešanice z bučnimi semeni in pokapljajte z bučnim oljem."
    ],
    instructions_en: [
      "This elegant dessert showcases a creative approach to traditional Slovenian flavors.",
      "Soak the gelatin sheets in cold water for 5-10 minutes until softened.",
      "In a saucepan, heat the cream, milk, and sugar. Add the chamomile flowers and the split vanilla pod (scrape the seeds into the mixture). Bring to a simmer, then remove from heat and cover. Let steep for 15 minutes to infuse the chamomile flavor.",
      "Strain the mixture through a fine sieve to remove the chamomile flowers and vanilla pod. Return the liquid to the saucepan and reheat gently, but do not boil.",
      "Squeeze the soaked gelatin and add it to the hot cream. Stir until the gelatin is completely dissolved.",
      "Divide the mixture into 6 serving glasses or ramekins. Refrigerate for at least 4 hours or overnight.",
      "Just before serving, prepare the topping: gently warm the honey in a small pan. Add the roasted pumpkin seeds and stir to coat them with honey.",
      "Top each panna cotta with a spoonful of the honey and pumpkin seed mixture, and drizzle with pumpkin seed oil."
    ],
    relatedProductIds: [1, 2, 8] // Pumpkin oil, pumpkin seeds, and chamomile
  },
  {
    id: 12,
    title: "Sodobni ajdovi žganci z gobami in bučnim oljem",
    title_en: "Modern Buckwheat Žganci with Mushrooms and Pumpkin Seed Oil",
    title_sl: "Sodobni ajdovi žganci z gobami in bučnim oljem",
    image_url: "https://jernejkitchen.com/sites/default/files/styles/recipe_headerbreakpoints_theme_jernejkitchenr_screen-xl-min_1x/public/ajdovi-zganci-01-jernejkitchen.jpg?itok=wC9BYe-b&timestamp=1634559887",
    prepTime: "15 min",
    cookTime: "30 min",
    difficulty: "Medium",
    ingredients: [
      "Za ajdove žgance:",
      "250 g ajdove moke",
      "750 ml vode",
      "10 g soli",
      "2 žlici bučnega olja",
      "Za gobovo omako:",
      "400 g mešanih gob (jurčki, lisičke, šampinjoni)",
      "2 žlici masla",
      "1 čebula, fino sesekljana",
      "2 stroka česna, sesekljana",
      "100 ml suhega belega vina",
      "200 ml smetane za kuhanje",
      "1 žlica svežega timijana",
      "sol in sveže mlet črni poper po okusu",
      "Za serviranje:",
      "2 žlici bučnega olja",
      "1 žlica praženih bučnih semen",
      "sveži drobnjak, sesekljan"
    ],
    ingredients_en: [
      "For the buckwheat žganci:",
      "250 g buckwheat flour",
      "750 ml water",
      "10 g salt",
      "2 tablespoons pumpkin seed oil",
      "For the mushroom sauce:",
      "400 g mixed mushrooms (porcini, chanterelles, button mushrooms)",
      "2 tablespoons butter",
      "1 onion, finely chopped",
      "2 cloves garlic, minced",
      "100 ml dry white wine",
      "200 ml cooking cream",
      "1 tablespoon fresh thyme",
      "salt and freshly ground black pepper to taste",
      "For serving:",
      "2 tablespoons pumpkin seed oil",
      "1 tablespoon roasted pumpkin seeds",
      "fresh chives, chopped"
    ],
    instructions: [
      "Ta jed predstavlja sodobno različico tradicionalne slovenske jedi, ki povzdiguje preproste sestavine na raven vrhunske kulinarike.",
      "Priprava ajdovih žgancev: V velik lonec vlijte vodo in dodajte sol. Privedite do vretja. V skledi zmešajte ajdovo moko z 50 ml hladne vode, da dobite gosto pasto.",
      "Ko voda zavre, dodajte ajdovo pasto in kuhajte na srednji temperaturi 15 minut, občasno premešajte, da se ne prime na dno.",
      "Ko je ajdova kaša kuhana, odcedite odvečno vodo (shranite jo za poznejšo uporabo). V sredini kaše naredite luknjo z leseno žlico in dodajte bučno olje. Pustite stati 5 minut.",
      "Z vilicami ali kuhalnico razdrobite kašo v manjše koščke, da dobite tradicionalno teksturo žgancev. Če je presuho, dodajte malo shranjene vode.",
      "Priprava gobove omake: V veliki ponvi stopite maslo na srednji temperaturi. Dodajte sesekljano čebulo in kuhajte 3-4 minute, dokler ne postane prosojna.",
      "Dodajte sesekljan česen in kuhajte še 1 minuto, dokler ne zadiši.",
      "Povečajte temperaturo in dodajte gobe. Kuhajte 5-7 minut, dokler gobe ne spustijo vode in ta ne izpari, gobe pa se začnejo zlato rjaveti.",
      "Prilijte belo vino in pustite, da izpari za polovico. Dodajte smetano, timijan, sol in poper. Kuhajte na nizki temperaturi 5 minut, da se omaka nekoliko zgosti.",
      "Serviranje: Žgance razdelite na krožnike, nanje naložite gobovo omako. Pokapljajte z bučnim oljem, potresite s praženimi bučnimi semeni in svežim drobnjakom."
    ],
    instructions_en: [
      "This dish represents a modern take on a traditional Slovenian staple, elevating humble ingredients to fine dining status.",
      "Prepare the buckwheat žganci: In a large pot, pour the water and add salt. Bring to a boil. In a bowl, mix the buckwheat flour with 50 ml of cold water to create a thick paste.",
      "When the water boils, add the buckwheat paste and cook on medium heat for 15 minutes, stirring occasionally to prevent sticking to the bottom.",
      "When the buckwheat porridge is cooked, drain the excess water (save it for later use). Make a hole in the center of the porridge with a wooden spoon and add the pumpkin seed oil. Let it sit for 5 minutes.",
      "Using a fork or a cooking spoon, break the porridge into smaller pieces to achieve the traditional žganci texture. If it's too dry, add a little of the saved water.",
      "Prepare the mushroom sauce: In a large pan, melt the butter over medium heat. Add the chopped onion and cook for 3-4 minutes until translucent.",
      "Add the minced garlic and cook for another minute until fragrant.",
      "Increase the heat and add the mushrooms. Cook for 5-7 minutes until the mushrooms release their water and it evaporates, and the mushrooms start to brown.",
      "Pour in the white wine and let it reduce by half. Add the cream, thyme, salt, and pepper. Cook on low heat for 5 minutes to slightly thicken the sauce.",
      "Serving: Divide the žganci onto plates, top with the mushroom sauce. Drizzle with pumpkin seed oil, sprinkle with roasted pumpkin seeds and fresh chives."
    ],
    relatedProductIds: [1, 2, 10] // Pumpkin oil, pumpkin seeds, and buckwheat
  },

  {
    id: 13,
    title: "Pegasti badelj v medu z limono in ingverjem",
    title_en: "Milk Thistle in Honey with Lemon and Ginger",
    title_sl: "Pegasti badelj v medu z limono in ingverjem",
    image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fthumbor.forbes.com%2Fthumbor%2Ffit-in%2F900x510%2Fhttps%3A%2F%2Fwww.forbes.com%2Fhealth%2Fwp-content%2Fuploads%2F2023%2F08%2FScience-Backed-Benefits-Of-Milk-Thistle.jpg&f=1&nofb=1&ipt=49ed888886168c0599a16b7000ed4a113edcf77a54272b592c9252d54e5ae565",
    prepTime: "10 min",
    cookTime: "20 min",
    difficulty: "Medium",
    ingredients: [
      "3 žlice semen pegastega badlja",
      "200 g kakovostnega slovenskega medu",
      "1 ekološka limona (sok in lupinica)",
      "2 cm svežega ingverja, naribanega",
      "ščepec cimeta",
      "ščepec kardamoma",
      "1 zvezdasti janež (opcijsko)"
    ],
    ingredients_en: [
      "3 tablespoons milk thistle seeds",
      "200g high-quality Slovenian honey",
      "1 organic lemon (juice and zest)",
      "2cm fresh ginger, grated",
      "pinch of cinnamon",
      "pinch of cardamom",
      "1 star anise (optional)"
    ],
    instructions: [
      "Ta recept predstavlja sodobno interpretacijo tradicionalnega zdravilnega pripravka, ki združuje zdravilne lastnosti pegastega badlja z okusnimi dodatki.",
      "Semena pegastega badlja nežno zdrobite v možnarju, da sprostite njihove zdravilne lastnosti, vendar jih ne zmeljite v prah.",
      "V majhni kozici na nizki temperaturi segrejte med, da postane tekoč. Ne segrevajte nad 40°C, da ohranite zdravilne lastnosti medu.",
      "Dodajte zdrobljena semena pegastega badlja, limonin sok, limonino lupinico in nariban ingver.",
      "Dodajte ščepec cimeta, kardamoma in zvezdasti janež, če ga uporabljate.",
      "Nežno mešajte približno 5 minut, da se okusi povežejo.",
      "Odstranite z ognja in pustite, da se mešanica ohladi na sobno temperaturo.",
      "Precedite skozi fino cedilo, če želite odstraniti večje delce (opcijsko).",
      "Prelijte v steriliziran kozarec in hranite v hladilniku do 2 tedna.",
      "Uživajte po eno žličko zjutraj na tešče ali raztopljeno v topli vodi kot zdravilni napitek."
    ],
    instructions_en: [
      "This recipe represents a modern interpretation of a traditional medicinal preparation, combining the healing properties of milk thistle with flavorful additions.",
      "Gently crush the milk thistle seeds in a mortar and pestle to release their medicinal properties, but don't grind them to a powder.",
      "In a small saucepan over low heat, warm the honey until it becomes liquid. Don't heat above 40°C (104°F) to preserve the honey's beneficial properties.",
      "Add the crushed milk thistle seeds, lemon juice, lemon zest, and grated ginger.",
      "Add a pinch of cinnamon, cardamom, and the star anise if using.",
      "Stir gently for about 5 minutes to allow the flavors to meld together.",
      "Remove from heat and let the mixture cool to room temperature.",
      "Strain through a fine sieve if you prefer to remove the larger particles (optional).",
      "Transfer to a sterilized jar and store in the refrigerator for up to 2 weeks.",
      "Enjoy one teaspoon in the morning on an empty stomach or dissolved in warm water as a medicinal drink."
    ],
    relatedProductIds: [18] // Pegasti badelj (Milk Thistle)
  },
  {
    id: 14,
    title: "Konopljin čaj z medom in sivko",
    title_en: "Hemp Tea with Honey and Lavender",
    title_sl: "Konopljin čaj z medom in sivko",
    image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.urbanfarmingzone.com%2Fwp-content%2Fuploads%2F2023%2F01%2Fhemp-tea-4.jpg&f=1&nofb=1&ipt=d44f679737f54a2c93cfddd3e43987f876b20df81fe59909505c275ddfdcccaa",
    prepTime: "5 min",
    cookTime: "10 min",
    difficulty: "Easy",
    ingredients: [
      "2 žlici konopljinega čaja",
      "500 ml filtrirane vode",
      "1 žlica medu (po možnosti akacijevega)",
      "1/2 žličke posušene sivke",
      "1/2 žličke posušene melise",
      "1 rezina limone za serviranje",
      "sveža vejica melise za okras"
    ],
    ingredients_en: [
      "2 tablespoons hemp tea",
      "500ml filtered water",
      "1 tablespoon honey (preferably acacia)",
      "1/2 teaspoon dried lavender",
      "1/2 teaspoon dried lemon balm",
      "1 slice of lemon for serving",
      "fresh sprig of lemon balm for garnish"
    ],
    instructions: [
      "Ta recept za konopljin čaj odraža spoštovanje do naravnih sestavin in njihovih zdravilnih lastnosti.",
      "V čajniku ali kozici zavrite filtrirano vodo.",
      "V skodelico ali čajnik dajte konopljin čaj, posušeno sivko in meliso.",
      "Prelijte z vrelo vodo in pokrijte.",
      "Pustite stati 5-7 minut, da se zelišča dobro prevlečejo.",
      "Precedite čaj v skodelico.",
      "Dodajte med in dobro premešajte, da se raztopi.",
      "Okrasite z rezino limone in svežo vejico melise.",
      "Čaj postrežite topel kot pomirjujoč napitek pred spanjem ali ohlajenega kot osvežilno pijačo v poletnih mesecih.",
      "Za najboljše rezultate uživajte redno kot del vaše dnevne rutine za dobro počutje."
    ],
    instructions_en: [
      "This hemp tea recipe reflects respect for natural ingredients and their healing properties.",
      "Bring the filtered water to a boil in a kettle or small pot.",
      "Place the hemp tea, dried lavender, and lemon balm in a cup or teapot.",
      "Pour the boiling water over the herbs and cover.",
      "Let steep for 5-7 minutes to allow the herbs to infuse well.",
      "Strain the tea into a cup.",
      "Add honey and stir well until dissolved.",
      "Garnish with a slice of lemon and a fresh sprig of lemon balm.",
      "Serve the tea warm as a soothing bedtime drink or chilled as a refreshing beverage during summer months.",
      "For best results, enjoy regularly as part of your wellness routine."
    ],
    relatedProductIds: [5, 6] // Konopljin čaj (Hemp Tea) and Melisa (Lemon Balm)
  },
  {
    id: 15,
    title: "Prosena kaša s sušenimi sadeži in medom",
    title_en: "Millet Porridge with Dried Fruits and Honey",
    title_sl: "Prosena kaša s sušenimi sadeži in medom",
    image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fthumbs.dreamstime.com%2Fb%2Fmillet-porridge-dried-fruit-apricots-prunes-bowl-46756809.jpg&f=1&nofb=1&ipt=05020beda9ceba8d2ab1ee73b3584cada01b8e7fb662009d81568595acc9476e",
    prepTime: "10 min",
    cookTime: "25 min",
    difficulty: "Easy",
    ingredients: [
      "200 g prosene kaše",
      "600 ml mleka (lahko uporabite tudi rastlinsko mleko)",
      "200 ml vode",
      "ščepec soli",
      "50 g mešanice sušenega sadja (marelice, slive, brusnice)",
      "30 g bučnih semen",
      "2 žlici medu",
      "1/2 žličke cimeta",
      "1 žlica bučnega olja za pokapljanje"
    ],
    ingredients_en: [
      "200g millet groats",
      "600ml milk (plant-based milk can also be used)",
      "200ml water",
      "pinch of salt",
      "50g mixed dried fruits (apricots, plums, cranberries)",
      "30g pumpkin seeds",
      "2 tablespoons honey",
      "1/2 teaspoon cinnamon",
      "1 tablespoon pumpkin seed oil for drizzling"
    ],
    instructions: [
      "Ta recept za proseno kašo združuje tradicionalne slovenske sestavine v elegantno jutranjo jed.",
      "Proseno kašo temeljito sperite pod hladno tekočo vodo, dokler voda ne postane bistra.",
      "V večjem loncu zavremo vodo in mleko. Dodamo ščepec soli.",
      "Dodamo oprano proseno kašo, zmanjšamo ogenj in kuhamo približno 15 minut, občasno premešamo, da preprečimo prijemanje na dno lonca.",
      "Medtem na drobno narežemo sušeno sadje.",
      "Ko je kaša napol kuhana, dodamo narezano sušeno sadje in cimet. Premešamo in kuhamo še 5-10 minut, dokler kaša ne postane kremasta in sadje mehko.",
      "Odstavimo z ognja in pokrijemo. Pustimo stati 5 minut, da se kaša še nekoliko zgosti.",
      "Porazdelimo v skodelice, dodamo med, potresemo z bučnimi semeni in pokapljamo z bučnim oljem.",
      "Postrežemo toplo kot hranljiv zajtrk ali lahko večerjo."
    ],
    instructions_en: [
      "This millet porridge recipe combines traditional Slovenian ingredients into an elegant morning dish.",
      "Thoroughly rinse the millet groats under cold running water until the water runs clear.",
      "In a large pot, bring the water and milk to a boil. Add a pinch of salt.",
      "Add the rinsed millet, reduce the heat, and simmer for about 15 minutes, stirring occasionally to prevent sticking to the bottom of the pot.",
      "Meanwhile, finely chop the dried fruits.",
      "When the millet is half-cooked, add the chopped dried fruits and cinnamon. Stir and continue cooking for another 5-10 minutes until the porridge becomes creamy and the fruits are soft.",
      "Remove from heat and cover. Let it stand for 5 minutes to thicken slightly.",
      "Divide into bowls, add honey, sprinkle with pumpkin seeds, and drizzle with pumpkin seed oil.",
      "Serve warm as a nutritious breakfast or light dinner."
    ],
    relatedProductIds: [1, 2, 11] // Bučno olje, bučna semena, prosena kaša
  },
  {
    id: 16,
    title: "Fižolova juha s češnjevcem in aromatičnimi zelišči",
    title_en: "Bean Soup with Češnjevec Beans and Aromatic Herbs",
    title_sl: "Fižolova juha s češnjevcem in aromatičnimi zelišči",
    image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.Cre0XgTam_gQLAj_aOi6aAHaHa%26pid%3DApi&f=1&ipt=6bd6c5862d309c8555a1e6e1ed64bcf16c9d50c20e9cbe5a0d3a24f412ad33db",
    prepTime: "15 min (+ 8 ur namakanja)",
    cookTime: "1 h 30 min",
    difficulty: "Medium",
    ingredients: [
      "300 g fižola češnjevca",
      "1 velika čebula, sesekljana",
      "2 korenja, narezana na kocke",
      "2 stebelni zeleni, narezani",
      "3 stroki česna, sesekljani",
      "1 lovorov list",
      "1 žlica svežega timijana",
      "1 žlica svežega rožmarina",
      "1 žlica svežega majaron",
      "1.5 l zelenjavne jušne osnove",
      "2 žlici oljčnega olja",
      "sol in sveže mlet črni poper po okusu",
      "1 žlica bučnega olja za postrežbo",
      "svež sesekljan peteršilj za okras"
    ],
    ingredients_en: [
      "300g Češnjevec beans (traditional Slovenian beans)",
      "1 large onion, chopped",
      "2 carrots, diced",
      "2 celery stalks, sliced",
      "3 garlic cloves, minced",
      "1 bay leaf",
      "1 tablespoon fresh thyme",
      "1 tablespoon fresh rosemary",
      "1 tablespoon fresh marjoram",
      "1.5l vegetable stock",
      "2 tablespoons olive oil",
      "salt and freshly ground black pepper to taste",
      "1 tablespoon pumpkin seed oil for serving",
      "fresh chopped parsley for garnish"
    ],
    instructions: [
      "Ta bogata fižolova juha je počastitev tradicionalne slovenske sestavine - fižola češnjevca, ki ga obogati z aromatičnimi zelišči in bučnim oljem.",
      "Fižol češnjevec namakajte čez noč ali vsaj 8 ur v veliki posodi s hladno vodo. Po namakanju fižol odcedite in sperite.",
      "V velikem loncu segrejte oljčno olje na srednji temperaturi. Dodajte sesekljano čebulo in pražite 5 minut, dokler ne postane prosojna.",
      "Dodajte narezano korenje in zeleno ter pražite še 3-4 minute.",
      "Dodajte sesekljan česen in pražite 1 minuto, dokler ne zadiši.",
      "Dodajte odcejen fižol, lovorov list, timijan, rožmarin in majaron. Premešajte, da se sestavine povežejo.",
      "Prilijte zelenjavno jušno osnovo, pokrijte in privedite do vretja. Zmanjšajte ogenj in kuhajte na nizki temperaturi 1-1.5 ure, dokler fižol ni popolnoma mehak.",
      "Odstranite lovorov list. Z ročnim mešalnikom delno zmešajte juho, da postane nekoliko gostejša, vendar pustite nekaj celih zrn fižola za teksturo.",
      "Začinite s soljo in sveže mletim črnim poprom po okusu.",
      "Juho postrežite vročo, pokapljano z bučnim oljem in posuto s svežim sesekljanim peteršiljem."
    ],
    instructions_en: [
      "This rich bean soup is a tribute to a traditional Slovenian ingredient - Češnjevec beans, which is enhanced with aromatic herbs and pumpkin seed oil.",
      "Soak the Češnjevec beans overnight or for at least 8 hours in a large bowl with cold water. After soaking, drain and rinse the beans.",
      "In a large pot, heat the olive oil over medium heat. Add the chopped onion and sauté for 5 minutes until translucent.",
      "Add the diced carrots and celery and sauté for another 3-4 minutes.",
      "Add the minced garlic and sauté for 1 minute until fragrant.",
      "Add the drained beans, bay leaf, thyme, rosemary, and marjoram. Stir to combine the ingredients.",
      "Pour in the vegetable stock, cover, and bring to a boil. Reduce the heat and simmer for 1-1.5 hours until the beans are completely tender.",
      "Remove the bay leaf. Using an immersion blender, partially blend the soup to make it slightly thicker, but leave some whole beans for texture.",
      "Season with salt and freshly ground black pepper to taste.",
      "Serve the soup hot, drizzled with pumpkin seed oil and sprinkled with fresh chopped parsley."
    ],
    relatedProductIds: [1, 17] // Bučno olje, fižol češnjevec
  },
  {
    id: 17,
    title: "Ajdovi štruklji z bučnimi semeni in skuto",
    title_en: "Buckwheat Štruklji with Pumpkin Seeds and Cottage Cheese",
    title_sl: "Ajdovi štruklji z bučnimi semeni in skuto",
    image_url: "https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2F2.bp.blogspot.com%2F-ghSTj56qdpE%2FVk6S9ZMuHiI%2FAAAAAAAAKX4%2FASU6Oc4EJz0%2Fs1600%2Fthumb_IMG_0175_1024.jpg&f=1&nofb=1&ipt=c1bbe4c556325fbe926c90aa11908f51e5a258e9922131b7c2d1ae6a67e0e696",
    prepTime: "45 min",
    cookTime: "30 min",
    difficulty: "Medium",
    ingredients: [
      "Za testo:",
      "200 g ajdove moke",
      "100 g bele moke",
      "1 jajce",
      "1 žlica olja",
      "približno 150 ml mlačne vode",
      "ščepec soli",
      "Za nadev:",
      "500 g skute",
      "2 jajci",
      "50 g bučnih semen",
      "30 g masla",
      "2 žlici kisle smetane",
      "1 žlica drobtin",
      "sol in poper po okusu",
      "Za postrežbo:",
      "50 g masla",
      "50 g bučnih semen",
      "2 žlici bučnega olja"
    ],
    ingredients_en: [
      "For the dough:",
      "200g buckwheat flour",
      "100g white flour",
      "1 egg",
      "1 tablespoon oil",
      "approximately 150ml lukewarm water",
      "pinch of salt",
      "For the filling:",
      "500g cottage cheese",
      "2 eggs",
      "50g pumpkin seeds",
      "30g butter",
      "2 tablespoons sour cream",
      "1 tablespoon breadcrumbs",
      "salt and pepper to taste",
      "For serving:",
      "50g butter",
      "50g pumpkin seeds",
      "2 tablespoons pumpkin seed oil"
    ],
    instructions: [
      "Ta recept za ajdove štruklje predstavlja sodobno različico tradicionalne slovenske jedi, obogatene z bučnimi semeni in bučnim oljem.",
      "Priprava testa: V skledi zmešajte ajdovo in belo moko ter sol. Dodajte jajce in olje ter postopoma dodajajte mlačno vodo, medtem ko mešate, dokler ne dobite gladkega testa. Testo gnetite približno 10 minut, dokler ne postane elastično. Oblikujte v kroglo, pokrijte s kuhinjsko krpo in pustite počivati 30 minut.",
      "Priprava nadeva: Bučna semena na suho pražite v ponvi, dokler ne začnejo dišati in rahlo porjavijo. Ohladite in grobo sesekljajte. V skledi zmešajte skuto, jajca, kislo smetano, stopljeno maslo, drobtine, sol in poper. Dodajte sesekljana bučna semena in dobro premešajte.",
      "Testo razvaljajte na pomokani površini v pravokotnik debeline približno 3-4 mm. Enakomerno razporedite nadev po testu, pri čemer pustite 2 cm roba na vseh straneh.",
      "Testo previdno zvijte v zvitek, pri čemer začnite na daljši strani. Robove testa stisnite skupaj, da zaprete nadev.",
      "Zvitek zavijte v čisto kuhinjsko krpo in jo na obeh koncih zavežite z vrvico.",
      "V velikem loncu zavrite osoljeno vodo. Previdno položite zavit štrukelj v vrelo vodo in kuhajte 25-30 minut.",
      "Kuhane štruklje odvijte iz krpe, narežite na 2-3 cm debele rezine.",
      "Za postrežbo: V ponvi stopite maslo, dodajte bučna semena in pražite, dokler maslo ne postane zlato rjavo in semena ne začnejo dišati.",
      "Rezine štrukljev postrežite prelite z bučnim maslom in bučnimi semeni ter pokapljane z bučnim oljem."
    ],
    instructions_en: [
      "This recipe for buckwheat štruklji represents a modern version of a traditional Slovenian dish, enriched with pumpkin seeds and pumpkin seed oil.",
      "Prepare the dough: In a bowl, mix the buckwheat and white flour with salt. Add the egg and oil, and gradually add lukewarm water while mixing until you get a smooth dough. Knead the dough for about 10 minutes until it becomes elastic. Form into a ball, cover with a kitchen towel, and let rest for 30 minutes.",
      "Prepare the filling: Dry-roast the pumpkin seeds in a pan until they become fragrant and lightly browned. Cool and roughly chop. In a bowl, mix the cottage cheese, eggs, sour cream, melted butter, breadcrumbs, salt, and pepper. Add the chopped pumpkin seeds and mix well.",
      "Roll out the dough on a floured surface into a rectangle about 3-4 mm thick. Evenly spread the filling over the dough, leaving a 2 cm border on all sides.",
      "Carefully roll the dough into a log, starting from the longer side. Press the edges of the dough together to seal in the filling.",
      "Wrap the roll in a clean kitchen towel and tie it with string at both ends.",
      "In a large pot, bring salted water to a boil. Carefully place the wrapped štrukelj in the boiling water and cook for 25-30 minutes.",
      "Unwrap the cooked štruklji from the towel, cut into 2-3 cm thick slices.",
      "For serving: In a pan, melt the butter, add the pumpkin seeds, and sauté until the butter turns golden brown and the seeds become fragrant.",
      "Serve the štruklji slices topped with the pumpkin seed butter and pumpkin seeds, and drizzled with pumpkin seed oil."
    ],
    relatedProductIds: [1, 2, 10] // Bučno olje, bučna semena, ajdova kaša
  }
];

// Function to get recipes by product ID
export const getRecipesByProductId = (productId: number | string): Recipe[] => {
  // Convert productId to number if it's a string
  const numericProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;

  console.log('getRecipesByProductId called with ID:', productId,
    'type:', typeof productId,
    'converted to:', numericProductId);

  // Check each recipe's relatedProductIds
  sampleRecipes.forEach(recipe => {
    console.log(`Recipe ${recipe.id} relatedProductIds:`, recipe.relatedProductIds,
      'includes numericProductId:', recipe.relatedProductIds.includes(numericProductId));
  });

  const result = sampleRecipes.filter(recipe => recipe.relatedProductIds.includes(numericProductId));
  console.log('Filtered recipes result:', result);
  return result;
};
