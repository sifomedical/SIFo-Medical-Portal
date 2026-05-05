"use client";

import { ChangeEvent } from "react";
import { X, Plus } from "lucide-react";

interface Step3Data {
  owner: string;
  frequency: string;
  tags: string[];
}

interface ProcessFormStep3Props {
  data: Step3Data;
  onChange: (field: keyof Step3Data, value: string | string[]) => void;
  onValidate: () => { valid: boolean; errors: string[] };
}

export default function ProcessFormStep3({
  data,
  onChange,
  onValidate,
}: ProcessFormStep3Props) {
  const validation = onValidate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(name as keyof Step3Data, value);
  };

  const addTag = () => {
    onChange("tags", [...data.tags, ""]);
  };

  const removeTag = (index: number) => {
    const newTags = data.tags.filter((_, i) => i !== index);
    onChange("tags", newTags);
  };

  const updateTag = (index: number, value: string) => {
    const newTags = [...data.tags];
    newTags[index] = value;
    onChange("tags", newTags);
  };

  const ownerError = validation.errors.find((e) => e.includes("owner"));
  const frequencyError = validation.errors.find((e) => e.includes("frequency"));
  const tagsError = validation.errors.find((e) => e.includes("tags"));

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Owner / Verantwortlicher *
        </label>
        <input
          type="text"
          name="owner"
          value={data.owner}
          onChange={handleChange}
          placeholder="z.B. Marketing, Operations, ..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
        />
        {ownerError && (
          <p className="text-sm text-red-600 mt-1">Der Owner ist erforderlich</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Häufigkeit / Zeitplan *
        </label>
        <input
          type="text"
          name="frequency"
          value={data.frequency}
          onChange={handleChange}
          placeholder="z.B. jeden Montag, wöchentlich, bei Bedarf, ..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
        />
        {frequencyError && (
          <p className="text-sm text-red-600 mt-1">Die Häufigkeit ist erforderlich</p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            Tags (mindestens 2) *
          </label>
          <button
            onClick={addTag}
            type="button"
            className="flex items-center gap-1 px-3 py-1 bg-[#00A68B] text-white rounded-lg text-sm hover:bg-[#008B6F]"
          >
            <Plus size={16} /> Tag hinzufügen
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {data.tags.map((tag, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={tag}
                onChange={(e) => updateTag(index, e.target.value)}
                placeholder="z.B. review, blog, content-management..."
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
              />
              {data.tags.length > 2 && (
                <button
                  onClick={() => removeTag(index)}
                  type="button"
                  className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        {tagsError && (
          <p className="text-sm text-red-600 mt-1">
            Du brauchst mindestens 2 Tags
          </p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tipp:</strong> Tags helfen bei der Suche und Kategorisierung.
          Nutze Begriffe wie: "review", "automation", "workflow", "compliance", etc.
        </p>
      </div>
    </div>
  );
}
