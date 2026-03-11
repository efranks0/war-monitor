"use client";

import { useState } from "react";

interface CountryInput {
  missiles: string;
  drones: string;
  notes: string;
  intensity: string;
}

const emptyCountry: CountryInput = { missiles: "", drones: "", notes: "", intensity: "" };

const countries = [
  { key: "iran", label: "Iran", flag: "\u{1F1EE}\u{1F1F7}", color: "#ef4444" },
  { key: "israel", label: "Israel", flag: "\u{1F1EE}\u{1F1F1}", color: "#3b82f6" },
  { key: "usa", label: "USA", flag: "\u{1F1FA}\u{1F1F8}", color: "#f59e0b" },
] as const;

export function AddDayForm({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [iran, setIran] = useState<CountryInput>({ ...emptyCountry });
  const [israel, setIsrael] = useState<CountryInput>({ ...emptyCountry });
  const [usa, setUsa] = useState<CountryInput>({ ...emptyCountry });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const stateMap = { iran, israel, usa };
  const setterMap = { iran: setIran, israel: setIsrael, usa: setUsa };

  const handleSubmit = async () => {
    if (!date.trim()) {
      setResult("Date is required (e.g. '10 Mar')");
      return;
    }
    setSubmitting(true);
    setResult(null);

    try {
      const body = {
        date: date.trim(),
        iran: { ...iran, intensity: parseInt(iran.intensity) || 0 },
        israel: { ...israel, intensity: parseInt(israel.intensity) || 0 },
        usa: { ...usa, intensity: parseInt(usa.intensity) || 0 },
      };

      const res = await fetch("/api/daily-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        setResult(`Added ${date}`);
        setDate("");
        setIran({ ...emptyCountry });
        setIsrael({ ...emptyCountry });
        setUsa({ ...emptyCountry });
        onAdded();
      } else {
        setResult(data.error || "Failed to add");
      }
    } catch (err) {
      setResult(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
        >
          + Add day
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl bg-gray-900/80 border border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Add daily data</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-gray-500 hover:text-gray-300 text-sm cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Date */}
      <div className="mb-4">
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
          Date (e.g. &quot;11 Mar&quot;)
        </label>
        <input
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-48 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-gray-500"
          placeholder="11 Mar"
        />
      </div>

      {/* Country rows */}
      <div className="space-y-4">
        {countries.map((c) => {
          const state = stateMap[c.key];
          const setter = setterMap[c.key];
          return (
            <div key={c.key} className="rounded-xl bg-gray-800/60 border border-gray-700/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-1 h-5 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span className="text-sm font-medium text-white">
                  {c.flag} {c.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field
                  label="Missiles"
                  placeholder="~10–20"
                  value={state.missiles}
                  onChange={(v) => setter({ ...state, missiles: v })}
                />
                <Field
                  label="Drones"
                  placeholder="~5–15"
                  value={state.drones}
                  onChange={(v) => setter({ ...state, drones: v })}
                />
                <Field
                  label="Intensity (0-100)"
                  placeholder="50"
                  value={state.intensity}
                  onChange={(v) => setter({ ...state, intensity: v })}
                />
                <Field
                  label="Notes"
                  placeholder="Brief summary"
                  value={state.notes}
                  onChange={(v) => setter({ ...state, notes: v })}
                  wide
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            submitting
              ? "bg-gray-700 text-gray-500 cursor-wait"
              : "bg-emerald-600 text-white hover:bg-emerald-500"
          }`}
        >
          {submitting ? "Saving..." : "Save day"}
        </button>
        {result && (
          <span className="text-sm text-gray-400">{result}</span>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  wide,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2 sm:col-span-4" : ""}>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-gray-500"
      />
    </div>
  );
}
