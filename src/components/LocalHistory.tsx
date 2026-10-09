import React from 'react';
import { SimulationHistoryItem } from '../types/finance';
import { formatBRL, formatMonthsHuman } from '../services/simulationEngine';
import { Trash2 } from 'lucide-react';

interface LocalHistoryProps {
  items: SimulationHistoryItem[];
  onSelectHistory: (item: SimulationHistoryItem) => void;
  onClearHistory: () => void;
}

function formatDayLabel(timestamp: number): string {
  const now = new Date();
  const itemDate = new Date(timestamp);

  const isSameDay =
    now.getDate() === itemDate.getDate() &&
    now.getMonth() === itemDate.getMonth() &&
    now.getFullYear() === itemDate.getFullYear();

  if (isSameDay) return 'Hoje';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    yesterday.getDate() === itemDate.getDate() &&
    yesterday.getMonth() === itemDate.getMonth() &&
    yesterday.getFullYear() === itemDate.getFullYear();

  if (isYesterday) return 'Ontem';

  return itemDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export const LocalHistory: React.FC<LocalHistoryProps> = ({
  items,
  onSelectHistory,
  onClearHistory,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="bg-[#121418] border border-white/[0.07] rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[#F4F5F7]">
            Últimas simulações
          </h3>
          <p className="text-xs text-[#646973]">
            Salvas apenas neste navegador · Clique para recarregar
          </p>
        </div>

        <button
          type="button"
          onClick={onClearHistory}
          className="min-h-[38px] px-3 py-1.5 rounded-xl text-xs text-[#9499A3] hover:text-[#F4F5F7] hover:bg-white/[0.05] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Apagar histórico</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {items.slice(0, 6).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectHistory(item)}
            className="p-3.5 rounded-xl bg-[#0A0B0D] border border-white/[0.06] hover:border-white/[0.18] text-left transition-colors cursor-pointer flex flex-col justify-between gap-1.5"
          >
            <div className="flex items-center justify-between text-xs text-[#646973]">
              <span>{formatDayLabel(item.timestamp)}</span>
              <span className="font-mono">{formatMonthsHuman(item.months)}</span>
            </div>

            <div className="font-mono text-sm font-medium text-[#F4F5F7] tabular-nums">
              {formatBRL(item.initialAmount)}
              {item.monthlyContribution > 0
                ? ` + ${formatBRL(item.monthlyContribution)}/m`
                : ''}{' '}
              →{' '}
              <span className="text-[#10B981] font-semibold">
                {formatBRL(Math.round(item.bestFinalAmount))}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
