"use client";

import { useEffect, useState, useCallback } from "react";

interface FeedItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  snippet: string;
}

interface GdeltArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  domain: string;
}

interface GdeltCategory {
  label: string;
  articles: GdeltArticle[];
}

type Tab = "rss" | "gdelt";

const SOURCE_COLORS: Record<string, string> = {
  "BBC": "#bb1919",
  "NY Times": "#1a1a1a",
  "Al Jazeera": "#fa9b1e",
  "Reuters": "#ff8000",
  "Defense One": "#2563eb",
};

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return "";
  const diff = Math.floor((now - then) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function formatGdeltDate(dateStr: string): string {
  if (!dateStr) return "";
  // GDELT dates look like "20260309T120000Z"
  try {
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    const hour = dateStr.slice(9, 11);
    const min = dateStr.slice(11, 13);
    return timeAgo(new Date(`${year}-${month}-${day}T${hour}:${min}:00Z`).toISOString());
  } catch {
    return dateStr;
  }
}

export function LiveFeed() {
  const [tab, setTab] = useState<Tab>("rss");
  const [rssItems, setRssItems] = useState<FeedItem[]>([]);
  const [gdeltCategories, setGdeltCategories] = useState<GdeltCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<string>("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchRSS = useCallback(async () => {
    try {
      const res = await fetch("/api/feed");
      if (!res.ok) return;
      const data = await res.json();
      setRssItems(data.items ?? []);
      setLastFetched(data.fetchedAt);
    } catch { /* ignore */ }
  }, []);

  const fetchGDELT = useCallback(async () => {
    try {
      const res = await fetch("/api/gdelt");
      if (!res.ok) return;
      const data = await res.json();
      setGdeltCategories(data.categories ?? []);
      setLastFetched(data.fetchedAt);
    } catch { /* ignore */ }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchRSS(), fetchGDELT()]);
    setLoading(false);
  }, [fetchRSS, fetchGDELT]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auto-refresh every 3 minutes
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchAll, 180_000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchAll]);

  return (
    <div className="rounded-2xl bg-gray-900/80 border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full bg-red-500" />
            <h2 className="text-xl font-bold text-white">
              📡 Live Intelligence Feed
            </h2>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`text-xs px-2.5 py-1 rounded-md border cursor-pointer ${
                autoRefresh
                  ? "border-green-600 text-green-400 bg-green-500/10"
                  : "border-gray-700 text-gray-500"
              }`}
            >
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </button>
            <button
              onClick={fetchAll}
              disabled={loading}
              className="text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded-md border border-gray-700 hover:border-gray-500 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? "Fetching..." : "Refresh"}
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-400 ml-4 mt-1">
          Aggregated from OSINT sources · Auto-refreshes every 3 min
          {lastFetched && (
            <span className="ml-2 text-gray-600">
              · Last: {timeAgo(lastFetched)}
            </span>
          )}
        </p>
      </div>

      {/* Tabs */}
      <div className="px-6 pb-3 flex gap-1 bg-gray-900/40 mx-4 p-1 rounded-lg border border-gray-800 w-fit">
        <TabButton active={tab === "rss"} onClick={() => setTab("rss")}>
          📰 News Feeds ({rssItems.length})
        </TabButton>
        <TabButton active={tab === "gdelt"} onClick={() => setTab("gdelt")}>
          🌐 GDELT Events ({gdeltCategories.reduce((s, c) => s + c.articles.length, 0)})
        </TabButton>
      </div>

      {/* Content */}
      <div className="max-h-[600px] overflow-y-auto">
        {loading && rssItems.length === 0 && gdeltCategories.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-pulse">Fetching live data from OSINT sources...</div>
          </div>
        ) : tab === "rss" ? (
          <RSSFeed items={rssItems} />
        ) : (
          <GDELTFeed categories={gdeltCategories} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
        active
          ? "bg-gray-700 text-white"
          : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
      }`}
    >
      {children}
    </button>
  );
}

function RSSFeed({ items }: { items: FeedItem[] }) {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No conflict-related articles found in current RSS feeds.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-800/60">
      {items.map((item, i) => (
        <a
          key={`${item.link}-${i}`}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-6 py-3.5 hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium leading-snug">
                {item.title}
              </p>
              {item.snippet && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {item.snippet}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor:
                    (SOURCE_COLORS[item.source] ?? "#4b5563") + "20",
                  color: SOURCE_COLORS[item.source] ?? "#9ca3af",
                  border: `1px solid ${SOURCE_COLORS[item.source] ?? "#4b5563"}40`,
                }}
              >
                {item.source}
              </span>
              <span className="text-[10px] text-gray-600">
                {timeAgo(item.pubDate)}
              </span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

function GDELTFeed({ categories }: { categories: GdeltCategory[] }) {
  const categoryColors = ["#ef4444", "#3b82f6", "#f59e0b", "#06b6d4"];

  if (categories.every((c) => c.articles.length === 0)) {
    return (
      <div className="p-8 text-center text-gray-500">
        No GDELT events found for current queries.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {categories.map((cat, ci) => {
        if (cat.articles.length === 0) return null;
        const color = categoryColors[ci % categoryColors.length];
        return (
          <div key={cat.label}>
            <div className="flex items-center gap-2 mb-3 px-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <h3 className="text-sm font-semibold text-gray-300">
                {cat.label}
              </h3>
              <span className="text-xs text-gray-600">
                ({cat.articles.length} articles)
              </span>
            </div>
            <div className="space-y-1">
              {cat.articles.slice(0, 8).map((article, ai) => (
                <a
                  key={`${article.url}-${ai}`}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                  <p className="text-sm text-gray-200 leading-snug flex-1 min-w-0">
                    {article.title}
                  </p>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="text-[10px] text-gray-500">
                      {article.domain}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {formatGdeltDate(article.publishedAt)}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
