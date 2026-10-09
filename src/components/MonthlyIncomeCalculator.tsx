import React, { useEffect, useState } from 'react';
import { MarketRates } from '../types/finance';
import { calculateRequiredForMonthlyIncome, formatBRL, formatPercent } from '../services/simulationEngine';
import { MoneyInput } from './MoneyInput';

interface MonthlyIncomeCalculatorProps {
  rates: MarketRates;
  defaultIncome?: number;
}

export const MonthlyIncomeCalculator: React.FC<MonthlyIncomeCalculatorProps> = ({
  rates,
  defaultIncome = 1000,
}) => {
  const [desiredMonthlyIncome, setDesiredMonthlyIncome] = useState(defaultIncome);

  const results = calculateRequiredForMonthlyIncome({
    desiredMonthlyIncome,
    rates,
  });

  return (
    <>
      <section
        id="renda-mensal"
        className="bg-[#121418] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-7"
      >
      <div className="space-y-1.5">
        <p className="text-xs font-mono text-[#10B981]">SIMULADOR DE RENDA PASSIVA</p>
        <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[#F4F5F7] tracking-tight">
          Quanto preciso investir para gerar {formatBRL(desiredMonthlyIncome)} por mês?
        </h2>
        <p className="text-sm text-[#9499A3]">
          Para gerar aproximadamente esse valor mensal líquido, considerando a taxa atual utilizada na simulação:
        </p>
      </div>

      <div className="max-w-md">
        <MoneyInput
          id="monthly-income-input"
          label="Renda mensal desejada:"
          value={desiredMonthlyIncome}
          onChange={setDesiredMonthlyIncome}
          quickAmounts={[500, 1000, 3000, 5000, 10000]}
          suffix="/mês"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {results.map((item) => (
          <div
            key={item.product}
            className={`p-5 rounded-xl border flex flex-col justify-between ${
              item.isLowestCapital
                ? 'bg-[#0A0B0D] border-[#10B981]/50'
                : 'bg-[#0A0B0D] border-white/[0.07]'
            }`}
          >
            <div className="space-y-2">
              <span className="text-xs text-[#9499A3] block">{item.rateLabel}</span>
              <h3 className="text-base font-semibold text-[#F4F5F7]">{item.name}</h3>
              <div className="pt-2">
                <span className="text-xs text-[#646973] block">Patrimônio necessário:</span>
                <p
                  className={`text-2xl font-mono font-semibold tabular-nums mt-0.5 ${
                    item.isLowestCapital ? 'text-[#10B981]' : 'text-[#F4F5F7]'
                  }`}
                >
                  {formatBRL(Math.round(item.requiredCapital))}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#9499A3]">
              <span>Taxa líquida mensal</span>
              <span className="font-mono text-[#F4F5F7] tabular-nums">
                {formatPercent(item.monthlyNetRatePercent, 2)} a.m.
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#646973] pt-1">
        Os valores são estimativas matemáticas e não representam garantia de rentabilidade futura.
      </p>
      </section>

    </>
  );
};

interface PassiveIncomeByCapitalProps {
  rates: MarketRates;
  defaultCapital: number;
}

export const PassiveIncomeByCapital: React.FC<PassiveIncomeByCapitalProps> = ({
  rates,
  defaultCapital,
}) => {
  const [availableCapital, setAvailableCapital] = useState(defaultCapital);

  useEffect(() => {
    setAvailableCapital(defaultCapital);
  }, [defaultCapital]);

  const results = calculateRequiredForMonthlyIncome({
    desiredMonthlyIncome: 0,
    rates,
  });

  return (
    <section
      id="simule-pelo-patrimonio"
      className="bg-[#121418] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-7"
    >
      <div className="space-y-1.5">
        <p className="text-xs font-mono text-[#38BDF8]">SIMULE PELO PATRIMÔNIO</p>
        <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[#F4F5F7] tracking-tight">
          Quanto o seu patrimônio pode render por mês?
        </h2>
        <p className="text-sm text-[#9499A3]">
          O valor começa com o total da simulação principal. Você pode ajustá-lo para estimar sua renda passiva mensal líquida.
        </p>
      </div>

      <div className="max-w-md">
        <MoneyInput
          id="passive-income-capital-input"
          label="Patrimônio investido:"
          value={availableCapital}
          onChange={setAvailableCapital}
          quickAmounts={[10000, 50000, 100000, 300000, 500000]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {results.map((item) => {
          const estimatedMonthlyIncome = availableCapital * (item.monthlyNetRatePercent / 100);
          return (
            <div
              key={`income-${item.product}`}
              className="p-5 rounded-xl border bg-[#0A0B0D] border-white/[0.07]"
            >
              <span className="text-xs text-[#9499A3] block">{item.rateLabel}</span>
              <h3 className="text-base font-semibold text-[#F4F5F7] mt-2">{item.name}</h3>
              <div className="pt-3">
                <span className="text-xs text-[#646973] block">Renda mensal líquida estimada:</span>
                <p className="text-2xl font-mono font-semibold tabular-nums mt-0.5 text-[#38BDF8]">
                  {formatBRL(Math.round(estimatedMonthlyIncome))}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#9499A3]">
                <span>Taxa líquida mensal</span>
                <span className="font-mono text-[#F4F5F7] tabular-nums">
                  {formatPercent(item.monthlyNetRatePercent, 2)} a.m.
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#646973] pt-1">
        Os valores são estimativas matemáticas e não representam garantia de rentabilidade futura.
      </p>
    </section>
  );
};
