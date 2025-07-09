import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Mail, Database, Eye, Trash2, Download, UserCheck } from 'lucide-react';

export function PrivacyPolicyPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-brown-600 text-white p-6">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <h1 className="text-3xl font-bold">
                {t('privacy.title', 'Pravilnik o zasebnosti')}
              </h1>
            </div>
            <p className="mt-2 text-brown-100">
              {t('privacy.subtitle', 'Kako varujemo vaše osebne podatke')}
            </p>
          </div>

          <div className="p-6 space-y-8">
            {/* Data Controller */}
            <section>
              <h2 className="text-2xl font-semibold text-brown-800 mb-4 flex items-center gap-2">
                <UserCheck className="w-6 h-6" />
                {t('privacy.controller.title', 'Upravljavec osebnih podatkov')}
              </h2>
              <div className="bg-stone-50 p-4 rounded-lg">
                <p className="font-semibold">Kmetija Maroša</p>
                <p>Melinci 80, 9231 Beltinci, Slovenija</p>
                <p>E-pošta: kmetija.marosa@gmail.com</p>
                <p>Telefon: +386 31 627 364</p>
              </div>
            </section>

            {/* Data We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-brown-800 mb-4 flex items-center gap-2">
                <Database className="w-6 h-6" />
                {t('privacy.dataCollection.title', 'Katere podatke zbiramo')}
              </h2>
              <div className="space-y-4">
                <div className="border-l-4 border-brown-300 pl-4">
                  <h3 className="font-semibold text-lg">{t('privacy.dataCollection.account', 'Podatki računa')}</h3>
                  <p className="text-gray-600">
                    {t('privacy.dataCollection.accountDesc', 'E-poštni naslov, polno ime, telefonska številka, naslov za dostavo')}
                  </p>
                </div>
                <div className="border-l-4 border-brown-300 pl-4">
                  <h3 className="font-semibold text-lg">{t('privacy.dataCollection.orders', 'Podatki naročil')}</h3>
                  <p className="text-gray-600">
                    {t('privacy.dataCollection.ordersDesc', 'Zgodovina nakupov, plačilni podatki, naslov za dostavo')}
                  </p>
                </div>
                <div className="border-l-4 border-brown-300 pl-4">
                  <h3 className="font-semibold text-lg">{t('privacy.dataCollection.newsletter', 'E-novice')}</h3>
                  <p className="text-gray-600">
                    {t('privacy.dataCollection.newsletterDesc', 'E-poštni naslov, ime, jezikovne preference')}
                  </p>
                </div>
              </div>
            </section>

            {/* Legal Basis */}
            <section>
              <h2 className="text-2xl font-semibold text-brown-800 mb-4">
                {t('privacy.legalBasis.title', 'Pravna podlaga za obdelavo')}
              </h2>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-brown-600 rounded-full mt-2"></span>
                  <span>{t('privacy.legalBasis.contract', 'Izvršitev pogodbe (obdelava naročil)')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-brown-600 rounded-full mt-2"></span>
                  <span>{t('privacy.legalBasis.consent', 'Privolitev (e-novice, marketing)')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-brown-600 rounded-full mt-2"></span>
                  <span>{t('privacy.legalBasis.legitimate', 'Upravičen interes (izboljšanje storitev)')}</span>
                </li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-semibold text-brown-800 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                {t('privacy.security.title', 'Varnost podatkov')}
              </h2>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    <span>{t('privacy.security.encryption', 'Šifriranje občutljivih podatkov (AES-GCM)')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    <span>{t('privacy.security.access', 'Omejen dostop samo pooblaščenim osebam')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    <span>{t('privacy.security.backup', 'Redni varnostni posnetki')}</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-brown-800 mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6" />
                {t('privacy.rights.title', 'Vaše pravice')}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {t('privacy.rights.access', 'Dostop do podatkov')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('privacy.rights.accessDesc', 'Zahtevajte kopijo svojih podatkov')}
                  </p>
                </div>
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    {t('privacy.rights.portability', 'Prenosljivost')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('privacy.rights.portabilityDesc', 'Prenos podatkov k drugemu ponudniku')}
                  </p>
                </div>
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    {t('privacy.rights.deletion', 'Izbris podatkov')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('privacy.rights.deletionDesc', 'Zahtevajte izbris svojih podatkov')}
                  </p>
                </div>
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('privacy.rights.objection', 'Ugovor')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('privacy.rights.objectionDesc', 'Ugovorite obdelavi za marketing')}
                  </p>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-brown-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-brown-800 mb-4">
                {t('privacy.contact.title', 'Kontakt za vprašanja o zasebnosti')}
              </h2>
              <p className="mb-4">
                {t('privacy.contact.desc', 'Za vprašanja o obdelavi osebnih podatkov nas kontaktirajte:')}
              </p>
              <div className="space-y-2">
                <p><strong>E-pošta:</strong> kmetija.marosa@gmail.com</p>
                <p><strong>Telefon:</strong> +386 31 627 364</p>
                <p><strong>Naslov:</strong> Melinci 80, 9231 Beltinci</p>
              </div>
            </section>

            {/* Last Updated */}
            <div className="text-center text-gray-500 text-sm border-t pt-4">
              {t('privacy.lastUpdated', 'Zadnja posodobitev')}: {new Date().toLocaleDateString('sl-SI')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
