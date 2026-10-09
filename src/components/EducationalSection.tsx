import React from 'react';
import { MarketRates } from '../types/finance';
import { formatPercent } from '../services/simulationEngine';

interface EducationalSectionProps {
  rates: MarketRates;
}

export const EducationalSection: React.FC<EducationalSectionProps> = ({ rates }) => {
  return (
    <section id="sobre" className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-display font-semibold text-[#F4F5F7] tracking-tight">
          Entenda o básico sem complicação
        </h2>
        <p className="text-sm text-[#9499A3] mt-1">
          Três conceitos rápidos para ler qualquer simulação de renda fixa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="p-6 rounded-2xl bg-[#121418] border border-white/[0.07] space-y-3">
          <h3 className="text-base font-semibold text-[#F4F5F7]">
            01. O que significa 100% do CDI?
          </h3>
          <p className="text-sm text-[#9499A3] leading-relaxed">
            O CDI é a taxa de referência que os bancos usam entre si e anda sempre colada na taxa Selic (hoje em{' '}
            <strong className="font-mono text-[#F4F5F7]">
              {formatPercent(rates.cdi)} ao ano
            </strong>
            ). Quando um CDB paga &ldquo;100% do CDI&rdquo;, significa que seu dinheiro vai render exatamente essa taxa anual antes do imposto.
          </p>
        </article>

        <article className="p-6 rounded-2xl bg-[#121418] border border-white/[0.07] space-y-3">
          <h3 className="text-base font-semibold text-[#F4F5F7]">
            02. O que é a taxa Selic?
          </h3>
          <p className="text-sm text-[#9499A3] leading-relaxed">
            É a taxa básica de juros da economia brasileira, definida pelo Banco Central (atualmente em{' '}
            <strong className="font-mono text-[#F4F5F7]">
              {formatPercent(rates.selic)} ao ano
            </strong>
            ). Quando você investe no Tesouro Selic, você empresta dinheiro para o Tesouro Nacional e recebe essa rentabilidade diariamente.
          </p>
        </article>

        <article className="p-6 rounded-2xl bg-[#121418] border border-white/[0.07] space-y-3">
          <h3 className="text-base font-semibold text-[#F4F5F7]">
            03. Como funciona o Imposto de Renda?
          </h3>
          <p className="text-sm text-[#9499A3] leading-relaxed">
            O imposto nunca é cobrado sobre o dinheiro que você colocou — apenas sobre o lucro (rendimento). No CDB e no Tesouro, quanto mais tempo o dinheiro fica investido, menor o imposto: começa em 22,5% (até 6 meses) e cai até 15% (após 2 anos). Poupança e LCI/LCA são isentas.
          </p>
        </article>
      </div>
    </section>
  );
};
