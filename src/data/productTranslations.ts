/**
 * Product translations mapping
 * Maps original product names and descriptions to their translations in different languages
 */

export interface ProductTranslation {
  name: {
    en: string;
    hr: string;
    de: string;
  };
  description?: {
    sl: string;
    en: string;
    hr: string;
    de: string;
  };
}

export type ProductTranslationsMap = Record<string, ProductTranslation>;

/**
 * Map of product translations by original Slovenian name
 */
export const productTranslations: ProductTranslationsMap = {
  // Bučno olje
  "Bučno olje": {
    name: {
      en: "Pumpkin Seed Oil",
      hr: "Ulje od bundeve",
      de: "Kürbiskernöl"
    },
    description: {
      sl: "Hladno stiskano bučno olje z naše kmetije. Bogato z okusom in hranilnimi snovmi.",
      en: "Cold-pressed pumpkin seed oil from our farm. Rich in flavor and nutrients.",
      hr: "Hladno prešano ulje od bundeve s naše farme. Bogato okusom i hranjivim tvarima.",
      de: "Kaltgepresstes Kürbiskernöl von unserem Bauernhof. Reich an Geschmack und Nährstoffen."
    }
  },
  // Bučna semena
  "Bučna semena": {
    name: {
      en: "Pumpkin Seeds",
      hr: "Sjemenke bundeve",
      de: "Kürbiskerne"
    },
    description: {
      sl: "Pražena bučna semena, odlična za prigrizek ali kot dodatek solati.",
      en: "Roasted pumpkin seeds, perfect for snacking or as a salad topping.",
      hr: "Pržene sjemenke bundeve, savršene za grickanje ili kao dodatak salati.",
      de: "Geröstete Kürbiskerne, perfekt als Snack oder als Salatbelag."
    }
  },
  // Konopljino olje
  "Konopljino olje": {
    name: {
      en: "Hemp Oil",
      hr: "Ulje konoplje",
      de: "Hanföl"
    },
    description: {
      sl: "Ekološko konopljino olje z oreškastim okusom, bogato z omega maščobnimi kislinami.",
      en: "Organic hemp oil with a nutty flavor, rich in omega fatty acids.",
      hr: "Organsko ulje konoplje s orašastim okusom, bogato omega masnim kiselinama.",
      de: "Organisches Hanföl mit nussigem Geschmack, reich an Omega-Fettsäuren."
    }
  },
  // Konopljin čaj
  "Konopljin čaj": {
    name: {
      en: "Hemp Tea",
      hr: "Čaj od konoplje",
      de: "Hanftee"
    },
    description: {
      sl: "Sproščujoča mešanica konopljinega čaja z naravnimi zelišči.",
      en: "Relaxing hemp tea blend with natural herbs.",
      hr: "Opuštajuća mješavina čaja od konoplje s prirodnim biljem.",
      de: "Entspannende Hanftee-Mischung mit natürlichen Kräutern."
    }
  },
  // Melisa
  "Melisa": {
    name: {
      en: "Lemon Balm",
      hr: "Matičnjak",
      de: "Zitronenmelisse"
    },
    description: {
      sl: "Posušeni listi melise za čaj z osvežilno citrusno aromo.",
      en: "Dried lemon balm leaves for tea with a refreshing citrus aroma.",
      hr: "Osušeni listovi matičnjaka za čaj s osvježavajućom aromom citrusa.",
      de: "Getrocknete Zitronenmelisseblätter für Tee mit erfrischendem Zitrusaroma."
    }
  },
  // Poprova meta
  "Poprova meta": {
    name: {
      en: "Peppermint",
      hr: "Paprena metvica",
      de: "Pfefferminze"
    },
    description: {
      sl: "Posušeni listi poprove mete za osvežilen in poživljajoč čaj.",
      en: "Dried peppermint leaves for a refreshing and invigorating tea.",
      hr: "Osušeni listovi paprene metvice za osvježavajući i okrepljujući čaj.",
      de: "Getrocknete Pfefferminzblätter für einen erfrischenden und belebenden Tee."
    }
  },
  // Ameriški slamnik
  "Ameriški slamnik": {
    name: {
      en: "Echinacea",
      hr: "Ehinacea",
      de: "Sonnenhut"
    },
    description: {
      sl: "Posušeni ameriški slamnik za čaj, znan po svojih lastnostih za krepitev imunskega sistema.",
      en: "Dried echinacea for tea, known for its immune-boosting properties.",
      hr: "Osušena ehinacea za čaj, poznata po svojim svojstvima jačanja imuniteta.",
      de: "Getrockneter Sonnenhut für Tee, bekannt für seine immunstärkenden Eigenschaften."
    }
  },
  // Kamilice
  "Kamilice": {
    name: {
      en: "Chamomile",
      hr: "Kamilica",
      de: "Kamille"
    },
    description: {
      sl: "Posušeni cvetovi kamilice za pomirjujoč in blagodejen čaj.",
      en: "Dried chamomile flowers for a calming and soothing tea.",
      hr: "Osušeni cvjetovi kamilice za umirujući čaj.",
      de: "Getrocknete Kamillenblüten für einen beruhigenden Tee."
    }
  },
  // Aronija
  "Aronija": {
    name: {
      en: "Aronia",
      hr: "Aronija",
      de: "Aronia"
    },
    description: {
      sl: "Posušene jagode aronije, bogate z antioksidanti in vitamini.",
      en: "Dried aronia berries, rich in antioxidants and vitamins.",
      hr: "Osušene bobice aronije, bogate antioksidansima i vitaminima.",
      de: "Getrocknete Aroniabeeren, reich an Antioxidantien und Vitaminen."
    }
  },
  // Ajdova kaša
  "Ajdova kaša": {
    name: {
      en: "Buckwheat Groats",
      hr: "Heljdina kaša",
      de: "Buchweizengrütze"
    },
    description: {
      sl: "Ekološka ajdova kaša, odlična za kašo ali kot priloga.",
      en: "Organic buckwheat groats, perfect for porridge or as a side dish.",
      hr: "Organska heljdina kaša, savršena za kašu ili kao prilog.",
      de: "Organische Buchweizengrütze, perfekt für Brei oder als Beilage."
    }
  },
  // Prosena kaša
  "Prosena kaša": {
    name: {
      en: "Millet Groats",
      hr: "Prosena kaša",
      de: "Hirsegrütze"
    },
    description: {
      sl: "Ekološka prosena kaša, hranljiva žitarica brez glutena.",
      en: "Organic millet groats, a nutritious and gluten-free grain.",
      hr: "Organska prosena kaša, hranjiva žitarica bez glutena.",
      de: "Organische Hirsegrütze, ein nahrhaftes und glutenfreies Getreide."
    }
  },
  // Fižol češnjevec
  "Fižol češnjevec": {
    name: {
      en: "Cherry Beans",
      hr: "Grah trešnjevac",
      de: "Kirschbohnen"
    },
    description: {
      sl: "Tradicionalni slovenski fižol češnjevec, odličen za juhe in enolončnice.",
      en: "Traditional Slovenian cherry beans, perfect for soups and stews.",
      hr: "Tradicionalni slovenski grah trešnjevac, savršen za juhe i gulaše.",
      de: "Traditionelle slowenische Kirschbohnen, perfekt für Suppen und Eintöpfe."
    }
  },
  // Pegasti badelj
  "Pegasti badelj": {
    name: {
      en: "Milk Thistle",
      hr: "Sikavica",
      de: "Mariendistel"
    },
    description: {
      sl: "Posušeni pegasti badelj, znan po svojih lastnostih za podporo jeter.",
      en: "Dried milk thistle, known for its liver-supporting properties.",
      hr: "Osušena sikavica, poznata po svojim svojstvima za podršku jetri.",
      de: "Getrocknete Mariendistel, bekannt für ihre leberunterstützenden Eigenschaften."
    }
  }
};

/**
 * Get translation for a product by its original name
 * 
 * @param originalName The original (Slovenian) product name
 * @param language The target language code
 * @param field The field to translate (name or description)
 * @returns The translated text or the original if no translation exists
 */
export function getProductTranslation(
  originalName: string,
  language: string,
  field: 'name' | 'description' = 'name'
): string {
  // Return original for Slovenian language name or Slovenian description if available
  if (language === 'sl') {
    if (field === 'name') {
      return originalName;
    } else if (field === 'description') {
      return productTranslations[originalName]?.description?.sl || originalName;
    }
  }
  
  // For other languages, look up the translation
  const translation = productTranslations[originalName];
  if (!translation) return originalName;
  
  if (field === 'description' && translation.description) {
    return translation.description[language as keyof typeof translation.description] || originalName;
  } else if (field === 'name') {
    return translation.name[language as keyof typeof translation.name] || originalName;
  }
  
  return originalName;
}
