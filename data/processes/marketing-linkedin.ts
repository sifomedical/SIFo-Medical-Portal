import { Process } from "@/types/process";

const linkedin: Process = {
  id: "marketing-linkedin",
  slug: "linkedin",
  title: "LinkedIn Marketing",
  subtitle: "Firmenseite & Persönliche Marke Simon Foger",
  category: "marketing",
  description:
    "LinkedIn ist unser wichtigster organischer B2B-Kanal. Wir bespielen zwei Profile: die SIFo Medical Unternehmensseite für Brand Awareness und Simon Foger persönlich als Experte und Gesicht der Marke.",
  goals: [
    "Simon Foger als Medizintechnik-Experte positionieren",
    "Reichweite und Follower der Unternehmensseite steigern",
    "Leads über direkte Anfragen generieren",
    "Webinare und Events bewerben",
  ],
  steps: [
    {
      id: "redaktionsplan",
      title: "1. Redaktionsplan",
      description: "Wöchentlicher Plan für alle LinkedIn-Aktivitäten.",
      tools: ["Notion", "Buffer/Hootsuite"],
      substeps: [
        {
          id: "themen",
          title: "Themen auswählen",
          description:
            "Mix aus: Fachthemen (40%), Unternehmens-News (20%), persönliche Insights Simon (30%), Webinar-Promo (10%).",
        },
        {
          id: "posting-frequenz",
          title: "Posting-Frequenz",
          description:
            "Firmenseite: 3x/Woche. Simon persönlich: 3–5x/Woche. Best times: Di–Do 8–10 Uhr.",
        },
      ],
    },
    {
      id: "content-formate",
      title: "2. Content-Formate",
      description: "Wir nutzen verschiedene Formate je nach Ziel.",
      tools: ["Canva", "CapCut", "Notion"],
      substeps: [
        {
          id: "text-posts",
          title: "Text-Posts (Hook + Wert)",
          description:
            "Starker erster Satz (Hook), 3–5 Absätze mit echtem Mehrwert, CTA am Ende. Max. 1.300 Zeichen für 'Mehr anzeigen'.",
          tips: [
            "Hook = Frage, provokante These oder Zahl",
            "Emojis sparsam einsetzen",
          ],
        },
        {
          id: "karussell",
          title: "Karussell-Posts",
          description:
            "PDF-Upload mit 5–10 Slides. Ideal für Step-by-Step-Guides und Checklisten. Hohes Engagement.",
        },
        {
          id: "video",
          title: "Video & Reels",
          description:
            "Kurze Videos (60–90 Sek). Untertitel immer aktivieren. Native Upload bevorzugen.",
        },
      ],
    },
    {
      id: "engagement",
      title: "3. Engagement & Community",
      description:
        "Aktives Kommentieren und Vernetzen ist genauso wichtig wie eigene Posts.",
      tools: ["LinkedIn"],
      tips: [
        "Innerhalb 1h nach Posting auf Kommentare antworten",
        "Täglich 5–10 relevante Posts kommentieren",
      ],
    },
  ],
  tools: [
    { name: "LinkedIn Unternehmensseite", url: "https://linkedin.com/company/sifo-medical" },
    { name: "LinkedIn Profil Simon", url: "https://linkedin.com/in/simonfoger" },
    { name: "Canva", url: "https://canva.com" },
    { name: "Buffer", url: "https://buffer.com" },
  ],
  owner: "Simon Foger",
  frequency: "Täglich",
  lastUpdated: "2025-01-01",
  tags: ["linkedin", "social-media", "content", "personal-brand"],
  status: "active",
  mermaidDiagram: `flowchart LR
    A([📅 Wöchentliche Planung]) --> B{Welche Inhalte?}
    B --> B1[Fachthemen 40%]
    B --> B2[Unternehmens-News 20%]
    B --> B3[Simon persönlich 30%]
    B --> B4[Webinar-Promo 10%]
    B1 & B2 & B3 & B4 --> C[Content erstellen]
    C --> D{Format wählen}
    D --> D1[📝 Text-Post]
    D --> D2[📊 Karussell]
    D --> D3[🎥 Video]
    D1 & D2 & D3 --> E[Zeitplan mit Buffer]
    E --> F1[💼 Firmenseite 3x/Woche]
    E --> F2[👤 Simon persönlich 3-5x/Woche]
    F1 & F2 --> G[📊 Engagement monitoren]
    G --> H[Kommentare beantworten]
    H --> I([🔄 Nächste Woche planen])

    style A fill:#7C3AED,color:#fff
    style I fill:#059669,color:#fff`,
};

export default linkedin;
