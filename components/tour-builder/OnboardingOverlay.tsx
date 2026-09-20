'use client';

import React, { useState, useEffect } from 'react';
import {
  MousePointer2,
  Move,
  MapPin,
  Navigation,
  Info,
  Eye,
  Keyboard,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';

interface OnboardingOverlayProps {
  onComplete: () => void;
}

interface Step {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: string;
}

const steps: Step[] = [
  {
    title: 'Welcome to Tour Builder',
    description: 'Create professional 360° virtual tours with a powerful no-code editor. This guide will walk you through the basics.',
    icon: Eye,
  },
  {
    title: 'Room Manager (Left Panel)',
    description: 'Your rooms are listed on the left. Click to select, double-click to rename, drag to reorder. Right-click for more options.',
    icon: MapPin,
    highlight: 'left',
  },
  {
    title: 'Panorama Viewport (Center)',
    description: 'The main 360° viewer. Drag to look around, scroll to zoom. Right-click for quick actions.',
    icon: MousePointer2,
    highlight: 'center',
  },
  {
    title: 'Inspector Panel (Right Panel)',
    description: 'Edit properties of the selected room or hotspot. Change names, URLs, positions, and more.',
    icon: Move,
    highlight: 'right',
  },
  {
    title: 'Adding Hotspots',
    description: 'Select a hotspot tool from the bottom toolbar (N for navigation, F for info), then click on the panorama to place it.',
    icon: MapPin,
    highlight: 'toolbar',
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'Press ? anytime to see all available shortcuts. Common ones: V (select), N (navigation hotspot), S (set start view).',
    icon: Keyboard,
  },
  {
    title: 'You\'re Ready!',
    description: 'Start by adding your first room, or explore the toolbar to learn more. Happy tour building!',
    icon: Eye,
  },
];

export function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('viztr-tour-builder-onboarding');
    if (hasSeenOnboarding) {
      setIsVisible(false);
      onComplete();
    }
  }, [onComplete]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('viztr-tour-builder-onboarding', 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const Icon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#09090B] border border-[#27272A] rounded-xl w-[420px] overflow-hidden shadow-2xl">
        <div className="relative h-32 bg-gradient-to-br from-[#3ECF8E]/20 to-[#18181B] flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#3ECF8E]/20 flex items-center justify-center">
            <Icon className="w-8 h-8 text-[#3ECF8E]" />
          </div>
          <button
            onClick={handleComplete}
            className="absolute top-3 right-3 p-1.5 rounded hover:bg-white/10"
          >
            <X className="w-4 h-4 text-[#71717A]" />
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-mono font-bold text-white mb-2">{step.title}</h2>
          <p className="text-sm text-[#A1A1AA] leading-relaxed">{step.description}</p>
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentStep ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {!isFirst && (
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 rounded bg-[#27272A] hover:bg-[#3F3F46] text-xs font-mono text-white"
                >
                  <ChevronLeft className="w-4 h-4 inline mr-1" />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded bg-[#3ECF8E] hover:bg-[#34BF7D] text-xs font-mono text-black font-bold"
              >
                {isLast ? 'Get Started' : 'Next'}
                {!isLast && <ChevronRight className="w-4 h-4 inline ml-1" />}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-4">
          <button
            onClick={handleComplete}
            className="w-full text-center text-[10px] font-mono text-[#71717A] hover:text-white"
          >
            Skip tutorial
          </button>
        </div>
      </div>
    </div>
  );
}
