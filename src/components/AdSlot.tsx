import React from 'react';
import { PartnerOffer } from '../types/finance';
import { formatBRL } from '../services/simulationEngine';

interface AdSlotProps {
  label?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ label = 'Espaço publicitário' }) => {
  return (
    <aside
      aria-label="Espaço publicitário"
      className="w-full py-4 px-5 rounded-xl bg-[#121418]/50 border border-dashed border-white/[0.07] flex items-center justify-between text-xs text-[#646973]"
    >
      <span>{label}</span>
      <span className="font-mono text-[11px]">Reservado para parceiros</span>
    </aside>
  );
};

const REFERENCE_OFFERS: PartnerOffer[] = [
  {
    id: 'offer-cdb-110',
    title: 'CDB Liquidez Diária 110% CDI',
    issuer: 'Instituição Financeira Parceira A',
    type: 'CDB',
    rateText: '110% do CDI',
    termText: '12 meses',
    liquidityText: 'Liquidez diária',
    protectionText: 'Cobertura FGC até R$ 250 mil',
    minAmount: 100,
    simulatedFinalFor10k12m: 10980,
  },
  {
    id: 'offer-lci-93',
    title: 'LCA Isenta de IR 93% CDI',
    issuer: 'Instituição Financeira Parceira B',
    type: 'LCI_LCA',
    rateText: '93% do CDI (Isento de IR)',
    termText: '9 meses',
    liquidityText: 'No vencimento',
    protectionText: 'Cobertura FGC até R$ 250 mil',
    minAmount: 1000,
    simulatedFinalFor10k12m: 11036,
  },
  {
    id: 'offer-cdb-115',
    title: 'CDB Pós-Fixado 115% CDI',
    issuer: 'Instituição Financeira Parceira C',
    type: 'CDB',
    rateText: '115% do CDI',
    termText: '24 meses',
    liquidityText: 'No vencimento',
    protectionText: 'Cobertura FGC até R$ 250 mil',
    minAmount: 500,
    simulatedFinalFor10k12m: 11025,
  },
];

interface PartnerOffersSectionProps {
  onSimulateOfferRate: (cdbPercent: number) => void;
}

export const PartnerOffersSection: React.FC<PartnerOffersSectionProps> = ({
  onSimulateOfferRate,
}) => {
  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <p className="text-xs text-[#646973]">
            Publicidade / Oferta de parceiro · Separado da calculadora independente
          </p>
          <h2 className="text-lg sm:text-xl font-display font-semibold text-[#F4F5F7] mt-0.5">
            Exemplos de ofertas de mercado
          </h2>
        </div>
        <span className="text-xs text-[#646973]">
          Clique para testar a taxa no simulador de CDB
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {REFERENCE_OFFERS.map((offer) => (
          <div
            key={offer.id}
            className="p-5 rounded-2xl bg-[#121418] border border-white/[0.07] flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#646973]">
                <span>{offer.issuer}</span>
                <span>Publicidade</span>
              </div>
              <h3 className="text-base font-semibold text-[#F4F5F7]">
                {offer.title}
              </h3>
              <p className="text-lg font-mono font-semibold text-[#10B981]">
                {offer.rateText}
              </p>
            </div>

            <dl className="space-y-1.5 pt-3 border-t border-white/[0.06] text-xs text-[#9499A3]">
              <div className="flex justify-between">
                <dt>Prazo de referência:</dt>
                <dd className="text-[#F4F5F7]">{offer.termText}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Liquidez:</dt>
                <dd className="text-[#F4F5F7]">{offer.liquidityText}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Garantia:</dt>
                <dd className="text-[#F4F5F7]">{offer.protectionText}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Aplicação mínima:</dt>
                <dd className="font-mono text-[#F4F5F7] tabular-nums">
                  {formatBRL(offer.minAmount)}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => {
                const match = offer.rateText.match(/(\d+)/);
                const pct = match ? Number(match[1]) : 110;
                onSimulateOfferRate(pct);
              }}
              className="w-full min-h-[42px] py-2 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.11] text-xs font-medium text-[#F4F5F7] transition-colors cursor-pointer whitespace-nowrap"
            >
              Simular esta taxa na calculadora
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
