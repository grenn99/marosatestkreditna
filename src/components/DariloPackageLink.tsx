import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Gift } from 'lucide-react';
import { createDariloPackageLink } from '../utils/linkUtils';

interface DariloPackageLinkProps {
  packageId: number;
  className?: string;
  buttonText?: string;
}

/**
 * A component that renders a link to a specific gift package
 */
export function DariloPackageLink({ 
  packageId, 
  className = "inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors", 
  buttonText 
}: DariloPackageLinkProps) {
  const { t, i18n } = useTranslation();
  
  // Create the link to the Darilo page with the specified package ID
  const linkUrl = createDariloPackageLink(packageId, i18n.language);
  
  // Use provided button text or default to "View Gift Package"
  const text = buttonText || t('gifts.viewPackage', 'View Gift Package');
  
  return (
    <Link to={linkUrl} className={className}>
      <Gift className="w-5 h-5 mr-2" />
      {text}
    </Link>
  );
}
