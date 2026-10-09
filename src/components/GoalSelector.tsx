import React from 'react';
import { GoalType } from '../types/finance';

interface GoalSelectorProps {
  value: GoalType;
  onChange: (goal: GoalType) => void;
}

const GOAL_OPTIONS: Array<{
  id: GoalType;
  title: string;
  description: string;
}> = [
  {
    id: 'RENDER',
    title: 'Fazer meu dinheiro render',
    description: 'Ver quanto terei no final do prazo',
  },
  {
    id: 'TARGET_AMOUNT',
    title: 'Chegar a um valor',
    description: 'Saber em quanto tempo atinjo minha meta',
  },
  {
    id: 'MONTHLY_INCOME',
    title: 'Gerar renda mensal',
    description: 'Descobrir quanto preciso para viver de renda',
  },
];

export const GoalSelector: React.FC<GoalSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#9499A3]">
        O que você quer alcançar?
      </span>

      <div
        role="radiogroup"
        aria-label="O que você quer alcançar?"
        className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
      >
        {GOAL_OPTIONS.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(opt.id)}
              className={`min-h-[84px] p-4 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]/50 ${
                isSelected
                  ? 'bg-[#10B981]/[0.09] border-[#10B981] text-[#F4F5F7] shadow-[0_8px_24px_rgba(16,185,129,0.09)]'
                  : 'bg-white/[0.025] border-white/[0.08] text-[#9499A3] hover:bg-white/[0.06] hover:text-[#F4F5F7] hover:border-white/[0.2]'
              }`}
            >
              <span
                className={`text-sm font-semibold leading-snug ${
                  isSelected ? 'text-[#10B981]' : 'text-[#F4F5F7]'
                }`}
              >
                {opt.title}
              </span>
              <span className="text-xs text-[#9499A3] mt-1 leading-relaxed">
                {opt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
