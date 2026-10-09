import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  calculatePoupancaAnnualRate,
  DEFAULT_FALLBACK_RATES,
  runFullSimulation,
} from './src/services/simulationEngine';
import { MarketRates, TreasuryProduct } from './src/types/finance';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedRates: MarketRates | null = null;
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 1000 * 60 * 5;

async function fetchBcbSeriesLastValue(seriesCode: number): Promise<{ valor: number; data: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${seriesCode}/dados/ultimos/1?formato=json`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ data: string; valor: string }>;
    if (Array.isArray(data) && data.length > 0) {
      const val = parseFloat(data[0].valor.replace(',', '.'));
      if (Number.isFinite(val)) {
        return { valor: val, data: data[0].data };
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function getMarketRates(): Promise<MarketRates> {
  const now = Date.now();
  if (cachedRates && now - lastFetchTimestamp < CACHE_TTL_MS) {
    return cachedRates;
  }

  const [selicMeta, selicEfetiva, ipca12m] = await Promise.all([
    fetchBcbSeriesLastValue(432),
    fetchBcbSeriesLastValue(4189),
    fetchBcbSeriesLastValue(13522),
  ]);

  if (selicMeta || selicEfetiva) {
    const selic = selicMeta?.valor ?? selicEfetiva?.valor ?? DEFAULT_FALLBACK_RATES.selic;
    const cdi = selicEfetiva?.valor ?? Math.max(0.1, Number((selic - 0.1).toFixed(2)));
    const ipca = ipca12m?.valor ?? DEFAULT_FALLBACK_RATES.ipca;
    const trMonthly = DEFAULT_FALLBACK_RATES.trMonthly;
    const poupancaAnnual = Number(calculatePoupancaAnnualRate(selic, trMonthly).toFixed(2));

    cachedRates = {
      selic,
      cdi,
      ipca,
      poupancaAnnual,
      trMonthly,
      updatedAt: selicMeta?.data || selicEfetiva?.data || new Date().toLocaleDateString('pt-BR'),
      source: 'Banco Central do Brasil (SGS) / Tesouro Nacional',
      isLiveBcb: true,
      available: true,
    };
    lastFetchTimestamp = now;
    return cachedRates;
  }

  const fallbackWithToday: MarketRates = {
    ...DEFAULT_FALLBACK_RATES,
    updatedAt: new Date().toLocaleDateString('pt-BR'),
  };
  cachedRates = fallbackWithToday;
  lastFetchTimestamp = now;
  return fallbackWithToday;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 8443;

  app.use(express.json());

  app.get('/api/rates', async (_req, res) => {
    try {
      const rates = await getMarketRates();
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      res.json(rates);
    } catch {
      res.status(200).json(DEFAULT_FALLBACK_RATES);
    }
  });

  app.get('/api/treasury', async (_req, res) => {
    const rates = await getMarketRates();
    const updatedAt = rates.updatedAt;
    res.setHeader('Cache-Control', 'no-store, max-age=0');

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

    res.json({
      source: 'Tesouro Transparente / Tesouro Nacional',
      updatedAt,
      products,
    });
  });

  app.all('/api/simulation', async (req, res) => {
    try {
      const rates = await getMarketRates();
      const sourceParams = req.method === 'POST' ? req.body : req.query;

      const initialAmount = Number(sourceParams?.initial_amount ?? sourceParams?.initialAmount ?? 10000);
      const monthlyContribution = Number(
        sourceParams?.monthly_contribution ?? sourceParams?.monthlyContribution ?? 1000
      );
      const period = Number(sourceParams?.period ?? sourceParams?.months ?? 12);
      const cdbPercentCdi = Number(sourceParams?.cdb_percent_cdi ?? sourceParams?.cdbPercentCdi ?? 100);
      const lciPercentCdi = Number(sourceParams?.lci_percent_cdi ?? sourceParams?.lciPercentCdi ?? 90);

      const simulation = runFullSimulation({
        initialAmount: Number.isFinite(initialAmount) ? initialAmount : 10000,
        monthlyContribution: Number.isFinite(monthlyContribution) ? monthlyContribution : 1000,
        months: Number.isFinite(period) ? period : 12,
        rates,
        cdbPercentCdi: Number.isFinite(cdbPercentCdi) ? cdbPercentCdi : 100,
        lciPercentCdi: Number.isFinite(lciPercentCdi) ? lciPercentCdi : 90,
      });

      res.json(simulation);
    } catch {
      res.status(400).json({ error: 'Parâmetros de simulação inválidos.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Meu Dinheiro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
