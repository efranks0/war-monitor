import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

interface GdeltArticle {
  title: string;
  url: string;
  source: string;
  seendate: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Fetch GDELT articles for a query
async function fetchGdeltArticles(query: string): Promise<GdeltArticle[]> {
  try {
    const params = new URLSearchParams({
      query: query,
      mode: "ArtList",
      maxrecords: "20",
      format: "json",
      sort: "DateDesc",
      timespan: "3d",
    });
    const res = await fetch(`https://api.gdeltproject.org/api/v2/doc/doc?${params}`);
    if (!res.ok) return [];
    const text = await res.text();
    if (text.startsWith("Please limit")) return []; // rate limited
    const data = JSON.parse(text);
    return (data.articles ?? []).map((a: Record<string, string>) => ({
      title: a.title ?? "",
      url: a.url ?? "",
      source: a.source ?? a.domain ?? "",
      seendate: a.seendate ?? "",
    }));
  } catch {
    return [];
  }
}

// Gather all OSINT articles — sequential with delay to avoid GDELT rate limit
async function gatherOSINT(): Promise<string> {
  const queries = [
    "iran israel missile strike war",
    "iran drone attack military",
    "US CENTCOM iran strike",
    "naval mediterranean deployment warship cyprus",
  ];

  const allArticles: GdeltArticle[][] = [];
  for (const q of queries) {
    const articles = await fetchGdeltArticles(q);
    allArticles.push(articles);
    await sleep(6000); // GDELT requires 5s between requests
  }

  // Flatten, deduplicate by URL
  const seen = new Set<string>();
  const unique: GdeltArticle[] = [];
  for (const batch of allArticles) {
    for (const article of batch) {
      if (!seen.has(article.url)) {
        seen.add(article.url);
        unique.push(article);
      }
    }
  }

  // Format as text for Claude
  return unique
    .slice(0, 80)
    .map((a, i) => `[${i + 1}] ${a.title} (${a.source}, ${a.seendate})\n    ${a.url}`)
    .join("\n\n");
}

// Use Claude to extract structured data from articles
async function extractWithClaude(
  articlesText: string,
  targetDate: string,
  existingLaunches: Record<string, unknown>
): Promise<{ launches: Record<string, unknown>; naval: Record<string, unknown> | null }> {
  const client = new Anthropic();

  const existingDates = Object.values(existingLaunches)
    .filter((v): v is { entries: { date: string }[] } =>
      typeof v === "object" && v !== null && "entries" in v
    )
    .flatMap((country) => country.entries.map((e) => e.date));

  const prompt = `You are an OSINT military analyst. Based on the following news articles from around ${targetDate}, extract estimated daily launch/strike data for the Iran-Israel-USA conflict.

EXISTING DATA already covers these dates: ${[...new Set(existingDates)].join(", ")}
Only provide data for NEW dates not already covered. If no new date data can be extracted, return empty entries.

TARGET DATE: ${targetDate}

ARTICLES:
${articlesText}

Respond with ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "launches": {
    "iran": {
      "date": "${targetDate}",
      "missiles": "~X–Y",
      "drones": "~X–Y",
      "notes": "Brief operational summary",
      "intensity": 0-100
    },
    "israel": {
      "date": "${targetDate}",
      "missiles": "~X–Y",
      "drones": "~X–Y",
      "notes": "Brief operational summary",
      "intensity": 0-100
    },
    "usa": {
      "date": "${targetDate}",
      "missiles": "~X–Y",
      "drones": "~X–Y",
      "notes": "Brief operational summary",
      "intensity": 0-100
    }
  },
  "naval": {
    "newVessels": [],
    "statusChanges": [
      {
        "vesselName": "string",
        "newStatus": "deployed|en-route|withdrawn"
      }
    ]
  },
  "summary": "One-line summary of the day's developments",
  "confidence": "high|medium|low",
  "hasNewData": true
}

IMPORTANT RULES:
- Base estimates on what the articles report or imply. Use ranges (e.g., "~10–30").
- If the conflict appears to be winding down, reflect that with lower numbers and intensity.
- If articles suggest a ceasefire or pause, set missiles/drones to "0" and intensity to 0.
- If there is genuinely no new information for this date, set "hasNewData" to false.
- Intensity should reflect the operational tempo relative to the peak (Day 1-2 = 100).
- For naval changes, only include if articles specifically mention new deployments or withdrawals.
- Be conservative — it's better to slightly underestimate than overestimate.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  // Extract JSON from response (handle potential markdown wrapping)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from Claude response");
  }
  return JSON.parse(jsonMatch[0]);
}

// Format date as "D Mon" (e.g., "10 Mar")
function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export async function POST(request: Request) {
  try {
    // Optional: accept a specific date, otherwise use yesterday
    const body = await request.json().catch(() => ({}));
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const targetDate = body.date || formatDateShort(yesterday.toISOString());

    // Read existing data
    const launchesPath = path.join(process.cwd(), "src/data/launches.json");
    const navalPath = path.join(process.cwd(), "src/data/naval.json");
    const launchesRaw = await fs.readFile(launchesPath, "utf-8");
    const navalRaw = await fs.readFile(navalPath, "utf-8");
    const launchesData = JSON.parse(launchesRaw);
    const navalData = JSON.parse(navalRaw);

    // Check if this date already exists
    const iranEntries = launchesData.iran?.entries ?? [];
    const alreadyExists = iranEntries.some(
      (e: { date: string }) => e.date === targetDate
    );
    if (alreadyExists) {
      return NextResponse.json({
        success: false,
        message: `Data for ${targetDate} already exists`,
        lastUpdated: launchesData.lastUpdated,
      });
    }

    // Gather OSINT articles
    const articlesText = await gatherOSINT();
    if (!articlesText.trim()) {
      return NextResponse.json({
        success: false,
        message: "No OSINT articles found for this date",
      });
    }

    // Extract structured data with Claude
    const extracted = await extractWithClaude(articlesText, targetDate, launchesData);
    const result = extracted as Record<string, unknown>;
    const hasNewData = (result as { hasNewData?: boolean }).hasNewData;

    if (!hasNewData) {
      return NextResponse.json({
        success: false,
        message: `No new conflict data found for ${targetDate}`,
        confidence: (result as { confidence?: string }).confidence,
      });
    }

    // Append launch entries
    const launches = (result as { launches?: Record<string, { date: string; missiles: string; drones: string; notes: string; intensity: number }> }).launches;
    if (launches) {
      for (const country of ["iran", "israel", "usa"] as const) {
        const entry = launches[country];
        if (entry && launchesData[country]) {
          launchesData[country].entries.push({
            date: entry.date,
            missiles: entry.missiles,
            drones: entry.drones,
            notes: entry.notes,
            intensity: entry.intensity,
          });
        }
      }

      // Update metadata
      const totalDays = launchesData.iran.entries.length;
      launchesData.iran.durationTracked = `${totalDays} days`;
      launchesData.israel.durationTracked = `${totalDays} days`;
      launchesData.usa.durationTracked = `${totalDays} days`;
      launchesData.lastUpdated = new Date().toISOString();
    }

    // Handle naval changes
    const naval = (result as { naval?: { newVessels?: Array<Record<string, string>>; statusChanges?: Array<{ vesselName: string; newStatus: string }> } }).naval;
    if (naval) {
      // Add new vessels
      if (naval.newVessels && naval.newVessels.length > 0) {
        navalData.vessels.push(...naval.newVessels);
        navalData.totalVessels = navalData.vessels.length;
        const nations = new Set(navalData.vessels.map((v: { country: string }) => v.country));
        navalData.nations = nations.size;
      }
      // Apply status changes
      if (naval.statusChanges && naval.statusChanges.length > 0) {
        for (const change of naval.statusChanges) {
          const vessel = navalData.vessels.find(
            (v: { name: string }) => v.name.includes(change.vesselName)
          );
          if (vessel) {
            vessel.status = change.newStatus;
          }
        }
      }
      navalData.lastUpdated = new Date().toISOString();
    }

    // Write updated data
    await fs.writeFile(launchesPath, JSON.stringify(launchesData, null, 2));
    await fs.writeFile(navalPath, JSON.stringify(navalData, null, 2));

    return NextResponse.json({
      success: true,
      message: `Data for ${targetDate} added successfully`,
      date: targetDate,
      confidence: (result as { confidence?: string }).confidence,
      summary: (result as { summary?: string }).summary,
      articlesAnalyzed: articlesText.split("\n\n").length,
      lastUpdated: launchesData.lastUpdated,
    });
  } catch (error) {
    console.error("Daily update error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// GET returns the last update status
export async function GET() {
  const launchesPath = path.join(process.cwd(), "src/data/launches.json");
  const raw = await fs.readFile(launchesPath, "utf-8");
  const data = JSON.parse(raw);

  const iranEntries = data.iran?.entries ?? [];
  const lastEntry = iranEntries[iranEntries.length - 1];

  return NextResponse.json({
    lastUpdated: data.lastUpdated,
    lastDate: lastEntry?.date ?? "unknown",
    totalDays: iranEntries.length,
    countries: ["iran", "israel", "usa"],
  });
}
