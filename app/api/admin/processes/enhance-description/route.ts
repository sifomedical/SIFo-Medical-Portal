import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Anthropic from "@anthropic-ai/sdk";

/**
 * POST /api/admin/processes/enhance-description
 *
 * Enhances process descriptions using Claude AI
 * Takes a basic title, subtitle, and initial description
 * Returns a more detailed, professional description
 */

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = (await getServerSession()) as any;
    const isDevTest =
      process.env.NODE_ENV === "development" &&
      request.headers.get("x-test-bypass") === "true";

    let isAdmin = false;

    if (isDevTest) {
      isAdmin = true;
    } else if (session?.user?.email) {
      isAdmin = session.user.email === process.env.ADMIN_EMAIL;
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - admin only" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, subtitle, initialDescription, category } = body;

    if (!title || !subtitle) {
      return NextResponse.json(
        { error: "Title and subtitle are required" },
        { status: 400 }
      );
    }

    // Create prompt for Claude to enhance the description
    const enhancementPrompt = `Du bist ein Experte für Business-Prozesse bei einem Medizintechnik-Unternehmen (SIFo Medical).

Basierend auf diesen Informationen:
- **Prozess-Titel:** ${title}
- **Untertitel:** ${subtitle}
- **Kategorie:** ${category || "general"}
- **Initiale Beschreibung:** ${initialDescription || "Noch keine Beschreibung vorhanden"}

Schreibe eine professionelle, detaillierte Prozessbeschreibung (2-3 Sätze) die:
1. Erklärt, was dieser Prozess tut und warum er wichtig ist
2. Die Bedeutung für das Geschäft hervorhebt
3. Relevante Kontexte für das Medizintechnik-Business einbezieht
4. Klar und prägnant ist

Antworte NUR mit der Beschreibung, keine zusätzlichen Erklärungen.`;

    // Call Claude API
    const response = await client.messages.create({
      model: "claude-opus-4-1",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: enhancementPrompt,
        },
      ],
    });

    const enhancedDescription =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json(
      {
        success: true,
        enhancedDescription: enhancedDescription.trim(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error enhancing description:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error enhancing description",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
