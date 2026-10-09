import React from 'react';
import { MarketRates, TreasuryProduct } from '../types/finance';
import { formatBRL, formatPercent } from '../services/simulationEngine';

interface DataSourceProps {
  rates: MarketRates;
  treasuryProducts: TreasuryProduct[];
  isFullPage?: boolean;
  onNavigate?: (path: string) => void;
}

export const DataSource: React.FC<DataSourceProps> = ({
  rates,
  treasuryProducts,
  isFullPage = false,
  onNavigate,
}) => {
  if (!rates.available) {
    return (
      <section className="bg-[#121418] border border-white/[0.08] rounded-2xl p-6 text-sm text-[#9499A3]">
        Taxa indisponível no momento.
      </section>
    );
  }

  return (
    <section
      id="fontes-dados"
      className="bg-[#121418] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-mono text-[#10B981]">TRANSPARÊNCIA E DADOS OFICIAIS</p>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-[#F4F5F7] tracking-tight">
            Fontes dos dados e taxas em vigor
          </h2>
          <p className="text-xs sm:text-sm text-[#9499A3]">
            Dados atualizados em {rates.updatedAt} · Fonte: {rates.source}
          </p>
        </div>

        {!isFullPage && onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('/fontes')}
            className="text-xs font-medium text-[#10B981] hover:underline self-start sm:self-auto cursor-pointer whitespace-nowrap"
          >
            Ver metodologia detalhada (/fontes) →
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0A0B0D] border border-white/[0.07]">
          <span className="text-xs text-[#9499A3] block">Taxa Selic</span>
          <span className="text-xl sm:text-2xl font-mono font-semibold text-[#F4F5F7] tabular-nums mt-1 block">
            {formatPercent(rates.selic)} a.a.
          </span>
          <span className="text-[11px] text-[#646973] mt-1 block">
            Banco Central (SGS 432)
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0A0B0D] border border-white/[0.07]">
          <span className="text-xs text-[#9499A3] block">Taxa CDI (DI)</span>
          <span className="text-xl sm:text-2xl font-mono font-semibold text-[#F4F5F7] tabular-nums mt-1 block">
            {formatPercent(rates.cdi)} a.a.
          </span>
          <span className="text-[11px] text-[#646973] mt-1 block">
            Base p/ CDB e LCI/LCA
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0A0B0D] border border-white/[0.07]">
          <span className="text-xs text-[#9499A3] block">Poupança atual</span>
          <span className="text-xl sm:text-2xl font-mono font-semibold text-[#F4F5F7] tabular-nums mt-1 block">
            {formatPercent(rates.poupancaAnnual)} a.a.
          </span>
          <span className="text-[11px] text-[#646973] mt-1 block">
            0,5% a.m. + TR ({formatPercent(rates.trMonthly)} a.m.)
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0A0B0D] border border-white/[0.07]">
          <span className="text-xs text-[#9499A3] block">IPCA (12 meses)</span>
          <span className="text-xl sm:text-2xl font-mono font-semibold text-[#F4F5F7] tabular-nums mt-1 block">
            {formatPercent(rates.ipca)} a.a.
          </span>
          <span className="text-[11px] text-[#646973] mt-1 block">
            Inflação oficial IBGE/BCB
          </span>
        </div>
      </div>

      {treasuryProducts.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold text-[#F4F5F7]">
            Títulos de referência — Tesouro Nacional
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {treasuryProducts.map((tp) => (
              <div
                key={tp.id}
                className="p-3.5 rounded-xl bg-[#0A0B0D] border border-white/[0.06] space-y-1.5 text-xs"
              >
                <div className="font-semibold text-[#F4F5F7]">{tp.name}</div>
                <div className="font-mono text-[#10B981]">{tp.rateDescription}</div>
                <div className="text-[#646973] flex justify-between pt-1 border-t border-white/[0.05]">
                  <span>Venc.: {tp.maturity}</span>
                  <span className="font-mono tabular-nums">
                    Mín. {formatBRL(tp.minInvestment, 2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isFullPage && (
        <div className="space-y-4 pt-4 border-t border-white/[0.07] text-sm text-[#9499A3] leading-relaxed">
          <h3 className="text-base font-semibold text-[#F4F5F7]">
            Como calculamos cada alternativa no Meu Dinheiro
          </h3>
          <ul className="space-y-2.5 list-disc pl-5">
            <li>
              <strong className="text-[#F4F5F7]">Juros Compostos Mensais:</strong> Convertemos a taxa anual efetiva para sua equivalente mensal pela fórmula{' '}
              <code className="font-mono text-xs text-[#F4F5F7]">
                (1 + taxa_anual)^(1/12) - 1
              </code>
              , aplicando sobre o montante inicial e cada aporte mensal.
            </li>
            <li>
              <strong className="text-[#F4F5F7]">Tabela Regressiva de Imposto de Renda:</strong> Aplicada exclusivamente sobre os rendimentos de CDB e Tesouro Direto: 22,5% (até 180 dias), 20,0% (181 a 360 dias), 17,5% (361 a 720 dias) e 15,0% (acima de 720 dias).
            </li>
            <li>
              <strong className="text-[#F4F5F7]">Isenções Legais:</strong> Poupança e LCI/LCA para Pessoa Física possuem alíquota zero de Imposto de Renda sobre os rendimentos.
            </li>
            <li>
              <strong className="text-[#F4F5F7]">Endpoints de Dados:</strong> A aplicação expõe{' '}
              <code className="font-mono text-xs text-[#10B981]">/api/rates</code>,{' '}
              <code className="font-mono text-xs text-[#10B981]">/api/treasury</code> e{' '}
              <code className="font-mono text-xs text-[#10B981]">/api/simulation</code> integrados ao Sistema Gerenciador de Séries Temporais (SGS) do Banco Central do Brasil.
            </li>
          </ul>
        </div>
      )}
    </section>
  );
};
