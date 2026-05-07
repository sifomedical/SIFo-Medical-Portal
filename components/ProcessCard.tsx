'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock, User, Wrench, Trash2 } from "lucide-react";
import { Process, CATEGORIES } from "@/types/process";
import { useState } from "react";

interface Props {
  process: Process;
  userEmail?: string | null;
  adminEmail?: string | null;
}

export default function ProcessCard({ process, userEmail, adminEmail }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const category = CATEGORIES.find((c) => c.id === process.category);

  const isAdmin = userEmail === adminEmail;
  const isCreator = userEmail === process.owner;
  const canDelete = isAdmin || isCreator;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Prozess "${process.title}" archivieren?`)) return;

    setIsDeleting(true);
    try {
      const response = await fetch('/api/processes/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: process.slug, action: 'archive' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to archive');
      }

      alert('✅ Prozess archiviert');
      router.refresh();
    } catch (error) {
      alert('❌ ' + (error instanceof Error ? error.message : 'Error'));
      setIsDeleting(false);
    }
  };

  return (
    <Link
      href={`/${process.category}/${process.slug}`}
      className="group flex flex-col bg-white rounded-xl border border-[#CDD3D8] hover:border-[#9CA6B1] hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Top-Farb-Accent */}
      <div
        className={`h-1.5 w-full ${
          process.category === "marketing"
            ? "bg-violet-500"
            : process.category === "sales"
            ? "bg-emerald-500"
            : process.category === "operations"
            ? "bg-orange-500"
            : process.category === "hr"
            ? "bg-pink-500"
            : process.category === "quality"
            ? "bg-sky-500"
            : "bg-amber-500"
        }`}
      />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl mt-0.5">{category?.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#0C2340] group-hover:text-[#00A68B] transition-colors leading-tight">
              {process.title}
            </h3>
            <p className="text-xs text-[#9CA6B1] mt-0.5">{process.subtitle}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[#6A7A8B] leading-relaxed flex-1 line-clamp-2 mb-4">
          {process.description}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-xs text-[#9CA6B1] mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {process.frequency}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {process.owner}
          </span>
          <span className="flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5" />
            {process.steps.length} Schritte
          </span>
        </div>

        {/* Tools */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {process.tools.slice(0, 3).map((tool) => (
            <span
              key={tool.name}
              className="inline-block text-xs px-2 py-0.5 bg-[#F5F6F7] text-[#6A7A8B] rounded-full"
            >
              {tool.name}
            </span>
          ))}
          {process.tools.length > 3 && (
            <span className="inline-block text-xs px-2 py-0.5 bg-[#F5F6F7] text-[#9CA6B1] rounded-full">
              +{process.tools.length - 3}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F5F6F7]">
          <span className="text-xs text-[#CDD3D8]">
            Aktualisiert: {new Date(process.lastUpdated).toLocaleDateString("de-AT")}
          </span>
          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                title="Prozess archivieren"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <span className="flex items-center gap-1 text-xs font-semibold text-[#00A68B] opacity-0 group-hover:opacity-100 transition-opacity">
              Öffnen <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
