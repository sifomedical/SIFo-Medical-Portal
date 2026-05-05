"use client";

import { ChangeEvent } from "react";

const CATEGORIES = ["marketing", "sales", "operations", "hr", "quality", "finance"];

interface Step1Data {
  title: string;
  subtitle: string;
  category: string;
}

interface ProcessFormStep1Props {
  data: Step1Data;
  onChange: (field: keyof Step1Data, value: string) => void;
  onValidate: () => { valid: boolean; errors: string[] };
}

export default function ProcessFormStep1({
  data,
  onChange,
  onValidate,
}: ProcessFormStep1Props) {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onChange(name as keyof Step1Data, value);
  };

  const validation = onValidate();
  const isTitleValid = Boolean(data.title && data.title.trim());
  const isSubtitleValid = Boolean(data.subtitle && data.subtitle.trim());
  const isCategoryValid = Boolean(data.category);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Prozess-Titel * {isTitleValid && <span className="text-green-600">✓</span>}
        </label>
        <input
          type="text"
          name="title"
          value={data.title}
          onChange={handleChange}
          placeholder="z.B. Freigabe von Blogposts in Notion"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent ${
            !isTitleValid && !validation.valid ? "border-red-400 bg-red-50" : "border-gray-300"
          }`}
        />
        {!isTitleValid && !validation.valid && (
          <p className="text-sm text-red-600 mt-1">⚠️ Der Titel ist erforderlich</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Kurzer Untertitel (1-3 Worte) * {isSubtitleValid && <span className="text-green-600">✓</span>}
        </label>
        <input
          type="text"
          name="subtitle"
          value={data.subtitle}
          onChange={handleChange}
          placeholder="z.B. Review und Genehmigung"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent ${
            !isSubtitleValid && !validation.valid ? "border-red-400 bg-red-50" : "border-gray-300"
          }`}
        />
        {!isSubtitleValid && !validation.valid && (
          <p className="text-sm text-red-600 mt-1">⚠️ Der Untertitel ist erforderlich</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Kategorie * {isCategoryValid && <span className="text-green-600">✓</span>}
        </label>
        <select
          name="category"
          value={data.category}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent ${
            !isCategoryValid && !validation.valid ? "border-red-400 bg-red-50" : "border-gray-300"
          }`}
        >
          <option value="">-- Bitte wählen --</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        {!isCategoryValid && !validation.valid && (
          <p className="text-sm text-red-600 mt-1">⚠️ Die Kategorie ist erforderlich</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tipp:</strong> Wähle eine Kategorie, die am besten beschreibt,
          zu welchem Bereich dieser Prozess gehört.
        </p>
      </div>
    </div>
  );
}
