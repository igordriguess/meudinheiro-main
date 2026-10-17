import React, { useEffect, useState } from 'react';
import {
  FullSimulationResult,
  GoalReachProductResult,
  GoalType,
  MonthlyIncomeProductResult,
} from '../types/finance';
import {
  formatBRL,
  formatMonthsHuman,
  formatPercent,
  MAX_GOAL_MONTHS,
} from '../services/simulationEngine';
import { fitAmount } from '../services/amountFit';
import { describeRatesStatus } from '../services/ratesStatus';
import { Share2, Check } from 'lucide-react';

interface StatItemProps {
  label: string;
  value: string;
  strong?: boolean;
  highlight?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, strong = false, highlight = false }) => (
  <div>
    <span className="block text-xs text-[#9499A3]">{label}</span>
    <span
      className={`mt-1 block wrap-anywhere text-base sm:text-lg font-mono tabular-nums ${
        strong ? 'font-semibold' : 'font-medium'
      } ${highlight ? 'text-[#10B981]' : 'text-[#F4F5F7]'}`}
    >
      {value}
    </span>
  </div>
);

interface ProductOptionsProps {
  title: string;
  linkLabel: string;
  linkPath: string;
  onNavigate: (path: string) => void;
  items: Array<{
    key: string;
    name: string;
    value: string;
    valueIsText?: boolean;
    detail?: string;
    secondary?: string;
    isBest: boolean;
  }>;
}

const ProductOptions: React.FC<ProductOptionsProps> = ({
  title,
  linkLabel,
  linkPath,
  onNavigate,
  items,
}) => (
  <div className="pt-5 border-t border-white/7 space-y-3">
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9499A3]">{title}</h3>
      <a
        href={linkPath}
        onClick={(e) => {
          e.preventDefault();
          onNavigate(linkPath);
        }}
        className="text-xs font-medium text-[#10B981] hover:underline whitespace-nowrap"
      >
        {linkLabel}
      </a>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <div
          key={item.key}
          className={`min-w-0 p-4 rounded-xl border ${
            item.isBest ? 'bg-[#10B981]/6 border-[#10B981]/50' : 'bg-[#0A0B0D] border-white/7'
          }`}
        >
          <span className="block text-sm font-semibold text-[#F4F5F7]">{item.name}</span>
          <span
            className={`mt-1 block wrap-anywhere text-base sm:text-lg font-semibold tabular-nums ${
              item.valueIsText ? '' : 'font-mono'
            } ${item.isBest ? 'text-[#10B981]' : 'text-[#F4F5F7]'}`}
          >
            {item.value}
          </span>
          {item.detail && <span className="mt-0.5 block text-xs text-[#646973]">{item.detail}</span>}
          {item.secondary && (
            <span className="mt-2 block border-t border-white/6 pt-2 text-xs text-[#9499A3]">
              {item.secondary}
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
);

interface SimulationResultProps {
  simulation: FullSimulationResult;
  goalType: GoalType;
  goalTimelineResults: GoalReachProductResult[];
  incomeGoalTimeline: GoalReachProductResult[];
  targetAmount: number;
  monthlyIncomeResults: MonthlyIncomeProductResult[];
  desiredMonthlyIncome: number;
  highlightKey: number;
  onOpenShareModal: () => void;
  onNavigate: (path: string) => void;
}

export const SimulationResult: React.FC<SimulationResultProps> = ({
  simulation,
  goalType,
  goalTimelineResults,
  incomeGoalTimeline,
  targetAmount,
  monthlyIncomeResults,
  desiredMonthlyIncome,
  highlightKey,
  onOpenShareModal,
  onNavigate,
}) => {
  const { bestProduct, worstProduct, maxDifference, months, ratesUsed } = simulation;
  const [animatedValue, setAnimatedValue] = useState(bestProduct.finalAmount);
  const [copiedQuick, setCopiedQuick] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setAnimatedValue(bestProduct.finalAmount);
      return;
    }

    const startVal = animatedValue;
    const endVal = bestProduct.finalAmount;
    const duration = 260;
    const startTime = performance.now();

    let rafId: number;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(startVal + (endVal - startVal) * eased);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [bestProduct.finalAmount, highlightKey]);

  const fastestGoal = goalTimelineResults.find((g) => g.isFastest) || goalTimelineResults[0];
  const incomeFastest = incomeGoalTimeline.find((g) => g.isFastest) || incomeGoalTimeline[0];
  const incomeTimeByProduct = Object.fromEntries(
    incomeGoalTimeline.filter((g) => g.monthsToReach > 0).map((g) => [g.product, g.formattedTime])
  ) as Partial<Record<string, string>>;
  const lowestIncomeCap =
    monthlyIncomeResults.find((m) => m.isLowestCapital) || monthlyIncomeResults[0];

  const handleQuickCopyLink = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('inicial', String(simulation.initialAmount));
    url.searchParams.set('mensal', String(simulation.monthlyContribution));
    url.searchParams.set('meses', String(simulation.months));
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopiedQuick(true);
      setTimeout(() => setCopiedQuick(false), 2000);
    } catch {
      onOpenShareModal();
    }
  };

  return (
    <section
      aria-live="polite"
      className="bg-[#121418] border border-white/9 rounded-2xl p-6 sm:p-8 space-y-7"
    >
      {goalType === 'RENDER' && (
        <>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-[#9499A3]">
                Seu dinheiro pode chegar a:
              </p>
              <span className="text-xs font-mono text-[#9499A3] tabular-nums">
                Maior valor líquido ({bestProduct.name})
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 className={`${fitAmount(formatBRL(Math.round(bestProduct.finalAmount)), 'hero')} font-mono font-semibold tracking-tight text-[#10B981] tabular-nums`}>
                {formatBRL(Math.round(animatedValue))}
              </h2>
              <span className="text-base sm:text-lg font-medium text-[#9499A3]">
                em {formatMonthsHuman(months)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 pt-5 border-t border-white/7">
            <StatItem label="Valor inicial" value={formatBRL(simulation.initialAmount)} />
            <StatItem label="Aportes no período" value={formatBRL(bestProduct.totalContributions)} />
            <StatItem label="Total que você colocou" value={formatBRL(bestProduct.totalInvested)} strong />
            <StatItem
              label="Rendimento bruto"
              value={`+${formatBRL(Math.round(bestProduct.grossReturn))}`}
            />
            <div>
              <span className="block text-xs text-[#9499A3]">
                {bestProduct.isTaxExempt
                  ? 'Imposto de Renda'
                  : `Imposto de Renda (${bestProduct.taxRatePercent.toFixed(1).replace('.', ',')}%)`}
                {bestProduct.feeAmount > 0 ? ' e custódia' : ''}
              </span>
              <span className="mt-1 block wrap-anywhere text-base sm:text-lg font-mono font-medium text-[#F4F5F7] tabular-nums">
                {bestProduct.isTaxExempt && bestProduct.feeAmount === 0
                  ? 'Isento'
                  : `-${formatBRL(Math.round(bestProduct.taxes + bestProduct.feeAmount))}`}
              </span>
              {bestProduct.isTaxExempt && (
                <span className="mt-0.5 block text-xs text-[#646973]">
                  {bestProduct.name} não paga IR para pessoa física.
                  {simulation.products.CDB.taxes > 0 &&
                    ` No CDB, o IR seria de ${formatBRL(Math.round(simulation.products.CDB.taxes))}.`}
                </span>
              )}
            </div>
            <StatItem
              label="Rendimento líquido"
              value={`+${formatBRL(Math.round(bestProduct.netReturn))}`}
              strong
              highlight
            />
          </div>
        </>
      )}

      {goalType === 'TARGET_AMOUNT' && fastestGoal && (
        <>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-[#9499A3]">
                Você chega a {formatBRL(targetAmount)} em:
              </p>
              {fastestGoal.monthsToReach > 0 && (
                <span className="text-xs font-mono text-[#9499A3]">
                  Caminho mais rápido ({fastestGoal.name})
                </span>
              )}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold tracking-tight text-[#10B981]">
              {fastestGoal.formattedTime}
            </h2>
            {fastestGoal.monthsToReach >= MAX_GOAL_MONTHS && (
              <p className="text-sm text-[#F59E0B]">
                Com esses valores a meta leva mais de 50 anos. Tente aumentar o aporte mensal.
              </p>
            )}
          </div>

          {fastestGoal.monthsToReach > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 border-t border-white/7">
              <StatItem label="Valor inicial" value={formatBRL(simulation.initialAmount)} />
              <StatItem
                label="Aportes até a meta"
                value={formatBRL(Math.max(0, fastestGoal.totalInvested - simulation.initialAmount))}
              />
              <StatItem
                label="Juros líquidos no caminho"
                value={`+${formatBRL(Math.round(fastestGoal.netReturn))}`}
                strong
                highlight
              />
              <StatItem
                label="Saldo ao atingir a meta"
                value={formatBRL(Math.round(fastestGoal.finalAmount))}
                strong
              />
            </div>
          )}

          <ProductOptions
            title="Prazo em cada investimento"
            linkLabel="Ver na página Metas →"
            linkPath="/metas"
            onNavigate={onNavigate}
            items={goalTimelineResults.map((item) => ({
              key: item.product,
              name: item.name,
              value: item.formattedTime,
              valueIsText: true,
              isBest: !!item.isFastest,
            }))}
          />
        </>
      )}

      {goalType === 'MONTHLY_INCOME' && lowestIncomeCap && (
        <>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-[#9499A3]">
                Para gerar {formatBRL(desiredMonthlyIncome)}/mês, você precisa ter investido:
              </p>
              <span className="text-xs font-mono text-[#9499A3]">
                Menor patrimônio ({lowestIncomeCap.name})
              </span>
            </div>
            <h2 className={`${fitAmount(formatBRL(Math.round(lowestIncomeCap.requiredCapital)), 'hero')} font-mono font-semibold tracking-tight text-[#10B981] tabular-nums`}>
              {formatBRL(Math.round(lowestIncomeCap.requiredCapital))}
            </h2>
          </div>

          {incomeFastest && (
            <div className="pt-5 border-t border-white/7">
              {incomeFastest.monthsToReach === 0 ? (
                <p className="text-base sm:text-lg text-[#F4F5F7]">
                  Você já tem esse patrimônio hoje.
                </p>
              ) : incomeFastest.monthsToReach >= MAX_GOAL_MONTHS ? (
                <p className="text-base sm:text-lg text-[#F4F5F7]">
                  Com os valores informados, levaria{' '}
                  <strong className="font-semibold text-[#F59E0B]">mais de 50 anos</strong>{' '}
                  para acumular esse patrimônio. Tente aumentar o aporte mensal.
                </p>
              ) : (
                <p className="text-base sm:text-lg text-[#F4F5F7]">
                  Com {formatBRL(simulation.initialAmount)} hoje e{' '}
                  {formatBRL(simulation.monthlyContribution)}/mês, você chega lá em{' '}
                  <strong className="font-semibold text-[#10B981]">
                    {incomeFastest.formattedTime}
                  </strong>{' '}
                  ({incomeFastest.name}).
                </p>
              )}
            </div>
          )}

          <ProductOptions
            title="Patrimônio necessário em cada investimento"
            linkLabel="Ver na página Renda mensal →"
            linkPath="/renda-mensal"
            onNavigate={onNavigate}
            items={monthlyIncomeResults.map((item) => ({
              key: item.product,
              name: item.name,
              value: formatBRL(Math.round(item.requiredCapital)),
              detail: `${formatPercent(item.monthlyNetRatePercent, 2)} a.m. líquido`,
              secondary: incomeTimeByProduct[item.product]
                ? `Chega em ${incomeTimeByProduct[item.product]}`
                : undefined,
              isBest: !!item.isLowestCapital,
            }))}
          />
        </>
      )}

      <div className="pt-5 border-t border-white/7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          {goalType === 'RENDER' && (
            <p className="text-sm text-[#F4F5F7]">
              Diferença para a menor opção ({worstProduct.name}):{' '}
              <span className="font-mono font-semibold text-[#10B981] tabular-nums wrap-anywhere">
                +{formatBRL(Math.round(maxDifference))}
              </span>
            </p>
          )}
          <p className="text-xs text-[#646973]">
            {describeRatesStatus(ratesUsed)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleQuickCopyLink}
            className="min-h-10.5 px-3.5 py-2 rounded-xl border border-white/9 hover:border-white/20 text-xs font-medium text-[#F4F5F7] flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {copiedQuick ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Link copiado</span>
              </>
            ) : (
              <span>Copiar link</span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenShareModal}
            className="min-h-10.5 px-4 py-2 rounded-xl bg-white/7 hover:bg-white/12 text-xs font-medium text-[#F4F5F7] flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Share2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Compartilhar simulação</span>
          </button>
        </div>
      </div>
    </section>
  );
};
