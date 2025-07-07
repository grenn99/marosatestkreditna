import React, { useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface StepProps {
  title: string;
  children: ReactNode;
}

interface MultiStepCheckoutProps {
  steps: StepProps[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  validateStep?: (step: number) => boolean;
  onFinish?: () => void;
  translations?: {
    next?: string;
    previous?: string;
    finish?: string;
  };
}

export const MultiStepCheckout: React.FC<MultiStepCheckoutProps> = ({
  steps,
  currentStep,
  setCurrentStep,
  validateStep,
  onFinish,
  translations = { next: 'Next', previous: 'Previous', finish: 'Finish' },
}) => {
  const totalSteps = steps.length;

  const handleNext = () => {
    if (validateStep && !validateStep(currentStep)) {
      return; // Validation failed
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === totalSteps && onFinish) {
      onFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    if (newDirection > 0) {
      handleNext();
    } else {
      handlePrevious();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentStep}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {steps[currentStep - 1].title}
          </h2>
          {steps[currentStep - 1].children}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-between">
        {currentStep > 1 && (
          <button
            onClick={() => paginate(-1)}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500"
          >
            {translations.previous}
          </button>
        )}
        {currentStep < totalSteps && (
          <button
            onClick={() => paginate(1)}
            className="ml-auto px-6 py-2 text-sm font-medium text-white bg-brown-600 border border-transparent rounded-md shadow-sm hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500"
          >
            {translations.next}
          </button>
        )}
        {currentStep === totalSteps && (
          <button
            onClick={handleNext} // This will call onFinish if validation passes
            className="ml-auto px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {translations.finish}
          </button>
        )}
      </div>
    </div>
  );
};
