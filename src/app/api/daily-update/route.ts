import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

interface EntryInput {
  missiles: string;
  drones: string;
  notes: string;
  intensity: number;
}

interface UpdateBody {
  date: string;
  iran: EntryInput;
  israel: EntryInput;
  usa: EntryInput;
}

export async function POST(request: Request) {
  try {
    const body: UpdateBody = await request.json();

    if (!body.date || !body.iran || !body.israel || !body.usa) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: date, iran, israel, usa" },
        { status: 400 }
      );
    }

    const launchesPath = path.join(process.cwd(), "src/data/launches.json");
    const raw = await fs.readFile(launchesPath, "utf-8");
    const data = JSON.parse(raw);

    // Check for duplicate
    const alreadyExists = (data.iran?.entries ?? []).some(
      (e: { date: string }) => e.date === body.date
    );
    if (alreadyExists) {
      return NextResponse.json({
        success: false,
        error: `Data for ${body.date} already exists`,
      });
    }

    // Append entries for each country
    for (const key of ["iran", "israel", "usa"] as const) {
      const entry = body[key];
      data[key].entries.push({
        date: body.date,
        missiles: entry.missiles,
        drones: entry.drones,
        notes: entry.notes,
        intensity: Math.max(0, Math.min(100, entry.intensity)),
      });
    }

    data.lastUpdated = new Date().toISOString();

    await fs.writeFile(launchesPath, JSON.stringify(data, null, 2));

    return NextResponse.json({
      success: true,
      message: `Data for ${body.date} added`,
      lastUpdated: data.lastUpdated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

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
  });
}
