"use client";

import { Process } from "@/types/process";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";

const MermaidDiagram = dynamic(() => import("@/components/MermaidDiagram"), {
  ssr: false,
  loading: () => <div className="p-4 bg-gray-100 rounded-lg text-center">Laden...</div>,
});

interface ProcessFormPreviewProps {
  process: Process;
}

export default function ProcessFormPreview({ process }: ProcessFormPreviewProps) {
  const [copiedJson, setCopiedJson] = useState(false);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(process, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Mermaid Diagramm</h3>
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <MermaidDiagram chart={process.mermaidDiagram} />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">📄 JSON Preview</h3>
          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1 px-3 py-1 bg-[#00A68B] text-white rounded-lg text-sm hover:bg-[#008B6F]"
          >
            {copiedJson ? (
              <>
                <Check size={16} /> Kopiert!
              </>
            ) : (
              <>
                <Copy size={16} /> JSON kopieren
              </>
            )}
          </button>
        </div>

        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
          <pre className="text-xs text-gray-700 font-mono">
            {JSON.stringify(process, null, 2)}
          </pre>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-2">✅ Prozess-Informationen</h4>
        <dl className="space-y-2 text-sm text-green-800">
          <div className="flex justify-between">
            <dt>ID:</dt>
            <dd className="font-mono">{process.id}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Slug:</dt>
            <dd className="font-mono">{process.slug}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Kategorie:</dt>
            <dd>{process.category}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Schritte:</dt>
            <dd>{process.steps.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Tools:</dt>
            <dd>{process.tools.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Tags:</dt>
            <dd>{process.tags.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Status:</dt>
            <dd className="capitalize">{process.status}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
