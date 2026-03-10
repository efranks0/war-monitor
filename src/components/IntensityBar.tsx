"use client";

export function IntensityBar({ value, color }: { value: number; color: string }) {
  const barColor =
    value >= 80
      ? "#ef4444"
      : value >= 50
        ? "#f97316"
        : value >= 30
          ? "#eab308"
          : value >= 15
            ? "#22c55e"
            : "#6b7280";

  return (
    <div className="flex items-center gap-2">
      <div className="w-28 h-2.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: barColor }}
        />
      </div>
      <span className="text-xs text-gray-400 w-8">{value}%</span>
    </div>
  );
}
