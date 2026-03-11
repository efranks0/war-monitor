import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const filePath = path.join(process.cwd(), "src/data/launches.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(raw);
  return NextResponse.json(data);
}
