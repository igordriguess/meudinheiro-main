import React, { useState } from 'react';
import { FullSimulationResult } from '../types/finance';
import { InvestmentCard } from './InvestmentCard';
import { formatBRL } from '../services/simulationEngine';

interface ComparisonTableProps {
  simulation: FullSimulationResult;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ simulation }) => {
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  const { products, worstProduct, maxDifference } = simulation;

  const list = [
    products.CDB,
    products.LCI_LCA,
    products.TESOURO_SELIC,
    products.POUPANCA,
  ];

  return (
    <section id="comparar" className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-[#F4F5F7] tracking-tight">
            Compare as opções em dinheiro
          </h2>
          <p className="text-sm text-[#9499A3] mt-1">
            Diferença de até{' '}
            <strong className="font-mono text-[#10B981] font-semibold tabular-nums">
              +{formatBRL(Math.round(maxDifference))}
            </strong>{' '}
            entre a maior e a menor alternativa simulada no período.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1 p-1 bg-[#121418] border border-white/[0.07] rounded-xl self-start">
          <button
            type="button"
            onClick={() => setViewMode('CARDS')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              viewMode === 'CARDS'
                ? 'bg-white/[0.1] text-[#F4F5F7]'
                : 'text-[#9499A3] hover:text-[#F4F5F7]'
            }`}
          >
            Cards
          </button>
          <button
            type="button"
            onClick={() => setViewMode('TABLE')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              viewMode === 'TABLE'
                ? 'bg-white/[0.1] text-[#F4F5F7]'
                : 'text-[#9499A3] hover:text-[#F4F5F7]'
            }`}
          >
            Tabela completa
          </button>
        </div>
      </div>

      <div
        className={`${
          viewMode === 'TABLE' ? 'grid sm:hidden' : 'grid'
        } grid-cols-1 sm:grid-cols-2 gap-4`}
      >
        {list.map((item) => (
          <InvestmentCard
            key={item.product}
            item={item}
            worstFinalAmount={worstProduct.finalAmount}
          />
        ))}
      </div>

      {viewMode === 'TABLE' && (
        <div className="hidden sm:block bg-[#121418] border border-white/[0.08] rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.07] text-xs text-[#9499A3]">
                <th className="py-4 px-5 font-medium">Alternativa</th>
                <th className="py-4 px-5 font-medium">Taxa considerada</th>
                <th className="py-4 px-5 font-medium text-right">Você colocou</th>
                <th className="py-4 px-5 font-medium text-right">Imposto (IR)</th>
                <th className="py-4 px-5 font-medium text-right">Ganho líquido</th>
                <th className="py-4 px-5 font-medium text-right">Valor final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-sm">
              {list.map((item) => (
                <tr
                  key={item.product}
                  className={item.isBestOption ? 'bg-[#10B981]/[0.05]' : ''}
                >
                  <td className="py-4 px-5 font-medium text-[#F4F5F7]">
                    <div>{item.name}</div>
                    {item.isBestOption && (
                      <div className="text-xs text-[#10B981] mt-0.5">
                        Maior valor líquido na simulação
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-5 font-mono text-xs text-[#9499A3] tabular-nums">
                    {item.rateLabel}
                  </td>
                  <td className="py-4 px-5 font-mono text-right text-[#F4F5F7] tabular-nums">
                    {formatBRL(Math.round(item.totalInvested))}
                  </td>
                  <td className="py-4 px-5 font-mono text-right text-[#9499A3] tabular-nums">
                    {item.isTaxExempt ? 'Isento' : `-${formatBRL(Math.round(item.taxes))}`}
                  </td>
                  <td className="py-4 px-5 font-mono text-right text-[#10B981] font-medium tabular-nums">
                    +{formatBRL(Math.round(item.netReturn))}
                  </td>
                  <td className="py-4 px-5 font-mono text-right font-semibold text-[#F4F5F7] tabular-nums">
                    {formatBRL(Math.round(item.finalAmount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
