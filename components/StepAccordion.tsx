"use client";
import { useState } from "react";
import { ChevronDown, Lightbulb, Wrench } from "lucide-react";
import { ProcessStep } from "@/types/process";

interface StepProps {
  step: ProcessStep;
  index: number;
  defaultOpen?: boolean;
}

function SubStep({ step }: { step: ProcessStep }) {
  return (
    <div className="ml-4 pl-4 border-l-2 border-gray-100 py-2">
      <h5 className="text-sm font-medium text-gray-800 mb-1">{step.title}</h5>
      <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
    </div>
  );
}

function StepItem({ step, index, defaultOpen = false }: StepProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        {/* Step Number */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1B3A6B] text-white text-sm font-bold flex items-center justify-center">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
            {step.title}
          </h4>
          {!open && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
              {step.description}
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {step.tools && step.tools.length > 0 && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
              <Wrench className="w-3 h-3" />
              {step.tools.length}
            </span>
          )}
          {step.tips && step.tips.length > 0 && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-amber-500">
              <Lightbulb className="w-3 h-3" />
              {step.tips.length}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
          {/* Beschreibung */}
          <p className="text-sm text-gray-600 leading-relaxed pt-3">
            {step.description}
          </p>

          {/* Sub-Steps */}
          {step.substeps && step.substeps.length > 0 && (
            <div className="space-y-1">
              <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Teilschritte
              </h5>
              {step.substeps.map((sub) => (
                <SubStep key={sub.id} step={sub} />
              ))}
            </div>
          )}

          {/* Tools */}
          {step.tools && step.tools.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Wrench className="w-3 h-3" /> Tools
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {step.tools.map((tool) => (
                  <span
                    key={tool}
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {step.tips && step.tips.length > 0 && (
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
              <h5 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" /> Tipps
              </h5>
              <ul className="space-y-1">
                {step.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-amber-800 flex gap-2">
                    <span className="text-amber-400 mt-0.5">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface AccordionProps {
  steps: ProcessStep[];
}

export default function StepAccordion({ steps }: AccordionProps) {
  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <StepItem
          key={step.id}
          step={step}
          index={index}
          defaultOpen={index === 0}
        />
      ))}
    </div>
  );
}
