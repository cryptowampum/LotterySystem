// Vercel Serverless Proxy for Alchemy API
// Keeps ALCHEMY_API_KEY server-side only (no VITE_ prefix)

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ALCHEMY_API_KEY not configured' });
  }

  const { address } = req.body || {};
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid address' });
  }

  const networkUrl = process.env.ALCHEMY_NETWORK_URL || 'https://arb-mainnet.g.alchemy.com/v2';
  const alchemyUrl = `${networkUrl}/${apiKey}`;

  const makeRequest = (fromAddress, toAddress, category) =>
    fetch(alchemyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'alchemy_getAssetTransfers',
        params: [{
          ...(fromAddress ? { fromAddress } : {}),
          ...(toAddress ? { toAddress } : {}),
          category,
          maxCount: '0x1',
          withMetadata: false,
        }],
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

    const getCount = (result) => {
      const transfers = result?.result?.transfers;
      return Array.isArray(transfers) ? transfers.length : 0;
    };

    return res.status(200).json({
      transactions: getCount(txOut) + getCount(txIn),
      erc20: getCount(erc20Out) + getCount(erc20In),
      nft: getCount(nftOut) + getCount(nftIn),
    });
  } catch (error) {
    console.error('Alchemy API error:', error);
    return res.status(502).json({ error: 'Alchemy API request failed' });
  }
}
