import React, { useEffect, useState } from 'react';
import {
  FullSimulationResult,
  GoalReachProductResult,
  GoalType,
  MonthlyIncomeProductResult,
} from '../types/finance';
import { formatBRL, formatMonthsHuman } from '../services/simulationEngine';
import { Share2, Check } from 'lucide-react';

interface SimulationResultProps {
  simulation: FullSimulationResult;
  goalType: GoalType;
  goalTimelineResults: GoalReachProductResult[];
  targetAmount: number;
  monthlyIncomeResults: MonthlyIncomeProductResult[];
  desiredMonthlyIncome: number;
  highlightKey: number;
  onOpenShareModal: () => void;
}

export const SimulationResult: React.FC<SimulationResultProps> = ({
  simulation,
  goalType,
  goalTimelineResults,
  targetAmount,
  monthlyIncomeResults,
  desiredMonthlyIncome,
  highlightKey,
  onOpenShareModal,
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
      className="bg-[#121418] border border-white/[0.09] rounded-2xl p-6 sm:p-8 space-y-7"
    >
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
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-mono font-semibold tracking-tight text-[#10B981] tabular-nums">
            {formatBRL(Math.round(animatedValue))}
          </h2>
          <span className="text-base sm:text-lg font-medium text-[#9499A3]">
            em {formatMonthsHuman(months)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-5 border-t border-white/[0.07]">
        <div>
          <span className="block text-xs text-[#9499A3]">Valor inicial</span>
          <span className="mt-1 block text-base sm:text-lg font-mono font-medium text-[#F4F5F7] tabular-nums">
            {formatBRL(simulation.initialAmount)}
          </span>
        </div>

        <div>
          <span className="block text-xs text-[#9499A3]">Aportes no período</span>
          <span className="mt-1 block text-base sm:text-lg font-mono font-medium text-[#F4F5F7] tabular-nums">
            {formatBRL(bestProduct.totalContributions)}
          </span>
        </div>

        <div>
          <span className="block text-xs text-[#9499A3]">Total que você colocou</span>
          <span className="mt-1 block text-base sm:text-lg font-mono font-semibold text-[#F4F5F7] tabular-nums">
            {formatBRL(bestProduct.totalInvested)}
          </span>
        </div>

        <div>
          <span className="block text-xs text-[#9499A3]">
            Rendimento bruto / Impostos
          </span>
          <span className="mt-1 block text-sm sm:text-base font-mono text-[#9499A3] tabular-nums">
            +{formatBRL(Math.round(bestProduct.grossReturn))}{' '}
            <span className="text-[#646973]">·</span>{' '}
            <span title="Imposto de Renda estimado">
              -{formatBRL(Math.round(bestProduct.taxes))}
            </span>
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <span className="block text-xs text-[#9499A3]">Rendimento líquido</span>
          <span className="mt-1 block text-base sm:text-lg font-mono font-semibold text-[#10B981] tabular-nums">
            +{formatBRL(Math.round(bestProduct.netReturn))}
          </span>
        </div>
      </div>

      {goalType === 'TARGET_AMOUNT' && fastestGoal && (
        <div className="pt-5 border-t border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs text-[#9499A3]">
              Meta selecionada: chegar a {formatBRL(targetAmount)}
            </p>
            <p className="text-base sm:text-lg text-[#F4F5F7]">
              Você pode atingir esse valor em aproximadamente{' '}
              <strong className="font-mono font-semibold text-[#10B981]">
                {fastestGoal.formattedTime}
              </strong>{' '}
              ({fastestGoal.name}).
            </p>
          </div>
          <a
            href="#objetivo-100k"
            className="text-xs font-medium text-[#10B981] hover:underline whitespace-nowrap shrink-0"
          >
            Ver comparativo de prazo →
          </a>
        </div>
      )}

      {goalType === 'MONTHLY_INCOME' && lowestIncomeCap && (
        <div className="pt-5 border-t border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs text-[#9499A3]">
              Meta selecionada: gerar {formatBRL(desiredMonthlyIncome)}/mês
            </p>
            <p className="text-base sm:text-lg text-[#F4F5F7]">
              Patrimônio estimado necessário:{' '}
              <strong className="font-mono font-semibold text-[#10B981] tabular-nums">
                {formatBRL(Math.round(lowestIncomeCap.requiredCapital))}
              </strong>{' '}
              em {lowestIncomeCap.name}.
            </p>
          </div>
          <a
            href="#renda-mensal"
            className="text-xs font-medium text-[#10B981] hover:underline whitespace-nowrap shrink-0"
          >
            Ver todas as opções →
          </a>
        </div>
      )}

      <div className="pt-5 border-t border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-sm text-[#F4F5F7]">
            Diferença para a menor opção ({worstProduct.name}):{' '}
            <span className="font-mono font-semibold text-[#10B981] tabular-nums">
              +{formatBRL(Math.round(maxDifference))}
            </span>
          </p>
          <p className="text-xs text-[#646973]">
            Dados atualizados em {ratesUsed.updatedAt} · Fonte: {ratesUsed.source}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleQuickCopyLink}
            className="min-h-[42px] px-3.5 py-2 rounded-xl border border-white/[0.09] hover:border-white/[0.2] text-xs font-medium text-[#F4F5F7] flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
            className="min-h-[42px] px-4 py-2 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] text-xs font-medium text-[#F4F5F7] flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Share2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Compartilhar simulação</span>
          </button>
        </div>
      </div>
    </section>
  );
};
