"use client";

import { useState, useEffect, useCallback } from "react";
import type { LaunchesResponse, CountryData } from "@/data/launches";
import type { NavalDeployment } from "@/data/naval";
import { LaunchTable } from "@/components/LaunchTable";
import { NavalTable } from "@/components/NavalTable";
import { LiveFeed } from "@/components/LiveFeed";

const tabs = [
  { key: "iran", label: "\u{1F1EE}\u{1F1F7} Iran", idx: 0 },
  { key: "israel", label: "\u{1F1EE}\u{1F1F1} Israel", idx: 1 },
  { key: "usa", label: "\u{1F1FA}\u{1F1F8} United States", idx: 2 },
] as const;

const countryKeys = ["iran", "israel", "usa"] as const;

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [launches, setLaunches] = useState<LaunchesResponse | null>(null);
  const [naval, setNaval] = useState<NavalDeployment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [launchRes, navalRes] = await Promise.all([
        fetch("/api/launches"),
        fetch("/api/naval"),
      ]);
      const launchData = await launchRes.json();
      const navalData = await navalRes.json();

      // Compute dynamic fields
      for (const key of countryKeys) {
        const country = launchData[key];
        if (country?.entries) {
          country.durationTracked = `${country.entries.length} days`;
        }
      }

      setLaunches(launchData);
      setNaval(navalData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const triggerUpdate = async () => {
    setUpdating(true);
    setUpdateResult(null);
    try {
      const res = await fetch("/api/daily-update", { method: "POST" });
      const result = await res.json();
      if (result.success) {
        setUpdateResult(`Added ${result.date} (${result.confidence} confidence). ${result.summary}`);
        // Refresh data
        await fetchData();
      } else {
        setUpdateResult(result.message || "No new data available");
      }
    } catch (err) {
      setUpdateResult(`Update failed: ${String(err)}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8 text-center">
        <div className="text-gray-400 animate-pulse">Loading intelligence data...</div>
      </main>
    );
  }

  const allCountries: CountryData[] = launches
    ? [launches.iran, launches.israel, launches.usa]
    : [];
  const activeData = allCountries[activeTab];

  // Compute totals dynamically
  const computeTotals = () => {
    if (!launches) return { missiles: "N/A", drones: "N/A" };
    let totalMissilesLow = 0;
    let totalMissilesHigh = 0;
    let totalDronesLow = 0;
    let totalDronesHigh = 0;

    for (const key of countryKeys) {
      const entries = launches[key]?.entries ?? [];
      for (const e of entries) {
        const mMatch = e.missiles.match(/~?(\d+)[–-](\d+)/);
        const dMatch = e.drones.match(/~?(\d+)[–-](\d+)/);
        if (mMatch) {
          totalMissilesLow += parseInt(mMatch[1]);
          totalMissilesHigh += parseInt(mMatch[2]);
        }
        if (dMatch) {
          totalDronesLow += parseInt(dMatch[1]);
          totalDronesHigh += parseInt(dMatch[2]);
        }
      }
    }

    const fmtK = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
    return {
      missiles: `~${fmtK(totalMissilesLow)}–${fmtK(totalMissilesHigh)}+`,
      drones: `~${fmtK(totalDronesLow)}–${fmtK(totalDronesHigh)}+`,
    };
  };

  const totals = computeTotals();
  const lastUpdated = launches?.lastUpdated
    ? new Date(launches.lastUpdated).toLocaleString()
    : "Unknown";

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          War Monitor
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Iran-Israel-USA Conflict · Feb-Mar 2026 · Approximate daily launch data
        </p>
        <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
          <span>
            Est. total missiles:{" "}
            <span className="text-orange-400 font-semibold">{totals.missiles}</span>
          </span>
          <span className="text-gray-700">|</span>
          <span>
            Est. total drones:{" "}
            <span className="text-blue-400 font-semibold">{totals.drones}</span>
          </span>
        </div>
      </div>

      {/* Daily update controls */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={triggerUpdate}
          disabled={updating}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
            updating
              ? "bg-gray-800 border-gray-700 text-gray-500 cursor-wait"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
          }`}
        >
          {updating ? "Fetching OSINT & analyzing..." : "Fetch latest day"}
        </button>
        <span className="text-xs text-gray-600">
          Last updated: {lastUpdated}
        </span>
      </div>

      {/* Update result banner */}
      {updateResult && (
        <div className="mb-6 mx-auto max-w-2xl px-4 py-3 rounded-lg bg-gray-800/80 border border-gray-700 text-sm text-gray-300 text-center">
          {updateResult}
          <button
            onClick={() => setUpdateResult(null)}
            className="ml-3 text-gray-500 hover:text-gray-300 cursor-pointer"
          >
            x
          </button>
        </div>
      )}

      {/* Country tabs */}
      <div className="flex gap-1 mb-6 bg-gray-900/60 p-1 rounded-xl border border-gray-800 w-fit mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.idx)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === tab.idx
                ? "bg-gray-700 text-white shadow-lg"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active table */}
      {activeData && <LaunchTable data={activeData} />}

      {/* Live intelligence feed */}
      <div className="mt-10">
        <LiveFeed />
      </div>

      {/* Naval section */}
      {naval && (
        <div className="mt-10">
          <NavalTable data={naval} />
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-gray-600 mt-8">
        Data based on publicly reported estimates from OSINT sources · Not official figures ·
        For informational purposes only
      </p>
    </main>
  );
}
