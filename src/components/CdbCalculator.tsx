import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { MarketRates } from '../types/finance';
import {
  formatBRL,
  formatMonthsHuman,
  simulateSingleProduct,
} from '../services/simulationEngine';
import { MoneyInput } from './MoneyInput';
import { fitAmount } from '../services/amountFit';
import { PeriodSelector } from './PeriodSelector';

interface CdbCalculatorProps {
  rates: MarketRates;
  defaultAmount?: number;
  defaultMonths?: number;
  defaultPercentCdi?: number;
  onNavigateRoute?: (path: string) => void;
  hideTitle?: boolean;
}

const CDI_PRESETS = [90, 100, 105, 110, 115, 120, 130];
const MIN_PERCENT_CDI = 1;
const MAX_PERCENT_CDI = 300;

const clampPercent = (value: number) =>
  Math.max(MIN_PERCENT_CDI, Math.min(MAX_PERCENT_CDI, Math.round(value)));

export const CdbCalculator: React.FC<CdbCalculatorProps> = ({
  rates,
  defaultAmount = 10000,
  defaultMonths = 12,
  defaultPercentCdi = 100,
  onNavigateRoute,
  hideTitle = false,
}) => {
  const [amount, setAmount] = useState(defaultAmount);
  const [months, setMonths] = useState(defaultMonths);
  const [percentCdi, setPercentCdi] = useState(defaultPercentCdi);
  const [percentDraft, setPercentDraft] = useState(String(defaultPercentCdi));

  useEffect(() => {
    setPercentDraft(String(percentCdi));
  }, [percentCdi]);

  const commitPercentDraft = () => {
    const parsed = Number(percentDraft);
    if (percentDraft === '' || !Number.isFinite(parsed)) {
      setPercentDraft(String(percentCdi));
      return;
    }
    const next = clampPercent(parsed);
    setPercentCdi(next);
    setPercentDraft(String(next));
  };

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
      className="bg-[#121418] border border-white/[0.08] rounded-2xl p-5 sm:p-8 space-y-7"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        {!hideTitle && (
        <div className="space-y-1">
          <p className="text-xs font-mono text-[#10B981]">FERRAMENTA ESPECÍFICA</p>
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[#F4F5F7] tracking-tight">
            Quanto rende um CDB?
          </h2>
          <p className="text-sm text-[#9499A3]">
            Simule diferentes percentuais do CDI e veja o desconto exato do Imposto de Renda.
          </p>
        </div>
        )}

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
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

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-1">
              <label htmlFor="custom-cdi-input" className="text-xs text-[#9499A3] whitespace-nowrap">
                Outro percentual:
              </label>
              <div className="flex items-stretch overflow-hidden rounded-xl bg-[#0A0B0D] border border-white/[0.09] hover:border-white/[0.18] focus-within:border-[#10B981] focus-within:ring-1 focus-within:ring-[#10B981]/30 transition-colors">
                <button
                  type="button"
                  onClick={() => setPercentCdi(clampPercent(percentCdi - 1))}
                  disabled={percentCdi <= MIN_PERCENT_CDI}
                  aria-label="Diminuir 1 ponto percentual"
                  className="min-h-10 min-w-10 flex items-center justify-center text-[#9499A3] hover:text-[#F4F5F7] hover:bg-white/5 disabled:opacity-35 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer border-r border-white/[0.07]"
                >
                  <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <div className="flex items-center gap-1.5 px-3">
                  <input
                    id="custom-cdi-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    value={percentDraft}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      setPercentDraft(digits);
                      const parsed = Number(digits);
                      if (digits !== '' && parsed >= MIN_PERCENT_CDI && parsed <= MAX_PERCENT_CDI) {
                        setPercentCdi(parsed);
                      }
                    }}
                    onBlur={commitPercentDraft}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitPercentDraft();
                      if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setPercentCdi(clampPercent(percentCdi + 1));
                      }
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setPercentCdi(clampPercent(percentCdi - 1));
                      }
                    }}
                    aria-describedby="custom-cdi-hint"
                    className="w-10 bg-transparent text-right text-sm font-mono font-semibold text-[#F4F5F7] tabular-nums focus:outline-none"
                  />
                  <span className="text-xs font-mono text-[#9499A3] whitespace-nowrap">% do CDI</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPercentCdi(clampPercent(percentCdi + 1))}
                  disabled={percentCdi >= MAX_PERCENT_CDI}
                  aria-label="Aumentar 1 ponto percentual"
                  className="min-h-10 min-w-10 flex items-center justify-center text-[#9499A3] hover:text-[#F4F5F7] hover:bg-white/5 disabled:opacity-35 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer border-l border-white/[0.07]"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
              <span id="custom-cdi-hint" className="text-[11px] text-[#646973]">
                De {MIN_PERCENT_CDI}% a {MAX_PERCENT_CDI}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#0A0B0D] border border-white/[0.08] rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-1">
            <span className="text-xs text-[#9499A3]">
              Valor final líquido em {formatMonthsHuman(months)}
            </span>
            <p className={`${fitAmount(formatBRL(Math.round(result.finalAmount)), 'xl')} font-mono font-semibold text-[#10B981] tabular-nums`}>
              {formatBRL(Math.round(result.finalAmount))}
            </p>
          </div>

          <dl className="space-y-2.5 pt-4 border-t border-white/[0.07] text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <dt className="text-[#9499A3]">Valor investido</dt>
              <dd className="ml-auto text-right wrap-anywhere font-mono text-[#F4F5F7] tabular-nums">
                {formatBRL(Math.round(result.totalInvested))}
              </dd>
            </div>

            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <dt className="text-[#9499A3]">Rendimento bruto</dt>
              <dd className="ml-auto text-right wrap-anywhere font-mono text-[#F4F5F7] tabular-nums">
                +{formatBRL(Math.round(result.grossReturn))}
              </dd>
            </div>

            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <dt className="text-[#9499A3]">
                Imposto de Renda ({result.taxRatePercent.toFixed(1).replace('.', ',')}%)
              </dt>
              <dd className="ml-auto text-right wrap-anywhere font-mono text-[#9499A3] tabular-nums">
                -{formatBRL(Math.round(result.taxes))}
              </dd>
            </div>

            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 pt-2 border-t border-white/[0.06] font-semibold">
              <dt className="text-[#F4F5F7]">Rendimento líquido</dt>
              <dd className="ml-auto text-right wrap-anywhere font-mono text-[#10B981] tabular-nums">
                +{formatBRL(Math.round(result.netReturn))}
              </dd>
            </div>
          </dl>

          <div className="pt-3 border-t border-white/[0.06] text-xs text-[#9499A3] flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <span>Diferença para a Poupança no mesmo prazo:</span>
            <span className="ml-auto text-right wrap-anywhere font-mono font-semibold text-[#10B981] tabular-nums">
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
