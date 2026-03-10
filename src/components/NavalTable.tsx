"use client";

import type { NavalDeployment } from "@/data/naval";

const statusStyles = {
  deployed: "bg-green-500/20 text-green-400 border-green-500/30",
  "en-route": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  withdrawn: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const typeIcons: Record<string, string> = {
  "Aircraft Carrier": "🛩️",
  "LHD / Light Carrier": "🚢",
  "FREMM DA Frigate": "🛡️",
  "FREMM Frigate": "⚓",
  "Horizon Frigate": "🛡️",
  "Sachsen-class Frigate": "🛡️",
  "LCF Frigate": "🛡️",
  "F100 Frigate": "🛡️",
  "Hydra-class Frigate": "⚓",
};

export function NavalTable({ data }: { data: NavalDeployment }) {
  // Group by country
  const countries = [...new Set(data.vessels.map((v) => v.country))];
  const countryCount = countries.length;

  return (
    <div className="rounded-2xl bg-gray-900/80 border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-8 rounded-full bg-cyan-500" />
          <h2 className="text-xl font-bold text-white">⚓ {data.title}</h2>
        </div>
        <p className="text-sm text-gray-400 ml-4">{data.subtitle}</p>
      </div>

      {/* Summary pills */}
      <div className="px-6 pb-4 flex flex-wrap gap-3">
        <Pill label="Vessels" value={String(data.totalVessels)} color="#06b6d4" />
        <Pill label="Nations" value={String(countryCount)} color="#06b6d4" />
        <Pill
          label="Carriers"
          value={String(
            data.vessels.filter(
              (v) => v.type.includes("Carrier") || v.type.includes("LHD")
            ).length
          )}
          color="#f59e0b"
        />
        <Pill
          label="Frigates"
          value={String(
            data.vessels.filter(
              (v) => v.type.includes("Frigate")
            ).length
          )}
          color="#8b5cf6"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-gray-800 text-xs uppercase tracking-wider text-gray-500">
              <th className="px-6 py-3 text-left font-medium">Vessel</th>
              <th className="px-6 py-3 text-left font-medium">Type</th>
              <th className="px-6 py-3 text-left font-medium">Role</th>
              <th className="px-6 py-3 text-left font-medium">Arrived</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.vessels.map((vessel) => (
              <tr
                key={vessel.name}
                className="border-t border-gray-800/60 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{vessel.flag}</span>
                    <span className="font-semibold text-white">{vessel.name}</span>
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-sm">{typeIcons[vessel.type] ?? "🚢"}</span>
                    <span className="text-gray-300">{vessel.type}</span>
                  </span>
                </td>
                <td className="px-6 py-3.5 text-gray-400 max-w-xs">{vessel.role}</td>
                <td className="px-6 py-3.5 text-gray-300 whitespace-nowrap">
                  {vessel.arrivedDate}
                </td>
                <td className="px-6 py-3.5">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[vessel.status]}`}
                  >
                    {vessel.status === "deployed"
                      ? "Deployed"
                      : vessel.status === "en-route"
                        ? "En Route"
                        : "Withdrawn"}
                  </span>
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
          <span className="font-semibold text-cyan-400">
            Unprecedented European naval buildup.
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
