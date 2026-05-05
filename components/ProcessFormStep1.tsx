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

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Prozess-Titel *
        </label>
        <input
          type="text"
          name="title"
          value={data.title}
          onChange={handleChange}
          placeholder="z.B. Freigabe von Blogposts in Notion"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
        />
        {!data.title && validation.errors.includes('"title" is required') && (
          <p className="text-sm text-red-600 mt-1">Der Titel ist erforderlich</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Kurzer Untertitel (1-3 Worte) *
        </label>
        <input
          type="text"
          name="subtitle"
          value={data.subtitle}
          onChange={handleChange}
          placeholder="z.B. Review und Genehmigung"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
        />
        {!data.subtitle && validation.errors.includes('"subtitle" is required') && (
          <p className="text-sm text-red-600 mt-1">Der Untertitel ist erforderlich</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Kategorie *
        </label>
        <select
          name="category"
          value={data.category}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
        >
          <option value="">-- Bitte wählen --</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        {!data.category && validation.errors.some((e) => e.includes("category")) && (
          <p className="text-sm text-red-600 mt-1">Die Kategorie ist erforderlich</p>
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
