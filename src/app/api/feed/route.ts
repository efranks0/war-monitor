import { NextResponse } from "next/server";
import RSSParser from "rss-parser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface FeedItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  snippet: string;
}

const RSS_FEEDS = [
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml", name: "NY Times" },
  { url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml", name: "BBC" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", name: "Al Jazeera" },
  { url: "https://feeds.reuters.com/Reuters/worldNews", name: "Reuters" },
  { url: "https://rss.app/feeds/v1.1/ts5ZmG00gDhBnKam.xml", name: "Defense One" },
];

const CONFLICT_KEYWORDS = [
  "iran", "israel", "idf", "irgc", "tehran", "tel aviv", "jerusalem",
  "hezbollah", "missile", "drone", "strike", "attack", "military",
  "pentagon", "centcom", "naval", "carrier", "warship", "mediterranean",
  "cyprus", "gulf", "nuclear", "ballistic", "cruise missile", "air defense",
  "retaliation", "escalation", "ceasefire", "conflict", "war",
  "bomb", "raid", "airstrike", "casualties", "sanctions",
  "usa iran", "us military", "middle east", "strait of hormuz",
];

function isRelevant(title: string, snippet: string): boolean {
  const text = `${title} ${snippet}`.toLowerCase();
  return CONFLICT_KEYWORDS.some((kw) => text.includes(kw));
}

export async function GET() {
  const parser = new RSSParser();
  const allItems: FeedItem[] = [];

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        return (parsed.items ?? []).map((item) => ({
          title: item.title ?? "",
          link: item.link ?? "",
          source: feed.name,
          pubDate: item.pubDate ?? item.isoDate ?? "",
          snippet: item.contentSnippet?.slice(0, 200) ?? "",
        }));
      } catch {
        return [];
      }
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    }
  }

  // Filter for conflict-relevant items
  const relevant = allItems
    .filter((item) => isRelevant(item.title, item.snippet))
    .sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime() || 0;
      const dateB = new Date(b.pubDate).getTime() || 0;
      return dateB - dateA;
    })
    .slice(0, 50);

  return NextResponse.json({
    items: relevant,
    fetchedAt: new Date().toISOString(),
    totalSources: RSS_FEEDS.length,
  });
}
