// Função serverless da Vercel: GET /api/rates
import { DEFAULT_FALLBACK_RATES } from '../src/services/simulationEngine.js';
import { getMarketRates, RATES_CACHE_CONTROL } from '../src/server/marketData.js';

export async function GET(): Promise<Response> {
  try {
    const rates = await getMarketRates();
    return Response.json(rates, { headers: { 'Cache-Control': RATES_CACHE_CONTROL } });
  } catch {
    return Response.json(DEFAULT_FALLBACK_RATES, { headers: { 'Cache-Control': 'no-store' } });
  }
}
