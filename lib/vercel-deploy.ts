/**
 * Trigger automatic Vercel deployment after process approval
 * This makes the new process live immediately without manual deploy
 */
export async function triggerVercelDeploy(): Promise<boolean> {
  const vercelToken = process.env.VERCEL_TOKEN;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID;

  // Debug logging
  console.log("🔍 Vercel Deploy Check:");
  console.log("   VERCEL_TOKEN exists:", !!vercelToken, "length:", vercelToken?.length);
  console.log("   VERCEL_PROJECT_ID exists:", !!vercelProjectId, "length:", vercelProjectId?.length);
  console.log("   VERCEL_TOKEN value:", vercelToken?.substring(0, 10) + "...");
  console.log("   VERCEL_PROJECT_ID value:", vercelProjectId);

  // If credentials not set, skip (graceful)
  if (!vercelToken || !vercelProjectId) {
    console.log("⚠️  VERCEL_TOKEN or VERCEL_PROJECT_ID not set - skipping auto-deploy");
    console.log("   Set these in .env to enable automatic deployment");
    return false;
  }

  try {
    console.log("🚀 Triggering Vercel deployment via redeploy API...");

    // Use the redeploy endpoint which is simpler for git-based projects
    const response = await fetch(
      `https://api.vercel.com/v13/projects/${vercelProjectId}/redeploy`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Vercel API error (${response.status}):`, error);

      // Fallback: Try the deployments endpoint with proper structure
      console.log("🔄 Trying alternative deployment method...");
      const fallbackResponse = await fetch("https://api.vercel.com/v13/deployments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: vercelProjectId,
          gitSource: {
            ref: "main",
            type: "github",
          },
        }),
      });

      if (!fallbackResponse.ok) {
        const fallbackError = await fallbackResponse.text();
        console.error(`❌ Fallback deployment also failed:`, fallbackError);
        return false;
      }

      const fallbackData = (await fallbackResponse.json()) as any;
      console.log("✅ Vercel deployment triggered via fallback!");
      console.log(`📍 Deployment ID: ${fallbackData.id}`);
      return true;
    }

    const data = (await response.json()) as any;
    console.log("✅ Vercel deployment triggered!");
    console.log(`📍 Deployment ID: ${data.id}`);

    return true;
  } catch (error) {
    console.error("❌ Error triggering Vercel deployment:", error);
    return false;
  }
}
