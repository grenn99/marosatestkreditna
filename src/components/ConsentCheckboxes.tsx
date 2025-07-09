import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Shield, Mail } from 'lucide-react';

interface ConsentCheckboxesProps {
  showProcessingConsent?: boolean;
  showMarketingConsent?: boolean;
  processingConsent: boolean;
  marketingConsent: boolean;
  onProcessingConsentChange: (consent: boolean) => void;
  onMarketingConsentChange: (consent: boolean) => void;
  errors?: {
    processingConsent?: string;
    marketingConsent?: string;
  };
}

export function ConsentCheckboxes({
  showProcessingConsent = true,
  showMarketingConsent = true,
  processingConsent,
  marketingConsent,
  onProcessingConsentChange,
  onMarketingConsentChange,
  errors = {}
}: ConsentCheckboxesProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Processing Consent (Required) */}
      {showProcessingConsent && (
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={processingConsent}
              onChange={(e) => onProcessingConsentChange(e.target.checked)}
              className="mt-1 w-4 h-4 text-brown-600 border-gray-300 rounded focus:ring-brown-500"
              required
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-brown-600" />
                <span className="text-sm font-medium text-gray-900">
                  {t('consent.processing.title', 'Soglašam z obdelavo osebnih podatkov')}
                  <span className="text-red-500 ml-1">*</span>
                </span>
              </div>
              <p className="text-xs text-gray-600">
                {t('consent.processing.description', 'Soglašam, da Kmetija Maroša obdeluje moje osebne podatke za namen izvršitve naročila in komunikacije. Več informacij v')}{' '}
                <Link to="/privacy-policy" className="text-brown-600 hover:underline">
                  {t('consent.processing.privacyPolicy', 'pravilniku o zasebnosti')}
                </Link>.
              </p>
            </div>
          </label>
          {errors.processingConsent && (
            <p className="text-red-500 text-xs ml-7">{errors.processingConsent}</p>
          )}
        </div>
      )}

      {/* Marketing Consent (Optional) */}
      {showMarketingConsent && (
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => onMarketingConsentChange(e.target.checked)}
              className="mt-1 w-4 h-4 text-brown-600 border-gray-300 rounded focus:ring-brown-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-brown-600" />
                <span className="text-sm font-medium text-gray-900">
                  {t('consent.marketing.title', 'Želim prejemati e-novice in promocijske ponudbe')}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                {t('consent.marketing.description', 'Soglašam, da mi Kmetija Maroša pošilja e-novice, promocijske ponudbe in obvestila o novih izdelkih. Soglasje lahko kadarkoli prekličem.')}
              </p>
            </div>
          </label>
          {errors.marketingConsent && (
            <p className="text-red-500 text-xs ml-7">{errors.marketingConsent}</p>
          )}
        </div>
      )}

      {/* GDPR Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">
              {t('consent.gdpr.title', 'Vaše pravice po GDPR')}
            </p>
            <p>
              {t('consent.gdpr.description', 'Imate pravico do dostopa, popravka, prenosljivosti in izbrisa svojih podatkov. Za več informacij ali uveljavljanje pravic nas kontaktirajte na')}{' '}
              <a href="mailto:kmetija.marosa@gmail.com" className="underline">
                kmetija.marosa@gmail.com
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
