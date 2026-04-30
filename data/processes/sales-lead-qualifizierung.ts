import { Process } from "@/types/process";

const leadQualifizierung: Process = {
  id: "sales-lead-qualifizierung",
  slug: "lead-qualifizierung",
  title: "Lead-Qualifizierung",
  subtitle: "Vom Kontakt zum qualifizierten Interessenten",
  category: "sales",
  description:
    "Nicht jeder Kontakt ist ein Kunde. Dieser Prozess beschreibt, wie wir eingehende Leads systematisch bewerten, priorisieren und den richtigen nächsten Schritt einleiten.",
  goals: [
    "Zeitressourcen auf Hochpotenzial-Leads fokussieren",
    "Schnelle erste Kontaktaufnahme sicherstellen (< 2h bei Hot Leads)",
    "Lead-Daten vollständig im CRM erfassen",
    "Conversion Rate von Lead zu Opportunity verbessern",
  ],
  steps: [
    {
      id: "eingang",
      title: "1. Lead-Eingang erfassen",
      description:
        "Jeder neue Lead – egal über welchen Kanal – wird sofort im CRM erfasst.",
      tools: ["HubSpot", "Zapier"],
      substeps: [
        {
          id: "quelle",
          title: "Quelle identifizieren",
          description:
            "Website-Formular, Webinar, LinkedIn, Google Ads, Messe, Empfehlung? UTM-Parameter prüfen.",
        },
        {
          id: "crm-anlegen",
          title: "Kontakt im CRM anlegen",
          description:
            "Name, Unternehmen, Position, E-Mail, Telefon, Quelle, Datum. Automatisch via Zapier oder manuell.",
        },
      ],
    },
    {
      id: "bewertung",
      title: "2. Lead-Bewertung (BANT)",
      description:
        "Wir bewerten jeden Lead nach dem BANT-Framework: Budget, Authority, Need, Timeline.",
      tools: ["HubSpot"],
      tips: [
        "Im ersten Gespräch gezielt BANT-Fragen stellen",
        "Kein Budget ≠ kein Lead – vielleicht nächstes Quartal",
      ],
      substeps: [
        {
          id: "bant-budget",
          title: "Budget",
          description: "Hat das Unternehmen ein Budget? In welcher Größenordnung?",
        },
        {
          id: "bant-authority",
          title: "Authority (Entscheidungsträger)",
          description:
            "Sprich ich mit dem Entscheider? Wer trifft die finale Kaufentscheidung?",
        },
        {
          id: "bant-need",
          title: "Bedarf",
          description: "Welches konkretes Problem soll gelöst werden? Wie dringend?",
        },
        {
          id: "bant-timeline",
          title: "Zeitrahmen",
          description: "Wann soll die Lösung stehen? Gibt es einen internen Deadline?",
        },
      ],
    },
    {
      id: "priorisierung",
      title: "3. Priorisierung & nächste Schritte",
      description: "Lead wird in Hot / Warm / Cold kategorisiert.",
      tools: ["HubSpot"],
      substeps: [
        {
          id: "hot",
          title: "🔥 Hot Lead",
          description:
            "BANT > 75% erfüllt. Sofortige Kontaktaufnahme < 2h, Demo-Termin vereinbaren.",
        },
        {
          id: "warm",
          title: "🌡️ Warm Lead",
          description:
            "BANT 40–75% erfüllt. Nurturing-Sequence starten, in 1–2 Wochen nachfassen.",
        },
        {
          id: "cold",
          title: "❄️ Cold Lead",
          description:
            "BANT < 40% erfüllt. In langfristige Newsletter-Liste aufnehmen, in 3 Monaten erneut prüfen.",
        },
      ],
    },
  ],
  tools: [
    { name: "HubSpot CRM", url: "https://hubspot.com" },
    { name: "Zapier", url: "https://zapier.com" },
    { name: "Calendly", url: "https://calendly.com" },
  ],
  owner: "Sales Team",
  frequency: "Bei jedem neuen Lead",
  lastUpdated: "2025-01-01",
  tags: ["sales", "lead", "crm", "bant", "qualifizierung"],
  status: "active",
  mermaidDiagram: `flowchart TD
    A([📥 Neuer Lead]) --> B[Quelle identifizieren]
    B --> C[Im CRM anlegen]
    C --> D{BANT-Bewertung}
    D --> D1[Budget?]
    D --> D2[Entscheider?]
    D --> D3[Bedarf?]
    D --> D4[Zeitrahmen?]
    D1 & D2 & D3 & D4 --> E{Score berechnen}
    E -->|> 75%| F[🔥 Hot Lead]
    E -->|40–75%| G[🌡️ Warm Lead]
    E -->|< 40%| H[❄️ Cold Lead]
    F --> F1[Kontakt < 2h]
    F1 --> F2[Demo-Termin vereinbaren]
    G --> G1[Nurturing-Sequence starten]
    G1 --> G2[In 1-2 Wochen nachfassen]
    H --> H1[Newsletter-Liste]
    H1 --> H2[In 3 Monaten re-evaluieren]
    F2 & G2 --> I([🎯 Opportunity im CRM])

    style A fill:#059669,color:#fff
    style I fill:#1B3A6B,color:#fff
    style F fill:#EF4444,color:#fff
    style G fill:#F59E0B,color:#fff
    style H fill:#6B7280,color:#fff`,
};

export default leadQualifizierung;
