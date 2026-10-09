import React from 'react';
import { SingleProductSimulation } from '../types/finance';
import { formatBRL } from '../services/simulationEngine';

interface InvestmentCardProps {
  item: SingleProductSimulation;
  worstFinalAmount: number;
}

export const InvestmentCard: React.FC<InvestmentCardProps> = ({
  item,
  worstFinalAmount,
}) => {
  const diffFromWorst = Math.max(0, item.finalAmount - worstFinalAmount);

  return (
    <article
      className={`rounded-2xl p-5 sm:p-6 transition-colors border flex flex-col justify-between ${
        item.isBestOption
          ? 'bg-[#121418] border-[#10B981]/60'
          : 'bg-[#121418] border-white/[0.07]'
      }`}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          {item.isBestOption ? (
            <p className="text-xs font-medium text-[#10B981]">
              Maior valor líquido na simulação
            </p>
          ) : (
            <p className="text-xs text-[#646973]">{item.subtitle}</p>
          )}
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold text-[#F4F5F7]">{item.name}</h3>
            <span className="text-xs font-mono text-[#9499A3] tabular-nums">
              {item.rateLabel}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-white/[0.06]">
          <span className="block text-xs text-[#9499A3]">
            {formatBRL(item.totalInvested)} investidos viram:
          </span>
          <p
            className={`mt-1 text-2xl sm:text-3xl font-mono font-semibold tabular-nums tracking-tight ${
              item.isBestOption ? 'text-[#10B981]' : 'text-[#F4F5F7]'
            }`}
          >
            {formatBRL(Math.round(item.finalAmount))}
          </p>
        </div>

        <dl className="space-y-2 pt-3 border-t border-white/[0.06] text-xs sm:text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-[#9499A3]">Rendimento líquido</dt>
            <dd className="font-mono font-medium text-[#10B981] tabular-nums">
              +{formatBRL(Math.round(item.netReturn))}
            </dd>
          </div>

          <div className="flex items-center justify-between">
            <dt className="text-[#9499A3]">Rendimento bruto</dt>
            <dd className="font-mono text-[#F4F5F7] tabular-nums">
              {formatBRL(Math.round(item.grossReturn))}
            </dd>
          </div>

          <div className="flex items-center justify-between">
            <dt className="text-[#9499A3]">
              Imposto de Renda {item.isTaxExempt ? '(Isento)' : `(${item.taxRatePercent.toFixed(1).replace('.', ',')}%)`}
            </dt>
            <dd className="font-mono text-[#9499A3] tabular-nums">
              {item.isTaxExempt ? 'R$ 0' : `-${formatBRL(Math.round(item.taxes))}`}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
        <span className="text-[#646973]">Diferença p/ menor opção</span>
        <span
          className={`font-mono font-medium tabular-nums ${
            diffFromWorst > 0 ? 'text-[#F4F5F7]' : 'text-[#646973]'
          }`}
        >
          {diffFromWorst > 0 ? `+${formatBRL(Math.round(diffFromWorst))}` : 'Base comparativa'}
        </span>
      </div>
    </article>
  );
};
