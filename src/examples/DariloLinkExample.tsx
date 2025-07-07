import React from 'react';
import { DariloPackageLink } from '../components/DariloPackageLink';
import { createDariloPackageLink, createGiftBuilderLink } from '../utils/linkUtils';
import { useTranslation } from 'react-i18next';

/**
 * Example component showing different ways to link to Darilo package 14
 */
export function DariloLinkExample() {
  const { t, i18n } = useTranslation();
  
  // The ID of the gift package we want to link to
  const packageId = 14;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Darilo Package Link Examples</h1>
      
      <div className="space-y-8">
        {/* Example 1: Using the DariloPackageLink component */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Example 1: Using the DariloPackageLink component</h2>
          <p className="mb-4">This is the simplest way to create a link to a specific gift package:</p>
          
          <DariloPackageLink 
            packageId={packageId} 
            buttonText={t('examples.viewGiftPackage', 'View Gift Package 14')} 
          />
          
          <p className="mt-4 text-sm text-gray-600">
            This component automatically handles language parameters and styling.
          </p>
        </div>
        
        {/* Example 2: Using the utility functions directly */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Example 2: Using utility functions</h2>
          <p className="mb-4">You can also use the utility functions directly to create links:</p>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium">Link to Darilo page with package ID:</p>
              <code className="block bg-gray-100 p-2 rounded mt-2">
                {createDariloPackageLink(packageId, i18n.language)}
              </code>
            </div>
            
            <div>
              <p className="font-medium">Direct link to Gift Builder:</p>
              <code className="block bg-gray-100 p-2 rounded mt-2">
                {createGiftBuilderLink(packageId, i18n.language)}
              </code>
            </div>
          </div>
        </div>
        
        {/* Example 3: HTML usage */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Example 3: HTML usage</h2>
          <p className="mb-4">For HTML or non-React contexts, you can use these URLs:</p>
          
          <div className="space-y-2">
            <p>
              <strong>Standard link:</strong><br />
              <code>{`<a href="/darilo?packageId=14">View Gift Package 14</a>`}</code>
            </p>
            
            <p>
              <strong>With language parameter:</strong><br />
              <code>{`<a href="/darilo?packageId=14&lang=en">View Gift Package 14</a>`}</code>
            </p>
            
            <p>
              <strong>Direct to builder:</strong><br />
              <code>{`<a href="/darilo/builder/14">Go directly to Gift Builder</a>`}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
