"use client";

import { ChangeEvent } from "react";
import { X, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { ProcessStep } from "@/types/process";

interface Step4Data {
  steps: ProcessStep[];
}

interface ProcessFormStep4Props {
  data: Step4Data;
  onChange: (field: string, value: any) => void;
  onValidate: () => { valid: boolean; errors: string[] };
}

export default function ProcessFormStep4({
  data,
  onChange,
  onValidate,
}: ProcessFormStep4Props) {
  const validation = onValidate();
  const stepsError = validation.errors.find((e) => e.includes("steps"));

  const updateStep = (index: number, field: string, value: any) => {
    const newSteps = [...data.steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value,
    };
    onChange("steps", newSteps);
  };

  const updateSubstep = (stepIndex: number, substepIndex: number, field: string, value: string) => {
    const newSteps = [...data.steps];
    if (!newSteps[stepIndex].substeps) {
      newSteps[stepIndex].substeps = [];
    }
    newSteps[stepIndex].substeps![substepIndex] = {
      ...newSteps[stepIndex].substeps![substepIndex],
      id: `substep-${stepIndex}-${substepIndex}`,
      [field]: value,
    };
    onChange("steps", newSteps);
  };

  const addStep = () => {
    const newStep: ProcessStep = {
      id: `step-${data.steps.length + 1}`,
      title: "",
      description: "",
    };
    onChange("steps", [...data.steps, newStep]);
  };

  const removeStep = (index: number) => {
    const newSteps = data.steps.filter((_, i) => i !== index);
    onChange("steps", newSteps);
  };

  const addSubstep = (stepIndex: number) => {
    const newSteps = [...data.steps];
    if (!newSteps[stepIndex].substeps) {
      newSteps[stepIndex].substeps = [];
    }
    newSteps[stepIndex].substeps!.push({
      id: `substep-${stepIndex}-${newSteps[stepIndex].substeps!.length}`,
      title: "",
      description: "",
    });
    onChange("steps", newSteps);
  };

  const removeSubstep = (stepIndex: number, substepIndex: number) => {
    const newSteps = [...data.steps];
    if (newSteps[stepIndex].substeps) {
      newSteps[stepIndex].substeps = newSteps[stepIndex].substeps!.filter(
        (_, i) => i !== substepIndex
      );
    }
    onChange("steps", newSteps);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Prozess-Schritte (mindestens 2) *
          </label>
          <p className="text-sm text-gray-600">
            Definiere die einzelnen Schritte deines Prozesses. Jeder Schritt kann
            mehrere Substeps haben.
          </p>
        </div>
        <button
          onClick={addStep}
          type="button"
          className="flex items-center gap-1 px-3 py-1 bg-[#00A68B] text-white rounded-lg text-sm hover:bg-[#008B6F]"
        >
          <Plus size={16} /> Schritt hinzufügen
        </button>
      </div>

      {stepsError && (
        <p className="text-sm text-red-600">Du brauchst mindestens 2 Schritte</p>
      )}

      <div className="space-y-4">
        {data.steps.map((step, stepIndex) => (
          <div key={step.id} className="border border-gray-300 rounded-lg p-4 bg-white">
            <div className="space-y-3">
              {/* Main step fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schritt {stepIndex + 1}: Titel *
                </label>
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => updateStep(stepIndex, "title", e.target.value)}
                  placeholder="z.B. Notion Sheet filtern nach 'ready for review'"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung *
                </label>
                <textarea
                  value={step.description}
                  onChange={(e) => updateStep(stepIndex, "description", e.target.value)}
                  placeholder="Was wird in diesem Schritt gemacht?"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
                />
              </div>

              {/* Substeps */}
              {step.substeps && step.substeps.length > 0 && (
                <div className="ml-4 p-3 bg-gray-50 rounded-lg space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Substeps:
                  </label>
                  {step.substeps.map((substep, substepIndex) => (
                    <div key={`${step.id}-${substepIndex}`} className="flex gap-2">
                      <input
                        type="text"
                        value={substep.title}
                        onChange={(e) =>
                          updateSubstep(stepIndex, substepIndex, "title", e.target.value)
                        }
                        placeholder={`Substep ${substepIndex + 1}...`}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
                      />
                      <button
                        onClick={() => removeSubstep(stepIndex, substepIndex)}
                        type="button"
                        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addSubstep(stepIndex)}
                    type="button"
                    className="text-sm text-[#00A68B] hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Substep hinzufügen
                  </button>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                {!step.substeps || step.substeps.length === 0 ? (
                  <button
                    onClick={() => addSubstep(stepIndex)}
                    type="button"
                    className="text-sm text-[#00A68B] hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Substeps hinzufügen
                  </button>
                ) : (
                  <div />
                )}
                {data.steps.length > 2 && (
                  <button
                    onClick={() => removeStep(stepIndex)}
                    type="button"
                    className="text-sm text-red-600 hover:underline flex items-center gap-1"
                  >
                    <X size={14} /> Schritt löschen
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tipp:</strong> Substeps sind optional und helfen, komplexe Schritte zu
          strukturieren. Beispiel: "Notion-Sheet öffnen", "Filter setzen", "Übersicht anzeigen"
        </p>
      </div>
    </div>
  );
}
