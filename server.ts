import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_FALLBACK_RATES } from './src/services/simulationEngine';
import {
  getMarketRates,
  getTreasuryProducts,
  RATES_CACHE_CONTROL,
  simulateFromParams,
} from './src/server/marketData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 8443;

  app.use(express.json());

  app.get('/api/rates', async (_req, res) => {
    res.setHeader('Cache-Control', RATES_CACHE_CONTROL);
    try {
      res.json(await getMarketRates());
    } catch {
      res.status(200).json(DEFAULT_FALLBACK_RATES);
    }
  });

  app.get('/api/treasury', async (_req, res) => {
    res.setHeader('Cache-Control', RATES_CACHE_CONTROL);
    res.json(await getTreasuryProducts());
  });

  app.all('/api/simulation', async (req, res) => {
    try {
      const params = req.method === 'POST' ? req.body : req.query;
      res.json(await simulateFromParams(params));
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
