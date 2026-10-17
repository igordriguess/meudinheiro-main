// Função serverless da Vercel: GET /api/treasury
import { getTreasuryProducts, RATES_CACHE_CONTROL } from '../src/server/marketData.js';

export async function GET(): Promise<Response> {
  const treasury = await getTreasuryProducts();
  return Response.json(treasury, { headers: { 'Cache-Control': RATES_CACHE_CONTROL } });
}
