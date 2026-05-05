/**
 * Trigger automatic Vercel deployment after process approval
 * This makes the new process live immediately without manual deploy
 */
export async function triggerVercelDeploy(): Promise<boolean> {
  const vercelToken = process.env.VERCEL_TOKEN;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID;

  // If credentials not set, skip (graceful)
  if (!vercelToken || !vercelProjectId) {
    console.log("⚠️  VERCEL_TOKEN or VERCEL_PROJECT_ID not set - skipping auto-deploy");
    console.log("   Set these in .env to enable automatic deployment");
    return false;
  }

  try {
    console.log("🚀 Triggering Vercel deployment...");

    const response = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "sifo-process-portal",
        ref: "main", // Deploy from main branch
        projectId: vercelProjectId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Vercel API error (${response.status}):`, error);
      return false;
    }

    const data = (await response.json()) as any;
    const deploymentUrl = data.url || data.inspectorUrl;

    console.log("✅ Vercel deployment triggered!");
    console.log(`📍 Deployment URL: ${deploymentUrl}`);

    // Don't wait for deployment to complete - return immediately
    // The deployment will happen in background (~30-60s)
    return true;
  } catch (error) {
    console.error("❌ Error triggering Vercel deployment:", error);
    return false;
  }
}
