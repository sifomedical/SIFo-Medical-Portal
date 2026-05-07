"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Process, CATEGORIES } from "@/types/process";
import { searchProcesses } from "@/lib/searchProcesses";

export default function NavbarSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [processes, setProcesses] = useState<Process[]>([]);
  const [results, setResults] = useState<Process[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Prozesse laden wenn Suche erstmalig geöffnet wird
  useEffect(() => {
    if (isOpen && processes.length === 0) {
      fetch("/api/processes")
        .then((r) => r.json())
        .then((data) => setProcesses(data))
        .catch(() => {});
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, processes.length]);

  // Suchergebnisse aktualisieren
  useEffect(() => {
    if (query.trim()) {
      setResults(searchProcesses(query, processes, "all"));
    } else {
      setResults([]);
    }
  }, [query, processes]);

  // Escape-Taste schließt Suche
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Klick außerhalb schließt Suche
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setQuery("");
    } else {
      setIsOpen(true);
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Animiertes Eingabefeld – overflow-hidden NUR hier für die Breitenanimation */}
      <div
        className={`flex items-center transition-all duration-200 ${
          isOpen ? "w-48 sm:w-64 opacity-100" : "w-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA6B1] pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Prozesse suchen..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-[#E5E8EB] bg-[#F5F6F7] text-[#0C2340] placeholder-[#9CA6B1] focus:outline-none focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
          />
        </div>
      </div>

      {/* Lupe / X Toggle-Button */}
      <button
        onClick={handleToggle}
        className="ml-1 flex items-center justify-center w-8 h-8 rounded-full text-[#6A7A8B] hover:text-[#00A68B] hover:bg-[#00A68B]/10 transition-colors flex-shrink-0"
        title={isOpen ? "Suche schließen" : "Suche öffnen"}
      >
        {isOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
      </button>

      {/* Ergebnis-Dropdown – außerhalb von overflow-hidden, direkt im Container */}
      {isOpen && query.trim() && (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E5E8EB] rounded-xl shadow-xl z-[100] max-h-[28rem] overflow-y-auto">
          {results.length > 0 ? (
            <div className="py-1">
              {results.slice(0, 8).map((proc) => {
                const cat = CATEGORIES.find((c) => c.id === proc.category);
                return (
                  <Link
                    key={proc.id}
                    href={`/${proc.category}/${proc.slug}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#F5F6F7] border-b border-[#F5F6F7] last:border-0 transition-colors"
                  >
                    <span className="text-xl flex-shrink-0">{cat?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0C2340] truncate">{proc.title}</p>
                      <p className="text-xs text-[#6A7A8B] truncate mt-0.5">{proc.subtitle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#CDD3D8] flex-shrink-0" />
                  </Link>
                );
              })}
              {results.length > 8 && (
                <p className="text-xs text-[#9CA6B1] text-center py-2.5">
                  +{results.length - 8} weitere Ergebnisse
                </p>
              )}
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-[#6A7A8B]">
                Keine Prozesse für <strong>„{query}"</strong> gefunden
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
