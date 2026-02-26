import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

// Generate public/version.json so it's served as a static file
mkdirSync('./public', { recursive: true })
writeFileSync('./public/version.json', JSON.stringify({ service: pkg.name, version: pkg.version }, null, 2) + '\n')

// Vite dev middleware to proxy /api/wallet-activity to Alchemy (mirrors the Vercel serverless function)
function walletActivityDevProxy() {
  return {
    name: 'wallet-activity-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/wallet-activity', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
          return res.end();
        }
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Method not allowed' }));
        }

        const env = loadEnv('development', process.cwd(), '');
        const apiKey = env.ALCHEMY_API_KEY;
        if (!apiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'ALCHEMY_API_KEY not configured' }));
        }

        let body = '';
        for await (const chunk of req) body += chunk;
        const { address } = JSON.parse(body || '{}');

        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Invalid address' }));
        }

        const networkUrl = env.ALCHEMY_NETWORK_URL || 'https://arb-mainnet.g.alchemy.com/v2';
        const alchemyUrl = `${networkUrl}/${apiKey}`;

        const makeRequest = (fromAddress, toAddress, category) =>
          fetch(alchemyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0', id: 1, method: 'alchemy_getAssetTransfers',
              params: [{ ...(fromAddress ? { fromAddress } : {}), ...(toAddress ? { toAddress } : {}), category, maxCount: '0x1', withMetadata: false }],
            }),
          }).then(r => r.json());

        try {
          const [txOut, txIn, erc20Out, erc20In, nftOut, nftIn] = await Promise.all([
            makeRequest(address, null, ['external']),
            makeRequest(null, address, ['external']),
            makeRequest(address, null, ['erc20']),
            makeRequest(null, address, ['erc20']),
            makeRequest(address, null, ['erc721', 'erc1155']),
            makeRequest(null, address, ['erc721', 'erc1155']),
          ]);

          const getCount = (result) => { const t = result?.result?.transfers; return Array.isArray(t) ? t.length : 0; };

          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({
            transactions: getCount(txOut) + getCount(txIn),
            erc20: getCount(erc20Out) + getCount(erc20In),
            nft: getCount(nftOut) + getCount(nftIn),
          }));
        } catch (error) {
          console.error('Alchemy proxy error:', error);
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Alchemy API request failed' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'gzip' }),
    compression({ algorithm: 'brotliCompress' }),
    walletActivityDevProxy(),
  ],
  define: {
    global: 'globalThis',
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'thirdweb-core': ['thirdweb'],
          'thirdweb-react': ['thirdweb/react'],
          'thirdweb-wallets': ['thirdweb/wallets'],
          'thirdweb-chains': ['thirdweb/chains'],
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'analytics': ['react-ga4'],
        },
      },
    },
  },
})
