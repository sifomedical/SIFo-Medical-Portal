import Link from "next/link";
import { ArrowRight, Clock, User, Wrench } from "lucide-react";
import { Process, CATEGORIES } from "@/types/process";

interface Props {
  process: Process;
}

export default function ProcessCard({ process }: Props) {
  const category = CATEGORIES.find((c) => c.id === process.category);

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
          <span className="flex items-center gap-1 text-xs font-semibold text-[#00A68B] opacity-0 group-hover:opacity-100 transition-opacity">
            Öffnen <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
