import React from 'react';
import { useTranslation } from 'react-i18next';

interface CheckoutStepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export const CheckoutStepIndicator: React.FC<CheckoutStepIndicatorProps> = ({ 
  currentStep, 
  steps 
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index + 1 === currentStep 
                    ? 'border-brown-600 bg-brown-600 text-white' 
                    : index + 1 < currentStep 
                      ? 'border-brown-600 bg-white text-brown-600' 
                      : 'border-gray-300 bg-white text-gray-300'
                }`}
              >
                {index + 1 < currentStep ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              <span 
                className={`mt-2 text-sm ${
                  index + 1 === currentStep 
                    ? 'font-semibold text-brown-600' 
                    : index + 1 < currentStep 
                      ? 'text-brown-600' 
                      : 'text-gray-400'
                }`}
              >
                {t(step)}
              </span>
            </div>
            
            {/* Connector Line (except after last step) */}
            {index < steps.length - 1 && (
              <div 
                className={`flex-1 h-1 mx-2 ${
                  index + 1 < currentStep ? 'bg-brown-600' : 'bg-gray-300'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
