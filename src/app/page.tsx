"use client";

import { useState } from "react";
import { allCountries } from "@/data/launches";
import { cyprusNavalData } from "@/data/naval";
import { LaunchTable } from "@/components/LaunchTable";
import { NavalTable } from "@/components/NavalTable";
import { LiveFeed } from "@/components/LiveFeed";

const tabs = [
  { key: "iran", label: "🇮🇷 Iran", idx: 0 },
  { key: "israel", label: "🇮🇱 Israel", idx: 1 },
  { key: "usa", label: "🇺🇸 United States", idx: 2 },
] as const;

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const activeData = allCountries[activeTab];

  // Compute total estimates across all countries
  const totalMissiles = "~4,000–6,500+";
  const totalDrones = "~3,500–5,500+";

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          ⚔️ War Monitor
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Iran–Israel–USA Conflict · Feb–Mar 2026 · Approximate daily launch data
        </p>
        <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
          <span>
            Est. total missiles:{" "}
            <span className="text-orange-400 font-semibold">{totalMissiles}</span>
          </span>
          <span className="text-gray-700">|</span>
          <span>
            Est. total drones:{" "}
            <span className="text-blue-400 font-semibold">{totalDrones}</span>
          </span>
        </div>
      </div>

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
      <LaunchTable data={activeData} />

      {/* Live intelligence feed */}
      <div className="mt-10">
        <LiveFeed />
      </div>

      {/* Naval section */}
      <div className="mt-10">
        <NavalTable data={cyprusNavalData} />
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-600 mt-8">
        Data based on publicly reported estimates from OSINT sources · Not official figures ·
        For informational purposes only
      </p>
    </main>
  );
}
