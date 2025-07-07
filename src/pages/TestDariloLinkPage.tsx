import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DariloPackageLink } from '../components/DariloPackageLink';
import { createDariloPackageLink } from '../utils/linkUtils';

export function TestDariloLinkPage() {
  const { t, i18n } = useTranslation();
  
  // The ID of the gift package we want to link to
  const packageId = 14;
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-brown-800 mb-6">
          Test Darilo Package Links
        </h1>
        
        <p className="text-lg text-gray-700 mb-8">
          This page demonstrates different ways to link to Darilo package ID 14.
        </p>
        
        <div className="space-y-6">
          {/* Method 1: Using the DariloPackageLink component */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-brown-700 mb-3">
              Method 1: Using the DariloPackageLink component
            </h2>
            <DariloPackageLink 
              packageId={packageId} 
              buttonText={t('test.viewGiftPackage', 'View Gift Package 14')} 
            />
          </div>
          
          {/* Method 2: Using the utility function with React Router */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-brown-700 mb-3">
              Method 2: Using the utility function with React Router
            </h2>
            <Link 
              to={createDariloPackageLink(packageId, i18n.language)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              {t('test.viewGiftPackage', 'View Gift Package 14')} (Method 2)
            </Link>
          </div>
          
          {/* Method 3: Direct URL */}
          <div>
            <h2 className="text-xl font-semibold text-brown-700 mb-3">
              Method 3: Direct URL
            </h2>
            <a 
              href={`/darilo?packageId=${packageId}&lang=${i18n.language}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('test.viewGiftPackage', 'View Gift Package 14')} (Method 3)
            </a>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-brown-700 mb-3">
            URL Examples
          </h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="font-mono mb-2">
              /darilo?packageId=14
            </p>
            <p className="font-mono mb-2">
              /darilo?packageId=14&lang=en
            </p>
            <p className="font-mono">
              /darilo/builder/14
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link 
            to="/"
            className="inline-flex items-center px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
