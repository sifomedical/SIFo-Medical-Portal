"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  chart: string;
  className?: string;
}

export default function MermaidDiagram({ chart, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      if (!containerRef.current) return;
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            primaryColor: "#EEF2FF",
            primaryTextColor: "#1e1b4b",
            primaryBorderColor: "#a5b4fc",
            lineColor: "#6366f1",
            secondaryColor: "#f0fdf4",
            tertiaryColor: "#fff7ed",
            background: "#ffffff",
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "14px",
          },
          flowchart: {
            htmlLabels: true,
            curve: "basis",
            padding: 20,
          },
        });

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          // SVG responsiv machen
          const svgEl = containerRef.current.querySelector("svg");
          if (svgEl) {
            svgEl.removeAttribute("height");
            svgEl.setAttribute("width", "100%");
            svgEl.style.maxWidth = "100%";
          }
          setRendered(true);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Mermaid render error:", err);
          setError("Diagramm konnte nicht gerendert werden.");
        }
      }
    };

    render();
    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div
      className={`relative ${className || ""}`}
    >
      {!rendered && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-[#1B3A6B] rounded-full animate-spin" />
            Diagramm wird geladen...
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full overflow-x-auto"
        style={{ minHeight: rendered ? undefined : "200px" }}
      />
    </div>
  );
}
