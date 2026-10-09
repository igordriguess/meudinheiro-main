import { MarketRates, TreasuryProduct } from '../types/finance';
import { DEFAULT_FALLBACK_RATES } from './simulationEngine';

export async function fetchMarketRatesClient(): Promise<MarketRates> {
  try {
    const res = await fetch('/api/rates');
    if (!res.ok) throw new Error('Failed to fetch rates');
    const data = (await res.json()) as MarketRates;
    if (typeof data?.selic === 'number' && typeof data?.cdi === 'number') {
      return data;
    }
    return DEFAULT_FALLBACK_RATES;
  } catch {
    return DEFAULT_FALLBACK_RATES;
  }
}

export async function fetchTreasuryProductsClient(): Promise<{
  source: string;
  updatedAt: string;
  products: TreasuryProduct[];
}> {
  try {
    const res = await fetch('/api/treasury');
    if (!res.ok) throw new Error('Failed to fetch treasury');
    return await res.json();
  } catch {
    return {
      source: 'Tesouro Nacional',
      updatedAt: DEFAULT_FALLBACK_RATES.updatedAt,
      products: [
        {
          id: 'tesouro-selic-2029',
          name: 'Tesouro Selic 2029',
          type: 'SELIC',
          maturity: '01/03/2029',
          rateDescription: 'SELIC + 0,059% a.a.',
          annualRateEquivalent: DEFAULT_FALLBACK_RATES.selic + 0.059,
          minInvestment: 158.42,
          unitPrice: 15842.18,
          updatedAt: DEFAULT_FALLBACK_RATES.updatedAt,
        },
      ],
    };
  }
}
