"use client";

import type { CountryData } from "@/data/launches";
import { IntensityBar } from "./IntensityBar";

export function LaunchTable({ data }: { data: CountryData }) {
  return (
    <div className="rounded-2xl bg-gray-900/80 border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-1 h-8 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <h2 className="text-xl font-bold text-white">
            {data.flag} Approximate Daily Launch Pattern
          </h2>
        </div>
        <p className="text-sm text-gray-400 ml-4">{data.subtitle}</p>
      </div>

      {/* Summary pills */}
      <div className="px-6 pb-4 flex flex-wrap gap-3">
        <Pill label="Peak missiles" value={data.peakMissiles} color={data.color} />
        <Pill label="Peak drones" value={data.peakDrones} color={data.color} />
        <Pill label="Duration tracked" value={data.durationTracked} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-gray-800 text-xs uppercase tracking-wider text-gray-500">
              <th className="px-6 py-3 text-left font-medium">Date</th>
              <th className="px-6 py-3 text-left font-medium">Ballistic Missiles</th>
              <th className="px-6 py-3 text-left font-medium">Drones</th>
              <th className="px-6 py-3 text-left font-medium">Notes</th>
              <th className="px-6 py-3 text-left font-medium">Intensity</th>
            </tr>
          </thead>
          <tbody>
            {data.entries.map((entry, i) => (
              <tr
                key={entry.date}
                className="border-t border-gray-800/60 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">
                  {entry.date}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-base">🚀</span>
                    <span className="text-orange-300 font-medium">{entry.missiles}</span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-base">✈️</span>
                    <span className="text-blue-300 font-medium">{entry.drones}</span>
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300 max-w-xs">{entry.notes}</td>
                <td className="px-6 py-4">
                  <IntensityBar value={entry.intensity} color={data.color} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary note */}
      <div className="m-4 p-4 rounded-xl bg-gray-800/60 border border-gray-700/50 flex items-start gap-3">
        <span className="text-lg mt-0.5">📋</span>
        <p className="text-sm text-gray-300 leading-relaxed">
          <span className="font-semibold" style={{ color: data.color }}>
            {data.country === "Iran"
              ? "Rapid degradation observed."
              : data.country === "Israel"
                ? "Sustained high-tempo operations."
                : "Decisive opening strikes."}
          </span>{" "}
          {data.summaryNote}
        </p>
      </div>
    </div>
  );
}

function Pill({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold" style={{ color: color ?? "#e5e7eb" }}>
        {value}
      </span>
    </span>
  );
}
