import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Minus, Trophy } from 'lucide-react';
import { InvestmentProductType, MarketRates } from '../types/finance';
import {
  formatBRL,
  formatMonthsHuman,
  simulateSingleProduct,
} from '../services/simulationEngine';
import { MoneyInput } from './MoneyInput';
import { PeriodSelector } from './PeriodSelector';

interface ComparisonCardProps {
  rates: MarketRates;
  defaultProductA?: InvestmentProductType;
  defaultProductB?: InvestmentProductType;
  defaultAmount?: number;
  defaultMonths?: number;
  onNavigateRoute?: (path: string) => void;
}

const PRODUCT_OPTIONS: Array<{ id: InvestmentProductType; label: string }> = [
  { id: 'CDB', label: 'CDB (100% CDI)' },
  { id: 'POUPANCA', label: 'Poupança' },
  { id: 'TESOURO_SELIC', label: 'Tesouro Selic' },
  { id: 'LCI_LCA', label: 'LCI / LCA (90% CDI)' },
];

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  rates,
  defaultProductA = 'CDB',
  defaultProductB = 'POUPANCA',
  defaultAmount = 10000,
  defaultMonths = 12,
  onNavigateRoute,
}) => {
  const [productA, setProductA] = useState<InvestmentProductType>(defaultProductA);
  const [productB, setProductB] = useState<InvestmentProductType>(defaultProductB);
  const [amount, setAmount] = useState(defaultAmount);
  const [months, setMonths] = useState(defaultMonths);
  const [openSelector, setOpenSelector] = useState<'A' | 'B' | null>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProductA(defaultProductA);
    setProductB(defaultProductB);
  }, [defaultProductA, defaultProductB]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!selectorRef.current?.contains(event.target as Node)) {
        setOpenSelector(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenSelector(null);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const simA = simulateSingleProduct({
    product: productA,
    initialAmount: amount,
    monthlyContribution: 0,
    months,
    rates,
  });

  const simB = simulateSingleProduct({
    product: productB,
    initialAmount: amount,
    monthlyContribution: 0,
    months,
    rates,
  });

  const diff = Math.abs(simA.finalAmount - simB.finalAmount);
  const winner = simA.finalAmount >= simB.finalAmount ? simA : simB;
  const isTie = Math.round(diff) === 0;

  return (
    <section
      id="comparacao-direta"
      className="bg-[#121418] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-7 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-mono text-[#10B981]">COMPARAÇÃO LADO A LADO</p>
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[#F4F5F7] tracking-tight">
            {simA.name} ou {simB.name}?
          </h2>
          <p className="text-sm text-[#9499A3]">
            Escolha duas alternativas e compare a diferença líquida exata em reais.
          </p>
        </div>

        {onNavigateRoute && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#9499A3]">
            <button
              type="button"
              onClick={() => onNavigateRoute('/cdb-ou-poupanca')}
              className="hover:text-[#10B981] underline cursor-pointer"
            >
              CDB x Poupança
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onNavigateRoute('/cdb-ou-tesouro-selic')}
              className="hover:text-[#10B981] underline cursor-pointer"
            >
              CDB x Tesouro
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onNavigateRoute('/lci-ou-cdb')}
              className="hover:text-[#10B981] underline cursor-pointer"
            >
              LCI x CDB
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onNavigateRoute('/tesouro-selic-ou-poupanca')}
              className="hover:text-[#10B981] underline cursor-pointer"
            >
              Tesouro x Poupança
            </button>
          </div>
        )}
      </div>

      <div ref={selectorRef} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2.5">
          <label
            htmlFor="compare-select-a"
            className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#9499A3]"
          >
            Opção 1
          </label>
          <div className="relative">
            <button
              id="compare-select-a"
              type="button"
              aria-haspopup="listbox"
              aria-expanded={openSelector === 'A'}
              onClick={() => setOpenSelector(openSelector === 'A' ? null : 'A')}
              className="flex w-full min-h-[54px] items-center justify-between rounded-xl border border-[#10B981]/35 bg-[#0A0B0D] px-4 text-left text-sm font-semibold text-[#F4F5F7] shadow-inner shadow-black/20 outline-none transition-colors hover:border-[#10B981]/60 focus-visible:border-[#10B981] focus-visible:ring-2 focus-visible:ring-[#10B981]/20 cursor-pointer"
            >
              {PRODUCT_OPTIONS.find((opt) => opt.id === productA)?.label}
              <ChevronDown className={`h-4 w-4 text-[#10B981] transition-transform ${openSelector === 'A' ? 'rotate-180' : ''}`} />
            </button>
            {openSelector === 'A' && (
              <div
                role="listbox"
                aria-label="Opção 1"
                className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-[#10B981]/35 bg-[#15191A] p-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.5)]"
              >
                {PRODUCT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={productA === opt.id}
                    onClick={() => {
                      setProductA(opt.id);
                      setOpenSelector(null);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition-colors ${
                      productA === opt.id
                        ? 'bg-[#10B981]/[0.12] text-[#10B981]'
                        : 'text-[#F4F5F7] hover:bg-white/[0.07]'
                    }`}
                  >
                    {opt.label}
                    {productA === opt.id && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2.5">
          <label
            htmlFor="compare-select-b"
            className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#9499A3]"
          >
            Opção 2
          </label>
          <div className="relative">
            <button
              id="compare-select-b"
              type="button"
              aria-haspopup="listbox"
              aria-expanded={openSelector === 'B'}
              onClick={() => setOpenSelector(openSelector === 'B' ? null : 'B')}
              className="flex w-full min-h-[54px] items-center justify-between rounded-xl border border-[#38BDF8]/30 bg-[#0A0B0D] px-4 text-left text-sm font-semibold text-[#F4F5F7] shadow-inner shadow-black/20 outline-none transition-colors hover:border-[#38BDF8]/60 focus-visible:border-[#38BDF8] focus-visible:ring-2 focus-visible:ring-[#38BDF8]/20 cursor-pointer"
            >
              {PRODUCT_OPTIONS.find((opt) => opt.id === productB)?.label}
              <ChevronDown className={`h-4 w-4 text-[#38BDF8] transition-transform ${openSelector === 'B' ? 'rotate-180' : ''}`} />
            </button>
            {openSelector === 'B' && (
              <div
                role="listbox"
                aria-label="Opção 2"
                className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-[#38BDF8]/30 bg-[#15191A] p-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.5)]"
              >
                {PRODUCT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={productB === opt.id}
                    onClick={() => {
                      setProductB(opt.id);
                      setOpenSelector(null);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition-colors ${
                      productB === opt.id
                        ? 'bg-[#38BDF8]/[0.12] text-[#38BDF8]'
                        : 'text-[#F4F5F7] hover:bg-white/[0.07]'
                    }`}
                  >
                    {opt.label}
                    {productB === opt.id && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <MoneyInput
          id="compare-amount"
          label="Valor para comparar:"
          value={amount}
          onChange={setAmount}
          quickAmounts={[1000, 10000, 50000, 100000]}
        />
        <PeriodSelector
          label="Prazo da comparação:"
          valueMonths={months}
          onChange={setMonths}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[simA, simB].map((sim, index) => {
          const isHigher =
            !isTie && sim.finalAmount === Math.max(simA.finalAmount, simB.finalAmount);
          return (
            <div
              key={`${sim.product}-${index}`}
              className={`p-5 rounded-xl border space-y-4 ${
                isHigher
                  ? 'bg-[#0A0B0D] border-[#10B981]/60'
                  : 'bg-[#0A0B0D] border-white/[0.07]'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="flex items-center gap-2 text-base font-semibold text-[#F4F5F7]">
                  {isHigher ? <Trophy className="h-4 w-4 text-[#10B981]" /> : <Minus className="h-4 w-4 text-[#646973]" />}
                  {sim.name}
                </h3>
                <span className="text-xs font-mono text-[#9499A3] tabular-nums">
                  {sim.rateLabel}
                </span>
              </div>

              <div>
                <span className="text-xs text-[#9499A3] block">
                  Valor final líquido em {formatMonthsHuman(months)}:
                </span>
                <p
                  className={`text-2xl sm:text-3xl font-mono font-semibold tabular-nums mt-1 ${
                    isHigher ? 'text-[#10B981]' : 'text-[#F4F5F7]'
                  }`}
                >
                  {formatBRL(Math.round(sim.finalAmount))}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#9499A3]">Rendimento líquido:</span>
                  <span className="font-mono text-[#10B981] tabular-nums">
                    +{formatBRL(Math.round(sim.netReturn))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9499A3]">Imposto descontado:</span>
                  <span className="font-mono text-[#9499A3] tabular-nums">
                    {sim.isTaxExempt ? 'Isento' : `-${formatBRL(Math.round(sim.taxes))}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-[#0A0B0D] border border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-sm text-[#9499A3]">
          Diferença líquida ao final de {formatMonthsHuman(months)}:
        </span>
        <span className="text-lg font-mono font-semibold text-[#10B981] tabular-nums">
          {isTie
            ? 'R$ 0 (Mesma opção selecionada)'
            : `+${formatBRL(Math.round(diff))} a mais em ${winner.name}`}
        </span>
      </div>
    </section>
  );
};
