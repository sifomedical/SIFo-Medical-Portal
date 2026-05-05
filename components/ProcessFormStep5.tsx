"use client";

import { ChangeEvent } from "react";
import { X, Plus } from "lucide-react";
import { ProcessTool } from "@/types/process";

interface Step5Data {
  tools: ProcessTool[];
}

interface ProcessFormStep5Props {
  data: Step5Data;
  onChange: (field: string, value: any) => void;
  onValidate: () => { valid: boolean; errors: string[] };
}

export default function ProcessFormStep5({
  data,
  onChange,
  onValidate,
}: ProcessFormStep5Props) {
  const validation = onValidate();
  const toolsError = validation.errors.find((e) => e.includes("tools"));

  const updateTool = (index: number, field: keyof ProcessTool, value: string) => {
    const newTools = [...data.tools];
    newTools[index] = {
      ...newTools[index],
      [field]: value || undefined,
    };
    onChange("tools", newTools);
  };

  const addTool = () => {
    const newTool: ProcessTool = {
      name: "",
      url: "",
      icon: "🛠️",
    };
    onChange("tools", [...data.tools, newTool]);
  };

  const removeTool = (index: number) => {
    const newTools = data.tools.filter((_, i) => i !== index);
    onChange("tools", newTools);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tools & Systeme (mindestens 1) *
          </label>
          <p className="text-sm text-gray-600">
            Welche Tools oder Systeme werden in diesem Prozess verwendet?
          </p>
        </div>
        <button
          onClick={addTool}
          type="button"
          className="flex items-center gap-1 px-3 py-1 bg-[#00A68B] text-white rounded-lg text-sm hover:bg-[#008B6F]"
        >
          <Plus size={16} /> Tool hinzufügen
        </button>
      </div>

      {toolsError && (
        <p className="text-sm text-red-600">Du brauchst mindestens 1 Tool</p>
      )}

      <div className="space-y-3">
        {data.tools.map((tool, index) => (
          <div key={index} className="border border-gray-300 rounded-lg p-4 bg-white space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tool-Name *
                </label>
                <input
                  type="text"
                  value={tool.name}
                  onChange={(e) => updateTool(index, "name", e.target.value)}
                  placeholder="z.B. Notion, Google Drive, Odoo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon (optional)
                </label>
                <input
                  type="text"
                  value={tool.icon || ""}
                  onChange={(e) => updateTool(index, "icon", e.target.value)}
                  placeholder="z.B. 📋, 🔗, 📊..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL (optional)
              </label>
              <input
                type="url"
                value={tool.url || ""}
                onChange={(e) => updateTool(index, "url", e.target.value)}
                placeholder="z.B. https://notion.so"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
              />
            </div>

            {data.tools.length > 1 && (
              <div className="flex justify-end pt-2 border-t border-gray-200">
                <button
                  onClick={() => removeTool(index)}
                  type="button"
                  className="text-sm text-red-600 hover:underline flex items-center gap-1"
                >
                  <X size={14} /> Entfernen
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tipp:</strong> Du kannst bis zu 10 verschiedene Tools hinzufügen.
          Icons helfen, die Tools visuell zu unterscheiden. URLs sind optional, können aber
          direkte Links zu den Tools bereitstellen.
        </p>
      </div>
    </div>
  );
}
