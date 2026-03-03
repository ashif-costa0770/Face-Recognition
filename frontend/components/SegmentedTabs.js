"use client";

export default function SegmentedTabs({ value, onChange, options }) {
  return (
    <div className="inline-flex w-full rounded-2xl border border-slate-200 bg-slate-100/70 p-1 shadow-inner">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`h-11 flex-1 rounded-xl px-4 text-sm font-semibold transition-all duration-300 ${
              isActive
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
