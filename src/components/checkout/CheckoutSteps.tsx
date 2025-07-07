import React from 'react';
import { useTranslation } from 'react-i18next';

interface CheckoutStepsProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ 
  steps, 
  currentStep,
  onStepClick
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isActive = index + 1 === currentStep;
          const isCompleted = index + 1 < currentStep;
          const isClickable = isCompleted && onStepClick;
          
          return (
            <div 
              key={index} 
              className={`flex-1 ${index > 0 ? 'ml-2' : ''}`}
              onClick={isClickable ? () => onStepClick(index + 1) : undefined}
            >
              <button 
                className={`w-full text-left py-3 px-4 text-sm border-b-2 transition-colors duration-150 ${
                  isActive 
                    ? 'border-blue-500 text-blue-600 font-medium' 
                    : isCompleted 
                      ? 'border-green-500 text-green-600 hover:text-green-700 cursor-pointer' 
                      : 'border-gray-200 text-gray-400'
                }`}
                disabled={!isClickable}
              >
                {t(step)}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutSteps;
