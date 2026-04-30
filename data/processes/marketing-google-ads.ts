import { Process } from "@/types/process";

const googleAds: Process = {
  id: "marketing-google-ads",
  slug: "google-ads",
  title: "Google Ads",
  subtitle: "Kampagnen-Management & Optimierung",
  category: "marketing",
  description:
    "Google Ads ist unser wichtigster bezahlter Kanal für die direkte Kundenakquise. Wir fahren Search-, Display- und YouTube-Kampagnen, um gezielt Medizintechnik-Entscheider anzusprechen.",
  goals: [
    "Qualifizierte Leads über Suchanfragen generieren",
    "Markenbekanntheit in Zielregionen steigern",
    "Produkt-Demos und Webinar-Anmeldungen treiben",
    "ROI messbar optimieren (Ziel: CPA < 80€)",
  ],
  steps: [
    {
      id: "strategie",
      title: "1. Kampagnenstrategie & Keyword-Recherche",
      description:
        "Bevor eine neue Kampagne gestartet wird, definieren wir Ziel, Budget und Keywords.",
      tools: ["Google Keyword Planner", "SEMrush", "Notion"],
      substeps: [
        {
          id: "ziel",
          title: "Kampagnenziel definieren",
          description:
            "Leads, Webinar-Anmeldungen, Demo-Anfragen oder Brand Awareness? Klares Ziel = klares Tracking.",
        },
        {
          id: "keywords",
          title: "Keyword-Recherche",
          description:
            "Hauptkeywords, Long-Tail-Keywords und Negative Keywords definieren. Fokus auf kaufbereite Begriffe.",
          tips: [
            "Competitor-Keywords mittracking",
            "Branded Keywords separat kampagnieren",
          ],
        },
        {
          id: "budget",
          title: "Budget festlegen",
          description:
            "Tagesbudget pro Kampagne festlegen. Regel: Mindestens 10x CPC als Tagesbudget für statistisch relevante Daten.",
        },
      ],
    },
    {
      id: "setup",
      title: "2. Kampagnen-Setup",
      description:
        "Aufsetzen der Kampagnenstruktur in Google Ads: Kampagne > Anzeigengruppen > Anzeigen.",
      tools: ["Google Ads", "Google Analytics 4", "Google Tag Manager"],
      substeps: [
        {
          id: "struktur",
          title: "Kampagnenstruktur aufbauen",
          description:
            "1 Thema = 1 Anzeigengruppe. Max. 3-5 eng verwandte Keywords pro Gruppe.",
        },
        {
          id: "anzeigen",
          title: "Responsive Search Ads erstellen",
          description:
            "Min. 3 Headlines (30 Zeichen), 2 Descriptions (90 Zeichen). USPs prominent: Zertifiziert, Schnelle Lieferung, Persönliche Beratung.",
        },
        {
          id: "tracking",
          title: "Conversion Tracking einrichten",
          description:
            "Google Tag Manager Trigger für: Formular-Submit, Demo-Anfrage, Webinar-Anmeldung.",
        },
      ],
    },
    {
      id: "optimierung",
      title: "3. Laufende Optimierung",
      description:
        "Wöchentliche und monatliche Überprüfung der Kampagnen-Performance.",
      tools: ["Google Ads", "Looker Studio"],
      tips: [
        "Suchbegriff-Report wöchentlich prüfen",
        "Schlechte Keywords als Negative hinzufügen",
        "A/B-Tests laufen lassen",
      ],
      substeps: [
        {
          id: "weekly",
          title: "Wöchentliche Prüfung",
          description:
            "Search Term Report, CTR, CPC, Conversions, Quality Score prüfen. Tagesbudget anpassen wenn nötig.",
        },
        {
          id: "monthly",
          title: "Monatliche Auswertung",
          description:
            "Gesamtperformance-Report erstellen, Budget auf Gewinner-Kampagnen umschichten, neue Experimente planen.",
        },
      ],
    },
  ],
  tools: [
    { name: "Google Ads", url: "https://ads.google.com" },
    { name: "Google Analytics 4", url: "https://analytics.google.com" },
    { name: "Google Tag Manager", url: "https://tagmanager.google.com" },
    { name: "Looker Studio", url: "https://lookerstudio.google.com" },
    { name: "SEMrush", url: "https://semrush.com" },
  ],
  owner: "Simon Foger",
  frequency: "Wöchentliche Optimierung",
  lastUpdated: "2025-01-01",
  tags: ["google-ads", "paid", "ppc", "seo", "leadgen"],
  status: "active",
  mermaidDiagram: `flowchart TD
    A([🎯 Neue Kampagne]) --> B[Ziel definieren]
    B --> C[Keyword-Recherche]
    C --> D[Budget festlegen]
    D --> E[Kampagnenstruktur aufbauen]
    E --> F[Anzeigen erstellen RSA]
    F --> G[Conversion Tracking einrichten]
    G --> H[🚀 Kampagne live schalten]
    H --> I{Wöchentliche Prüfung}
    I --> J[Search Term Report]
    I --> K[CTR & CPC analysieren]
    I --> L[Conversions prüfen]
    J --> M{Optimierung nötig?}
    K --> M
    L --> M
    M -->|Ja| N[Keywords/Budget/Anzeigen anpassen]
    M -->|Nein| O[Weiter beobachten]
    N --> I
    O --> P{Monatliches Review}
    P --> Q[Performance Report]
    Q --> R[Budget umschichten]
    R --> S[Neue Tests planen]
    S --> I

    style A fill:#7C3AED,color:#fff
    style H fill:#1B3A6B,color:#fff
    style M fill:#F59E0B,color:#fff`,
};

export default googleAds;
