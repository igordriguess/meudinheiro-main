// Dados de mercado compartilhados entre o servidor local (server.ts) e as funções
// serverless da Vercel (pasta api/), para que os dois ambientes se comportem igual.
import {
  calculatePoupancaAnnualRate,
  DEFAULT_FALLBACK_RATES,
  runFullSimulation,
} from '../services/simulationEngine.js';
import type { FullSimulationResult, MarketRates, TreasuryProduct } from '../types/finance';

// CDN da Vercel guarda a resposta por 5 minutos e serve a versão anterior enquanto renova.
export const RATES_CACHE_CONTROL = 'public, max-age=0, s-maxage=300, stale-while-revalidate=600';

// Cache em memória: vale para o servidor local e para instâncias "quentes" da função serverless.
let cachedRates: MarketRates | null = null;
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 1000 * 60 * 5;

const parseBrDate = (value: string): Date | null => {
  const [day, month, year] = value.split('/').map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
};

// "Hoje" no fuso de Brasília: na Vercel as funções rodam em UTC e, à noite, já seria amanhã.
const todayInBrazil = (): Date => {
  const [year, month, day] = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' })
    .format(new Date())
    .split('-')
    .map(Number);
  return new Date(year, month - 1, day);
};

// A API do SGS pode devolver datas futuras (ex.: a Meta Selic vem preenchida até a
// próxima reunião do Copom) e nem sempre em ordem; usamos a observação mais recente até hoje.
const formatBrDate = (date: Date): string =>
  `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

async function fetchBcbSeriesLastValue(
  seriesCode: number,
  lookbackDays = 30
): Promise<{ valor: number; data: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const today = todayInBrazil();
    const start = new Date(today.getTime() - lookbackDays * 24 * 60 * 60 * 1000);
    const url =
      `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${seriesCode}/dados?formato=json` +
      `&dataInicial=${formatBrDate(start)}&dataFinal=${formatBrDate(today)}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ data: string; valor: string }>;
    if (!Array.isArray(data)) return null;

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const latest = data
      .map((item) => ({
        date: parseBrDate(item.data),
        data: item.data,
        valor: parseFloat(String(item.valor).replace(',', '.')),
      }))
      .filter((item) => item.date && item.date <= endOfToday && Number.isFinite(item.valor))
      .sort((x, y) => (y.date as Date).getTime() - (x.date as Date).getTime())[0];

    return latest ? { valor: latest.valor, data: latest.data } : null;
  } catch {
    return null;
  }
}

export async function getMarketRates(): Promise<MarketRates> {
  const now = Date.now();
  if (cachedRates && now - lastFetchTimestamp < CACHE_TTL_MS) {
    return cachedRates;
  }

  // 432: Meta Selic (Copom) · 1178: Selic efetiva (over) anualizada · 4389: CDI anualizado (diário)
  // 13522: IPCA acumulado em 12 meses · 226: Taxa Referencial (TR) mensal
  const [selicMeta, selicOver, cdiDaily, ipca12m, tr] = await Promise.all([
    fetchBcbSeriesLastValue(432),
    fetchBcbSeriesLastValue(1178),
    fetchBcbSeriesLastValue(4389),
    fetchBcbSeriesLastValue(13522, 400),
    fetchBcbSeriesLastValue(226),
  ]);

  if (selicMeta || selicOver || cdiDaily) {
    const selic = selicMeta?.valor ?? selicOver?.valor ?? DEFAULT_FALLBACK_RATES.selic;
    const over = selicOver?.valor ?? cdiDaily?.valor ?? Math.max(0.1, Number((selic - 0.1).toFixed(2)));
    const cdi = cdiDaily?.valor ?? over;
    const ipca = ipca12m?.valor ?? DEFAULT_FALLBACK_RATES.ipca;
    const trMonthly = tr?.valor ?? DEFAULT_FALLBACK_RATES.trMonthly;
    const poupancaAnnual = Number(calculatePoupancaAnnualRate(selic, trMonthly).toFixed(2));

    // Data de referência: último CDI publicado (base da maioria das simulações).
    const referenceDate = (cdiDaily ?? selicOver ?? selicMeta)?.data;

    cachedRates = {
      selic,
      selicOver: over,
      cdi,
      ipca,
      poupancaAnnual,
      trMonthly,
      updatedAt: referenceDate || formatBrDate(todayInBrazil()),
      fetchedAt: new Date().toISOString(),
      source: 'Banco Central do Brasil (SGS) / Tesouro Nacional',
      isLiveBcb: true,
      available: true,
    };
    lastFetchTimestamp = now;
    return cachedRates;
  }

  // Falha na consulta: mantém os últimos dados reais, se houver, e tenta de novo em 1 minuto.
  if (cachedRates?.isLiveBcb) {
    lastFetchTimestamp = now - CACHE_TTL_MS + 60_000;
    return cachedRates;
  }

  const fallback: MarketRates = { ...DEFAULT_FALLBACK_RATES, fetchedAt: new Date().toISOString() };
  cachedRates = fallback;
  lastFetchTimestamp = now - CACHE_TTL_MS + 60_000;
  return fallback;
}

export async function getTreasuryProducts(): Promise<{
  source: string;
  updatedAt: string;
  products: TreasuryProduct[];
}> {
  const rates = await getMarketRates();
  const updatedAt = rates.updatedAt;

  const products: TreasuryProduct[] = [
    {
      id: 'tesouro-selic-2029',
      name: 'Tesouro Selic 2029',
      type: 'SELIC',
      maturity: '01/03/2029',
      rateDescription: `SELIC + 0,059% a.a.`,
      annualRateEquivalent: Number((rates.selic + 0.059).toFixed(2)),
      minInvestment: 158.42,
      unitPrice: 15842.18,
      updatedAt,
    },
    {
      id: 'tesouro-selic-2031',
      name: 'Tesouro Selic 2031',
      type: 'SELIC',
      maturity: '01/03/2031',
      rateDescription: `SELIC + 0,108% a.a.`,
      annualRateEquivalent: Number((rates.selic + 0.108).toFixed(2)),
      minInvestment: 157.95,
      unitPrice: 15795.4,
      updatedAt,
    },
    {
      id: 'tesouro-ipca-2029',
      name: 'Tesouro IPCA+ 2029',
      type: 'IPCA',
      maturity: '15/05/2029',
      rateDescription: `IPCA + 6,42% a.a.`,
      annualRateEquivalent: Number((rates.ipca + 6.42).toFixed(2)),
      minInvestment: 32.8,
      unitPrice: 3280.15,
      updatedAt,
    },
    {
      id: 'tesouro-prefixado-2028',
      name: 'Tesouro Prefixado 2028',
      type: 'PREFIXADO',
      maturity: '01/01/2028',
      rateDescription: `12,18% a.a.`,
      annualRateEquivalent: 12.18,
      minInvestment: 35.12,
      unitPrice: 702.4,
      updatedAt,
    },
  ];

  return {
    source: 'Tesouro Transparente / Tesouro Nacional',
    updatedAt,
    products,
  };
}

type SimulationParams = Record<string, unknown> | null | undefined;

const readNumber = (params: SimulationParams, keys: string[], fallback: number): number => {
  for (const key of keys) {
    const raw = params?.[key];
    if (raw === undefined || raw === null || raw === '') continue;
    const value = Number(raw);
    if (Number.isFinite(value)) return value;
  }
  return fallback;
};

export async function simulateFromParams(params: SimulationParams): Promise<FullSimulationResult> {
  const rates = await getMarketRates();
  return runFullSimulation({
    initialAmount: readNumber(params, ['initial_amount', 'initialAmount'], 10000),
    monthlyContribution: readNumber(params, ['monthly_contribution', 'monthlyContribution'], 1000),
    months: readNumber(params, ['period', 'months'], 12),
    rates,
    cdbPercentCdi: readNumber(params, ['cdb_percent_cdi', 'cdbPercentCdi'], 100),
    lciPercentCdi: readNumber(params, ['lci_percent_cdi', 'lciPercentCdi'], 90),
  });
}
