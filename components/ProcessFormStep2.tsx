"use client";

import { ChangeEvent } from "react";
import { X, Plus } from "lucide-react";

interface Step2Data {
  description: string;
  goals: string[];
}

interface ProcessFormStep2Props {
  data: Step2Data;
  onChange: (field: keyof Step2Data, value: string | string[]) => void;
  onValidate: () => { valid: boolean; errors: string[] };
}

export default function ProcessFormStep2({
  data,
  onChange,
  onValidate,
}: ProcessFormStep2Props) {
  const validation = onValidate();

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange("description", e.target.value);
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
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Beschreibung (2-3 Sätze) *
        </label>
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
