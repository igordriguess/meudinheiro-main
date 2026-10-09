import React, { useState, useEffect } from 'react';
import { MarketRates } from '../types/finance';
import {
  formatBRL,
  formatMonthsHuman,
  simulateSingleProduct,
} from '../services/simulationEngine';
import { MoneyInput } from './MoneyInput';
import { PeriodSelector } from './PeriodSelector';

interface CdbCalculatorProps {
  rates: MarketRates;
  defaultAmount?: number;
  defaultMonths?: number;
  defaultPercentCdi?: number;
  onNavigateRoute?: (path: string) => void;
}

const CDI_PRESETS = [90, 100, 105, 110, 115, 120, 130];

export const CdbCalculator: React.FC<CdbCalculatorProps> = ({
  rates,
  defaultAmount = 10000,
  defaultMonths = 12,
  defaultPercentCdi = 100,
  onNavigateRoute,
}) => {
  const [amount, setAmount] = useState(defaultAmount);
  const [months, setMonths] = useState(defaultMonths);
  const [percentCdi, setPercentCdi] = useState(defaultPercentCdi);

  useEffect(() => {
    setPercentCdi(defaultPercentCdi);
  }, [defaultPercentCdi]);

  const result = simulateSingleProduct({
    product: 'CDB',
    initialAmount: amount,
    monthlyContribution: 0,
    months,
    rates,
    cdbPercentCdi: percentCdi,
  });

  const poupancaComparison = simulateSingleProduct({
    product: 'POUPANCA',
    initialAmount: amount,
    monthlyContribution: 0,
    months,
    rates,
  });

  const extraOverPoupanca = result.finalAmount - poupancaComparison.finalAmount;

  return (
    <section
      id="simulador-cdb"
      className="bg-[#121418] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-7"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-mono text-[#10B981]">FERRAMENTA ESPECÍFICA</p>
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[#F4F5F7] tracking-tight">
            Quanto rende um CDB?
          </h2>
          <p className="text-sm text-[#9499A3]">
            Simule diferentes percentuais do CDI e veja o desconto exato do Imposto de Renda.
          </p>
        </div>

        {onNavigateRoute && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#9499A3]">
            <span>Atalhos:</span>
            <button
              type="button"
              onClick={() => onNavigateRoute('/cdb-100-cdi')}
              className="hover:text-[#10B981] underline cursor-pointer"
            >
              CDB 100%
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onNavigateRoute('/cdb-110-cdi')}
              className="hover:text-[#10B981] underline cursor-pointer"
            >
              CDB 110%
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onNavigateRoute('/cdb-120-cdi')}
              className="hover:text-[#10B981] underline cursor-pointer"
            >
              CDB 120%
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <MoneyInput
            id="cdb-amount"
            label="Valor a investir:"
            value={amount}
            onChange={setAmount}
            quickAmounts={[5000, 10000, 50000, 100000]}
          />

          <PeriodSelector
            label="Prazo do CDB:"
            valueMonths={months}
            onChange={setMonths}
          />

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="custom-cdi-input"
                className="text-sm font-medium text-[#F4F5F7]"
              >
                Rentabilidade (% do CDI):
              </label>
              <span className="text-xs font-mono text-[#10B981] tabular-nums">
                Equivale a {result.annualRateEffective.toFixed(2).replace('.', ',')}% a.a.
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {CDI_PRESETS.map((pct) => {
                const isSelected = percentCdi === pct;
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setPercentCdi(pct)}
                    className={`min-h-[40px] py-2 px-2 rounded-xl text-xs font-mono font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#10B981] text-[#05100B] border-[#10B981] font-semibold'
                        : 'bg-[#0A0B0D] text-[#9499A3] border-white/[0.08] hover:text-[#F4F5F7]'
                    }`}
                  >
                    {pct}%
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-[#9499A3] whitespace-nowrap">
                Outro percentual:
              </span>
              <div className="flex items-center bg-[#0A0B0D] border border-white/[0.09] rounded-xl px-3 py-1.5 w-32">
                <input
                  id="custom-cdi-input"
                  type="number"
                  min={50}
                  max={250}
                  step={1}
                  value={percentCdi}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isFinite(v)) setPercentCdi(Math.max(1, Math.min(300, v)));
                  }}
                  className="w-full bg-transparent text-sm font-mono font-semibold text-[#F4F5F7] tabular-nums focus:outline-none"
                />
                <span className="text-xs font-mono text-[#9499A3]">% CDI</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0A0B0D] border border-white/[0.08] rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-1">
            <span className="text-xs text-[#9499A3]">
              Valor final líquido em {formatMonthsHuman(months)}
            </span>
            <p className="text-3xl sm:text-4xl font-mono font-semibold text-[#10B981] tabular-nums">
              {formatBRL(Math.round(result.finalAmount))}
            </p>
          </div>

          <dl className="space-y-2.5 pt-4 border-t border-white/[0.07] text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-[#9499A3]">Valor investido</dt>
              <dd className="font-mono text-[#F4F5F7] tabular-nums">
                {formatBRL(Math.round(result.totalInvested))}
              </dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-[#9499A3]">Rendimento bruto</dt>
              <dd className="font-mono text-[#F4F5F7] tabular-nums">
                +{formatBRL(Math.round(result.grossReturn))}
              </dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-[#9499A3]">
                Imposto de Renda ({result.taxRatePercent.toFixed(1).replace('.', ',')}%)
              </dt>
              <dd className="font-mono text-[#9499A3] tabular-nums">
                -{formatBRL(Math.round(result.taxes))}
              </dd>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] font-semibold">
              <dt className="text-[#F4F5F7]">Rendimento líquido</dt>
              <dd className="font-mono text-[#10B981] tabular-nums">
                +{formatBRL(Math.round(result.netReturn))}
              </dd>
            </div>
          </dl>

          <div className="pt-3 border-t border-white/[0.06] text-xs text-[#9499A3] flex items-center justify-between">
            <span>Diferença para a Poupança no mesmo prazo:</span>
            <span className="font-mono font-semibold text-[#10B981] tabular-nums">
              {extraOverPoupanca >= 0
                ? `+${formatBRL(Math.round(extraOverPoupanca))}`
                : formatBRL(Math.round(extraOverPoupanca))}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
