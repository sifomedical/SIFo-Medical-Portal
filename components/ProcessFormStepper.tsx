"use client";

import { ChevronRight } from "lucide-react";

interface Step {
  id: number;
  label: string;
  title: string;
}

interface ProcessFormStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export default function ProcessFormStepper({
  steps,
  currentStep,
  onStepClick,
}: ProcessFormStepperProps) {
  return (
    <div className="space-y-6">
      {/* Horizontal stepper for desktop */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step circle */}
            <button
              onClick={() => onStepClick(step.id)}
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors ${
                currentStep >= step.id
                  ? "bg-[#00A68B] text-white"
                  : "bg-gray-300 text-gray-700"
              } hover:opacity-80`}
            >
              {currentStep > step.id ? "✓" : step.id}
            </button>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 transition-colors ${
                  currentStep > step.id ? "bg-[#00A68B]" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step labels */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-0">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => onStepClick(step.id)}
            className={`text-center text-xs md:text-sm font-medium py-2 px-1 rounded-lg transition-colors ${
              currentStep === step.id
                ? "bg-[#00A68B] text-white"
                : currentStep > step.id
                ? "text-[#00A68B]"
                : "text-gray-500"
            } hover:bg-gray-100`}
          >
            <div className="font-semibold">{step.label}</div>
            <div className="text-xs">{step.title}</div>
          </button>
        ))}
      </div>

      {/* Progress bar (mobile) */}
      <div className="md:hidden w-full bg-gray-300 rounded-full h-2 overflow-hidden">
        <div
          className="bg-[#00A68B] h-full transition-all duration-300"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
