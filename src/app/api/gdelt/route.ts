import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface GdeltArticle {
  title: string;
  url: string;
  source: string;
  imageUrl: string;
  publishedAt: string;
  domain: string;
}

interface GdeltEvent {
  count: number;
  date: string;
}

// GDELT DOC 2.0 API — free, no key needed
const GDELT_QUERIES = [
  { query: "iran israel missile attack", label: "Iran-Israel Strikes" },
  { query: "iran drone attack military", label: "Iranian Drone Attacks" },
  { query: "US military iran strike CENTCOM", label: "US Military Operations" },
  { query: "naval mediterranean cyprus warship", label: "Naval Deployments" },
];

async function fetchGdeltArticles(query: string): Promise<GdeltArticle[]> {
  try {
    const params = new URLSearchParams({
      query: query,
      mode: "ArtList",
      maxrecords: "15",
      format: "json",
      sort: "DateDesc",
      timespan: "14d",
    });
    const res = await fetch(
      `https://api.gdeltproject.org/api/v2/doc/doc?${params}`,
      { next: { revalidate: 300 } } // cache 5 min
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles ?? []).map((a: Record<string, string>) => ({
      title: a.title ?? "",
      url: a.url ?? "",
      source: a.source ?? "",
      imageUrl: a.socialimage ?? "",
      publishedAt: a.seendate ?? "",
      domain: a.domain ?? "",
    }));
  } catch {
    return [];
  }
}

async function fetchGdeltTimeline(query: string): Promise<GdeltEvent[]> {
  try {
    const params = new URLSearchParams({
      query: query,
      mode: "TimelineVol",
      format: "json",
      timespan: "14d",
    });
    const res = await fetch(
      `https://api.gdeltproject.org/api/v2/doc/doc?${params}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const series = data.timeline?.[0]?.data ?? [];
    return series.map((d: { date: string; value: number }) => ({
      date: d.date,
      count: d.value,
    }));
  } catch {
    return [];
  }
}

export async function GET() {
  const [articles, timeline] = await Promise.all([
    // Fetch articles from all queries
    Promise.all(
      GDELT_QUERIES.map(async (q) => ({
        label: q.label,
        articles: await fetchGdeltArticles(q.query),
      }))
    ),
    // Get volume timeline for main query
    fetchGdeltTimeline("iran israel usa military conflict"),
  ]);

  // Deduplicate articles by URL across all categories
  const seenUrls = new Set<string>();
  const dedupedCategories = articles.map((cat) => ({
    label: cat.label,
    articles: cat.articles.filter((a) => {
      if (seenUrls.has(a.url)) return false;
      seenUrls.add(a.url);
      return true;
    }),
  }));

  return NextResponse.json({
    categories: dedupedCategories,
    timeline,
    fetchedAt: new Date().toISOString(),
  });
}
