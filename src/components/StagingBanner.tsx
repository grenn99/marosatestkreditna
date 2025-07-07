import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * A banner that displays only in the staging environment
 * to clearly indicate that users are not on the production site
 */
export function StagingBanner() {
  const { t } = useTranslation();

  // Only show in staging environment
  const showStagingBanner = import.meta.env.VITE_STAGING_BANNER === 'true';

  if (!showStagingBanner) {
    return null;
  }

  return (
    <div className="bg-yellow-500 text-black py-1 px-4 text-center font-bold sticky top-0 z-50">
      {t('staging.banner', 'STAGING ENVIRONMENT - NOT PRODUCTION')}
    </div>
  );
}
