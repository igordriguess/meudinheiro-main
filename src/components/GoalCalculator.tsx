import React, { useState } from 'react';
import { MarketRates } from '../types/finance';
import { calculateGoalTimeline, formatBRL } from '../services/simulationEngine';
import { MoneyInput } from './MoneyInput';

interface GoalCalculatorProps {
  rates: MarketRates;
  defaultInitial?: number;
  defaultMonthly?: number;
  defaultTarget?: number;
}

export const GoalCalculator: React.FC<GoalCalculatorProps> = ({
  rates,
  defaultInitial = 20000,
  defaultMonthly = 1000,
  defaultTarget = 100000,
}) => {
  const [initialAmount, setInitialAmount] = useState(defaultInitial);
  const [monthlyContribution, setMonthlyContribution] = useState(defaultMonthly);
  const [targetAmount, setTargetAmount] = useState(defaultTarget);

  const results = calculateGoalTimeline({
    initialAmount,
    monthlyContribution,
    targetAmount,
    rates,
  });

  const fastest = results.find((r) => r.isFastest) || results[0];
  const slowest = results[results.length - 1];
  const monthsSaved = Math.max(0, slowest.monthsToReach - fastest.monthsToReach);

  return (
    <section
      id="objetivo-100k"
      className="bg-[#121418] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-7"
    >
      <div className="space-y-1.5">
        <p className="text-xs font-mono text-[#10B981]">PLANEJADOR DE META</p>
        <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[#F4F5F7] tracking-tight">
          Quero chegar a {formatBRL(targetAmount)}
        </h2>
        <p className="text-sm text-[#9499A3]">
          Veja em quanto tempo você alcança seu objetivo e como a rentabilidade reduz a espera.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MoneyInput
          id="goal-initial"
          label="Tenho hoje:"
          value={initialAmount}
          onChange={setInitialAmount}
          quickAmounts={[5000, 20000, 50000]}
        />
        <MoneyInput
          id="goal-monthly"
          label="Consigo investir por mês:"
          value={monthlyContribution}
          onChange={setMonthlyContribution}
          quickAmounts={[500, 1000, 2000]}
          suffix="/mês"
        />
        <MoneyInput
          id="goal-target"
          label="Objetivo:"
          value={targetAmount}
          onChange={setTargetAmount}
          quickAmounts={[50000, 100000, 500000]}
        />
      </div>

      <div className="p-5 sm:p-6 rounded-xl bg-[#0A0B0D] border border-white/[0.08] space-y-2">
        <p className="text-sm text-[#9499A3]">
          Você pode chegar ao objetivo em aproximadamente:
        </p>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-3xl sm:text-4xl font-mono font-semibold text-[#10B981] tabular-nums">
            {fastest.formattedTime}
          </p>
          <span className="text-xs font-mono text-[#9499A3]">
            Considerando {fastest.name}
          </span>
        </div>
        {monthsSaved > 0 && (
          <p className="text-xs text-[#9499A3] pt-2 border-t border-white/[0.06]">
            Investir em <strong className="text-[#F4F5F7]">{fastest.name}</strong> permite atingir a meta{' '}
            <strong className="text-[#10B981] font-mono">
              {monthsSaved} {monthsSaved === 1 ? 'mês' : 'meses'} antes
            </strong>{' '}
            do que na Poupança.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {results.map((item) => (
          <div
            key={item.product}
            className={`p-4 rounded-xl border flex flex-col justify-between ${
              item.isFastest
                ? 'bg-[#0A0B0D] border-[#10B981]/50'
                : 'bg-[#0A0B0D] border-white/[0.06]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[#F4F5F7]">
                  {item.name}
                </span>
              </div>
              <p className="mt-2 text-xl font-mono font-semibold text-[#F4F5F7] tabular-nums">
                {item.formattedTime}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-1 text-xs text-[#9499A3]">
              <div className="flex justify-between">
                <span>Total desembolsado:</span>
                <span className="font-mono text-[#F4F5F7] tabular-nums">
                  {formatBRL(Math.round(item.totalInvested))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Juros líquidos:</span>
                <span className="font-mono text-[#10B981] tabular-nums">
                  +{formatBRL(Math.round(item.netReturn))}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
