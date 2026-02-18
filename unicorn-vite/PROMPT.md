# Unicorn.eth PolyPrize Collection - Implementation Reference

## Project Overview
A **production-ready soul-bound NFT claiming dapp** for the Unicorn.eth PolyPrize Collection lottery system. **Vite React app** using **ThirdWeb v5**, deployed on **Polygon mainnet** with **gasless transactions**. Optimized for conference mobile performance with unreliable WiFi.

## Production Status

- **Deployment**: https://app.polygon.ac (Vercel)
- **Network**: Polygon mainnet (Chain ID: 137), configurable via env
- **Contract**: ERC721 soul-bound, 10,000 max supply
- **Factory**: `0xD771615c873ba5a2149D5312448cE01D677Ee48A`

## Technical Stack

| Layer | Technology |
|---|---|
| Framework | Vite 7 + React 19 |
| Web3 | ThirdWeb v5 (single `thirdweb` package) |
| Styling | Tailwind CSS 3.4 |
| i18n | i18next + HTTP backend (English bundled, es/zh/ja lazy-loaded) |
| Analytics | Google Analytics 4 (react-ga4) |
| Hosting | Vercel with cache headers |

## Architecture

### File Structure
```
src/
├── App.jsx                    # Root: ThirdwebProvider, AutoConnect, lazy TopBar
├── main.jsx                   # Entry: StrictMode, ThemeProvider
├── i18n.js                    # English bundled, others via i18next-http-backend
├── index.css                  # Tailwind + CSS custom properties for theming
├── components/
│   ├── Header.jsx             # Title, description, NFTPreview (eager)
│   ├── MintingInterface.jsx   # Claiming logic + wallet cache (eager)
│   ├── NFTPreview.jsx         # NFT image with localStorage cache (eager)
│   ├── TopBar.jsx             # LanguageSelector + ThemeToggle (lazy)
│   ├── LanguageSelector.jsx   # 4-language dropdown
│   ├── ThemeToggle.jsx        # Dark/light toggle
│   └── SocialShareButton.jsx  # Platform share buttons (lazy)
├── config/
│   ├── thirdweb.config.js     # Client, chain, wallets, contract exports
│   └── theme.config.js        # Branding, colors, feature flags (env-driven)
├── contexts/
│   └── ThemeContext.jsx        # Dark mode with system preference detection
└── utils/
    ├── analytics.js           # GA4 event tracking
    ├── walletCache.js         # XOR+base64 obfuscated wallet session (24h TTL)
    └── nftCache.js            # NFT metadata cache (7-day TTL)

public/
├── sw.js                      # Service worker: cache-first static, network-first API
└── locales/{es,zh,ja}/        # Lazy-loaded translation files

index.html                     # Loading skeleton, preconnect hints, SW registration
vite.config.js                 # manualChunks splitting + gzip/brotli compression
vercel.json                    # Cache headers (immutable assets, 24h locales, no-cache SW)
```

### Authorization Flow
```
URL params check
  ├── No params → "Access Required" screen
  └── walletId=inApp&authCookie=... OR autoConnect=true
       ├── Cached wallet? → Show cached address + "Reconnecting..."
       └── No cache → "Looking for Wallet..." spinner
            ├── AutoConnect success → "authorized", cache wallet
            └── 15s timeout → "unauthorized", clear cache
```

### Connection States
| State | Trigger | UI |
|---|---|---|
| `no_autoconnect` | No URL params | Access Required instructions |
| `cached_reconnecting` | Has cached wallet + URL params | Cached address shown, reconnecting indicator |
| `checking` | URL params, no cache | Loading spinner |
| `authorized` | AutoConnect succeeds | Claim interface |
| `unauthorized` | 15s timeout | No Wallet Found |

## Mobile Performance Optimizations

### Bundle Splitting (vite.config.js)
```
react-vendor      ~12 KB    React + ReactDOM
thirdweb-core     ~404 KB   ThirdWeb SDK core
thirdweb-react    ~1,278 KB ThirdWeb React UI components
i18n-vendor       ~63 KB    i18next ecosystem
analytics         ~13 KB    react-ga4
App entry         ~300 B    Wiring only
```
All pre-compressed with gzip + brotli via `vite-plugin-compression2`.

### Caching Layers
| Layer | Strategy | TTL |
|---|---|---|
| Wallet session | localStorage, XOR+base64 obfuscated | 24 hours |
| NFT metadata | localStorage, plaintext JSON | 7 days |
| Static assets | Service worker, cache-first | Until SW version change |
| API/RPC calls | Service worker, network-first + cache fallback | Per response |
| Vite assets | HTTP `Cache-Control: immutable` | 1 year |
| Locales | HTTP `Cache-Control: public` | 24 hours |
| SW itself | HTTP `Cache-Control: no-cache` | Always fresh |

### Zero-JS First Paint (index.html)
- Inline CSS + branded skeleton (title, pulsing NFT placeholder, disabled button)
- `prefers-color-scheme: dark` support in inline CSS
- `<link rel="preconnect">` for ThirdWeb and IPFS origins
- Skeleton auto-hides via `#root:not(:empty)` CSS selector when React mounts
- Service worker registered on `window.load` (doesn't block paint)

## ThirdWeb v5 Requirements

```javascript
// Correct imports — always from sub-paths
import { createThirdwebClient, getContract, prepareContractCall } from "thirdweb";
import { ThirdwebProvider, useActiveAccount, useReadContract } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";

// Contract calls MUST use explicit function signatures
const { data } = useReadContract({
  contract,
  method: "function totalSupply() view returns (uint256)", // NOT just "totalSupply"
});

// Gas sponsorship via smartAccount config, NOT manual calls
const wallets = [inAppWallet({
  smartAccount: { factoryAddress, chain, gasless: true, sponsorGas: true }
})];
```

## Environment Variables

All prefixed with `VITE_` (Vite requirement).

| Variable | Required | Default |
|---|---|---|
| `VITE_THIRDWEB_CLIENT_ID` | Yes | — |
| `VITE_THIRDWEB_FACTORY_ADDRESS` | Yes | — |
| `VITE_CONTRACT_ADDRESS` | Yes | — |
| `VITE_APP_NETWORK_NAME` | No | `polygon` |
| `VITE_APP_NAME` | No | `PolyPrize` |
| `VITE_APP_EMOJI` | No | `🦄` |
| `VITE_PLATFORM_NAME` | No | `unicorn.eth` |
| `VITE_PRIZE_AMOUNT` | No | — |
| `VITE_SHARE_URL` | No | `https://app.polygon.ac` |
| `VITE_NFT_IMAGE_URL` | No | Falls back to on-chain tokenURI |
| `VITE_GA_MEASUREMENT_ID` | No | Disables analytics |

## Smart Contract Interface

```solidity
// User functions
function mint() external                              // Gasless, one per wallet
function hasMinted(address) view returns (bool)
function totalSupply() view returns (uint256)

// View functions
function MAX_SUPPLY() view returns (uint256)           // 10,000
function drawingDate() view returns (uint256)           // Unix timestamp
function isMintingActive() view returns (bool)
function paused() view returns (bool)
function tokenURI(uint256) view returns (string)

// Admin functions
function pause() / unpause()
function setDrawingDate(uint256)                       // Can only increase
function updateBaseURI(string)
function withdrawETH()
```

## Deployment

### Vercel Config (vercel.json)
- Build: `npm run build` → `dist/`
- Install: `npm install --legacy-peer-deps`
- SPA: `/(.*) → /index.html`
- Cache: `/assets/*` immutable 1yr, `/locales/*` 24h, `/sw.js` no-cache

### Build Verification
```bash
npm run build
# Confirm: multiple chunks, app entry < 1 KB, no errors
# Confirm: .gz and .br files generated for all assets
```

## Critical Lessons

1. **ThirdWeb v5**: Always explicit function signatures, always `--legacy-peer-deps`, imports from `thirdweb/*` sub-paths
2. **Vite**: `VITE_` prefix for env vars, `import.meta.env.DEV` not `process.env.NODE_ENV`
3. **Conference WiFi**: Cache everything possible, skeleton for instant paint, service worker for offline
4. **Wallet cache**: XOR obfuscation is appropriate for public addresses — prevents casual reading without crypto overhead
5. **i18n**: Bundle only the fallback language, lazy-load the rest

---

**Last Updated**: February 2026
**Status**: Production — optimized for ETHDenver 2026
