"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import ProcessFormStepper from "@/components/ProcessFormStepper";
import ProcessFormStep1 from "@/components/ProcessFormStep1";
import ProcessFormStep2 from "@/components/ProcessFormStep2";
import ProcessFormStep3 from "@/components/ProcessFormStep3";
import ProcessFormStep4 from "@/components/ProcessFormStep4";
import ProcessFormStep5 from "@/components/ProcessFormStep5";
import ProcessFormPreview from "@/components/ProcessFormPreview";
import { generateMermaidFlowchart } from "@/lib/mermaid-generator";
import { prepareAndValidateProcess, validateProcessData } from "@/lib/process-utils";

const STEPS = [
  { id: 1, label: "Schritt 1", title: "Basis" },
  { id: 2, label: "Schritt 2", title: "Ziele" },
  { id: 3, label: "Schritt 3", title: "Kontext" },
  { id: 4, label: "Schritt 4", title: "Schritte" },
  { id: 5, label: "Schritt 5", title: "Tools" },
  { id: 6, label: "Preview", title: "Übersicht" },
];

interface FormData {
  title: string;
  subtitle: string;
  category: string;
  description: string;
  goals: string[];
  owner: string;
  frequency: string;
  tags: string[];
  steps: any[];
  tools: any[];
  processVideoUrl?: string;
}

const initialFormData: FormData = {
  title: "",
  subtitle: "",
  category: "",
  description: "",
  goals: ["", ""],
  owner: "",
  frequency: "",
  tags: ["", ""],
  steps: [
    {
      id: "step-1",
      title: "",
      description: "",
    },
    {
      id: "step-2",
      title: "",
      description: "",
    },
  ],
  tools: [
    {
      name: "",
      url: "",
      icon: "🛠️",
    },
  ],
};

export default function CreateProcessPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return {
          valid: Boolean(formData.title && formData.subtitle && formData.category),
          errors: [],
        };
      case 2:
        return {
          valid: formData.goals.filter((g) => g && g.trim()).length >= 2,
          errors: formData.description ? [] : ["description is required"],
        };
      case 3:
        return {
          valid: Boolean(formData.owner && formData.frequency),
          errors: formData.tags.filter((t) => t && t.trim()).length >= 2 ? [] : ["tags error"],
        };
      case 4:
        return {
          valid: formData.steps.filter((s) => s.title && s.description).length >= 2,
          errors: [],
        };
      case 5:
        return {
          valid: formData.tools.filter((t) => t.name && t.name.trim()).length >= 1,
          errors: [],
        };
      default:
        return { valid: true, errors: [] };
    }
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    } else if (step === currentStep + 1) {
      const validation = validateStep(currentStep);
      if (validation.valid) {
        setCurrentStep(step);
      }
    }
  };

  const handleNext = () => {
    const validation = validateStep(currentStep);
    if (validation.valid) {
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Generate Mermaid diagram
      const mermaidDiagram = generateMermaidFlowchart(formData.steps);

      // Validate and prepare process (slug deduplication happens in API)
      const validation = validateProcessData(formData);
      if (!validation.valid) {
        setError(validation.errors.join(", "));
        setIsSubmitting(false);
        return;
      }


      // Call API to create process
      const response = await fetch("/api/admin/processes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Fehler beim Erstellen des Prozesses");
        setIsSubmitting(false);
        return;
      }

      // Success!
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/processes");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Fehler beim Speichern");
      setIsSubmitting(false);
    }
  };

  // Generate preview for step 6
  const mermaidDiagram = generateMermaidFlowchart(formData.steps);
  const validation = validateProcessData(formData);
  let previewProcess = null;
  if (validation.valid) {
    // Create simple preview (slug generation happens in API)
    const baseSlug = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    previewProcess = {
      id: `process-${baseSlug}`,
      slug: baseSlug,
      title: formData.title,
      subtitle: formData.subtitle,
      category: formData.category as any,
      description: formData.description,
      goals: formData.goals.filter(g => g && g.trim()),
      owner: formData.owner,
      frequency: formData.frequency,
      steps: formData.steps,
      tools: formData.tools,
      tags: formData.tags.filter(t => t && t.trim()),
      mermaidDiagram,
      status: "active" as const,
      lastUpdated: new Date().toISOString(),
    };
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {currentStep === 6 ? "📋 Übersicht" : "➕ Neuer Prozess"}
          </h1>
          <p className="text-gray-600 mt-2">
            {currentStep === 6
              ? "Überprüfe deine Eingaben bevor du speicherst"
              : `Schritt ${currentStep} von 5`}
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <ProcessFormStepper
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Error/Success messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            ✅ Prozess erfolgreich erstellt! Weitergeleitet...
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {currentStep === 1 && (
            <ProcessFormStep1
              data={{
                title: formData.title,
                subtitle: formData.subtitle,
                category: formData.category,
              }}
              onChange={handleFormChange}
              onValidate={() => validateStep(1)}
            />
          )}

          {currentStep === 2 && (
            <ProcessFormStep2
              data={{
                description: formData.description,
                goals: formData.goals,
              }}
              onChange={handleFormChange}
              onValidate={() => validateStep(2)}
              title={formData.title}
              subtitle={formData.subtitle}
              category={formData.category}
            />
          )}

          {currentStep === 3 && (
            <ProcessFormStep3
              data={{
                owner: formData.owner,
                frequency: formData.frequency,
                tags: formData.tags,
              }}
              onChange={handleFormChange}
              onValidate={() => validateStep(3)}
            />
          )}

          {currentStep === 4 && (
            <ProcessFormStep4
              data={{ steps: formData.steps }}
              onChange={handleFormChange}
              onValidate={() => validateStep(4)}
            />
          )}

          {currentStep === 5 && (
            <ProcessFormStep5
              data={{ tools: formData.tools }}
              onChange={handleFormChange}
              onValidate={() => validateStep(5)}
            />
          )}

          {currentStep === 6 && previewProcess && (
            <ProcessFormPreview process={previewProcess} />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} /> Zurück
          </button>

          {currentStep === 6 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Speichert...
                </>
              ) : (
                <>
                  ✅ Speichern & Commit
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-[#00A68B] text-white rounded-lg hover:bg-[#008B6F]"
            >
              Weiter <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
