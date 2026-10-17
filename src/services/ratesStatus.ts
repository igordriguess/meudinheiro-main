import { MarketRates } from '../types/finance';

const formatTime = (iso?: string): string | null => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

// Texto padrão sobre a origem das taxas usadas nas simulações.
export const describeRatesStatus = (rates: MarketRates): string => {
  if (!rates.isLiveBcb) {
    return `Usando taxas de referência de ${rates.updatedAt}: não foi possível consultar o Banco Central agora.`;
  }
  const fetchedTime = formatTime(rates.fetchedAt);
  return [
    `Taxas de ${rates.updatedAt}`,
    fetchedTime ? `consultadas às ${fetchedTime}` : null,
    `Fonte: ${rates.source}`,
  ]
    .filter(Boolean)
    .join(' · ');
};
