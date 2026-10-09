import React from 'react';

interface PeriodSelectorProps {
  valueMonths: number;
  onChange: (months: number) => void;
  label?: string;
}

const PERIOD_OPTIONS = [
  { label: '3 meses', months: 3 },
  { label: '6 meses', months: 6 },
  { label: '1 ano', months: 12 },
  { label: '2 anos', months: 24 },
  { label: '5 anos', months: 60 },
  { label: '10 anos', months: 120 },
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  valueMonths,
  onChange,
  label = 'Por quanto tempo?',
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9499A3]">
          {label}
        </span>
        <span className="rounded-full border border-[#10B981]/25 bg-[#10B981]/[0.08] px-2.5 py-1 text-xs font-mono font-semibold text-[#10B981] tabular-nums">
          {valueMonths} {valueMonths === 1 ? 'mês' : 'meses'}
        </span>
      </div>

      <div
        role="group"
        aria-label={label}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2"
      >
        {PERIOD_OPTIONS.map((option) => {
          const isSelected = valueMonths === option.months;
          return (
            <button
              key={option.months}
              type="button"
              onClick={() => onChange(option.months)}
              aria-pressed={isSelected}
              className={`min-h-[46px] px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]/50 ${
                isSelected
                  ? 'bg-[#10B981] text-[#05100B] border-[#10B981] font-semibold shadow-[0_8px_24px_rgba(16,185,129,0.16)]'
                  : 'bg-white/[0.025] text-[#9499A3] border-white/[0.08] hover:bg-white/[0.06] hover:text-[#F4F5F7] hover:border-white/[0.2]'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
