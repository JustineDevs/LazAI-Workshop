'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface OnboardingStep {
  title: string;
  description: string;
  image?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Welcome to DataStreamNFT!",
    description: "Discover how to mint, query, and earn from your data as NFTs. This quick tour will guide you through the essentials.",
    image: "/images/onboarding/onboarding-welcome.svg",
  },
  {
    title: "Connect Your Wallet",
    description: "Securely connect your Web3 wallet (e.g., MetaMask) to interact with the blockchain and manage your assets.",
    image: "/images/onboarding/onboarding-wallet.svg",
  },
  {
    title: "Upload & Mint Your Data",
    description: "Encrypt your data, upload it to IPFS, and mint a Data Anchoring Token (DAT) as an NFT. Set your query price!",
    image: "/images/onboarding/onboarding-mint.svg",
  },
  {
    title: "Earn from AI Queries",
    description: "When AI agents query your data, you automatically receive micropayments. Track your earnings on your dashboard.",
    image: "/images/onboarding/onboarding-earn.svg",
  },
  {
    title: "Manage Your DATs",
    description: "Use your dashboard to update query prices, toggle active status, and view analytics for your data NFTs.",
    image: "/images/onboarding/onboarding-manage.svg",
  },
  {
    title: "Explore the Marketplace",
    description: "Browse and query data from other creators, or discover new AI models and datasets.",
    image: "/images/onboarding/onboarding-marketplace.svg",
  },
  {
    title: "Integrate with LazAI",
    description: "Leverage LazAI&apos;s powerful AI inference capabilities directly through your data NFTs.",
    image: "/images/onboarding/onboarding-lazai.svg",
  },
  {
    title: "Ready to Get Started?",
    description: "You&apos;re all set! Start creating, querying, and earning. If you need help, check our comprehensive documentation.",
    image: "/images/onboarding/onboarding-ready.svg",
  },
];

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function OnboardingFlow({ isOpen, onClose, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg"
          aria-label="Skip onboarding"
        >
          &times;
        </button>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-primary-800 mb-3">{step.title}</h2>
          {step.image && (
            <img src={step.image} alt={step.title} className="mx-auto my-6 rounded-lg shadow-md max-h-48 object-cover" />
          )}
          <p className="text-lg text-secondary-700">{step.description}</p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div
            className="bg-primary-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center">
          {!isFirstStep && (
            <Button onClick={handlePrevious} variant="outline">
              Previous
            </Button>
          )}
          <div className={isFirstStep ? 'w-full text-center' : ''}>
            <Button onClick={handleNext} variant="primary">
              {isLastStep ? "Finish Tour" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}