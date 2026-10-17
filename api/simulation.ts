// Função serverless da Vercel: GET/POST /api/simulation
import { simulateFromParams } from '../src/server/marketData.js';

const invalidParams = () =>
  Response.json({ error: 'Parâmetros de simulação inválidos.' }, { status: 400 });

export async function GET(request: Request): Promise<Response> {
  try {
    const params = Object.fromEntries(new URL(request.url).searchParams);
    return Response.json(await simulateFromParams(params));
  } catch {
    return invalidParams();
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const params = (await request.json()) as Record<string, unknown>;
    return Response.json(await simulateFromParams(params));
  } catch {
    return invalidParams();
  }
}
