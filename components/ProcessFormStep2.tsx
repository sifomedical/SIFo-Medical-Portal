"use client";

import { ChangeEvent, useState } from "react";
import { X, Plus, Loader2, Sparkles } from "lucide-react";

interface Step2Data {
  description: string;
  goals: string[];
}

interface ProcessFormStep2Props {
  data: Step2Data;
  onChange: (field: keyof Step2Data, value: string | string[]) => void;
  onValidate: () => { valid: boolean; errors: string[] };
  title?: string;
  subtitle?: string;
  category?: string;
}

export default function ProcessFormStep2({
  data,
  onChange,
  onValidate,
  title,
  subtitle,
  category,
}: ProcessFormStep2Props) {
  const validation = onValidate();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange("description", e.target.value);
  };

  const handleEnhanceDescription = async () => {
    if (!title || !subtitle) {
      setEnhanceError("Bitte fülle zuerst Titel und Untertitel aus");
      return;
    }

    setIsEnhancing(true);
    setEnhanceError(null);

    try {
      const response = await fetch("/api/admin/processes/enhance-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          subtitle,
          initialDescription: data.description,
          category,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setEnhanceError(result.message || "Fehler beim Verbessern der Beschreibung");
        return;
      }

      onChange("description", result.enhancedDescription);
    } catch (error: any) {
      setEnhanceError(error.message || "Fehler beim Verbessern der Beschreibung");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...data.goals];
    newGoals[index] = value;
    onChange("goals", newGoals);
  };

  const addGoal = () => {
    onChange("goals", [...data.goals, ""]);
  };

  const removeGoal = (index: number) => {
    const newGoals = data.goals.filter((_, i) => i !== index);
    onChange("goals", newGoals);
  };

  const descriptionError = validation.errors.find((e) => e.includes("description"));
  const goalsError = validation.errors.find((e) => e.includes("goals"));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            Beschreibung (2-3 Sätze) *
          </label>
          <button
            type="button"
            onClick={handleEnhanceDescription}
            disabled={isEnhancing || !title || !subtitle}
            className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={!title || !subtitle ? "Bitte fülle erst Titel und Untertitel aus" : "Mit KI verbessern"}
          >
            {isEnhancing ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Verbessert...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Mit KI verbessern
              </>
            )}
          </button>
        </div>
        <textarea
          value={data.description}
          onChange={handleDescriptionChange}
          placeholder="Beschreibe, was dieser Prozess macht und warum er wichtig ist..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
        />
        {descriptionError && (
          <p className="text-sm text-red-600 mt-1">Die Beschreibung ist erforderlich</p>
        )}
        {enhanceError && (
          <p className="text-sm text-purple-600 mt-1">⚠️ {enhanceError}</p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            Ziele (mindestens 2) *
          </label>
          <button
            onClick={addGoal}
            type="button"
            className="flex items-center gap-1 px-3 py-1 bg-[#00A68B] text-white rounded-lg text-sm hover:bg-[#008B6F]"
          >
            <Plus size={16} /> Ziel hinzufügen
          </button>
        </div>

        {data.goals.map((goal, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={goal}
              onChange={(e) => handleGoalChange(index, e.target.value)}
              placeholder={`Ziel ${index + 1}...`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
            />
            {data.goals.length > 2 && (
              <button
                onClick={() => removeGoal(index)}
                type="button"
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <X size={18} />
              </button>
            )}
          </div>
        ))}

        {goalsError && (
          <p className="text-sm text-red-600 mt-1">
            Du brauchst mindestens 2 Ziele
          </p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tipp:</strong> Die Ziele sollten konkret und messbar sein.
          Beispiel: "Sicherstellung von inhaltlicher Korrektheit"
        </p>
      </div>
    </div>
  );
}
