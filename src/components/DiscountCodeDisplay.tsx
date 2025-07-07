import React from 'react';
import { useTranslation } from 'react-i18next';

// Direct translations for discount code UI elements
const discountTranslations = {
  sl: {
    title: 'Koda za popust',
    placeholder: 'Vnesite kodo za popust',
    apply: 'Uporabi',
    applying: 'Preverjanje...'
  },
  en: {
    title: 'Discount Code',
    placeholder: 'Enter discount code',
    apply: 'Apply',
    applying: 'Applying...'
  },
  de: {
    title: 'Rabattcode',
    placeholder: 'Rabattcode eingeben',
    apply: 'Anwenden',
    applying: 'Wird angewendet...'
  },
  hr: {
    title: 'Kod za popust',
    placeholder: 'Unesite kod za popust',
    apply: 'Primijeni',
    applying: 'Primjenjujem...'
  }
};

interface DiscountCodeDisplayProps {
  type: 'title' | 'placeholder' | 'apply' | 'applying';
}

export function DiscountCodeDisplay({ type }: DiscountCodeDisplayProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language as keyof typeof discountTranslations;
  
  // Default to English if language not found
  const translations = discountTranslations[lang] || discountTranslations.en;
  
  return <>{translations[type]}</>;
}
